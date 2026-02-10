import { createClient } from '@supabase/supabase-js';
import { searchNaverPlaces } from "@/lib/naver-search";
import { generateTrendingTags } from "@/lib/naver-datalab";
import { NextResponse } from "next/server";
import { mirrorExternalImage } from "@/lib/image-mirror";

// Supabase Admin Client (using Service Role for write access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && serviceRoleKey)
    ? createClient(supabaseUrl, serviceRoleKey)
    : null as any;

import { getSmartSeasonalTheme } from "@/lib/naver-datalab";

// ... (imports)

// Note: We need to make this async or handle it inside the GET since getSmartSeasonalTheme is async
// But THEMES constant was static. We need to reconstruct THEMES inside the handler or make a dynamic getter.

const STATIC_THEMES = [
    { id: 'resort', title: '우리 아이 호캉스 🏨', subtitle: '따뜻한 실내에서 즐기는 프리미엄 휴식', queries: ["애견동반 호텔", "반려견 동반 리조트", "애견 풀빌라"] },
    { id: 'dining', title: '함께 즐기는 미식 🍴', subtitle: '반려견과 편안하게 식사할 수 있는 맛집과 카페', queries: ["반려견 동반 식당", "애견 동반 브런치", "강아지 가능 카페", "애견 동반 바베큐"] },
    { id: 'play', title: '오프리쉬 자유시간 🐾', subtitle: '활동적인 아이들을 위한 최적의 놀이 코스', queries: ["애견 운동장", "강아지 수영장", "애견 테마파크", "반려견 축제"] }
];

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const isLocationAvailable = lat && lng;

        const seasonalTheme = await getSmartSeasonalTheme();
        const themes = [
            ...STATIC_THEMES,
            { id: 'nature', ...seasonalTheme }
        ];

        const results = [];

        for (const theme of themes) {
            // ... (rest of the logic)
            // 1. Try to fetch from Supabase first
            let queryBuilder = supabaseAdmin.from('places').select('*').eq('theme_id', theme.id);

            // If location is available, order by distance (simplified using Pythagoras since Korea is small)
            if (isLocationAvailable) {
                // Note: Real PostGIS would be better, but for small datasets we can sort by simple diff
                // Here we fetch a slightly larger pool and sort in JS, or use a RPC if DB supports it.
                queryBuilder = queryBuilder.limit(100);
            } else {
                queryBuilder = queryBuilder.limit(20);
            }

            const { data: existingPlaces, error: fetchError } = await queryBuilder;

            let finalPlaces = existingPlaces || [];

            if (isLocationAvailable && finalPlaces.length > 0) {
                finalPlaces = finalPlaces.sort((a: any, b: any) => {
                    const distA = Math.pow(parseFloat(a.lat) - parseFloat(lat!), 2) + Math.pow(parseFloat(a.lng) - parseFloat(lng!), 2);
                    const distB = Math.pow(parseFloat(b.lat) - parseFloat(lat!), 2) + Math.pow(parseFloat(b.lng) - parseFloat(lng!), 2);
                    return distA - distB;
                }).slice(0, 10);
            } else {
                finalPlaces = finalPlaces.slice(0, 10);
            }

            // [NEW] Mirror images for DB items too, just in case they are old or external
            const mirroredFinalPlaces = await Promise.all(finalPlaces.map(async (p: any) => {
                if (p.imageUrl && !p.imageUrl.startsWith('/') && !p.imageUrl.includes('supabase.co')) {
                    const mirrored = await mirrorExternalImage(p.imageUrl);
                    return { ...p, imageUrl: mirrored };
                }
                return p;
            }));

            if (!fetchError && mirroredFinalPlaces.length >= 10) {
                results.push({
                    ...theme,
                    title: isLocationAvailable && theme.id === 'resort' ? `내 주변 호캉스 📍` : theme.title,
                    items: mirroredFinalPlaces
                });
                continue;
            }

            // 2. Fallback: Fetch from Naver if not enough data in DB
            console.log(`Insufficient data for ${theme.id} (${finalPlaces.length}/10). Fetching from Naver...`);
            let allPlaces: any[] = [];
            // If location is available, inject neighborhood into query
            const searchQueryPrefix = isLocationAvailable && theme.id === 'resort' ? '내 주변 ' : '';

            for (const query of theme.queries.slice(0, 3)) {
                if (allPlaces.length >= 15) break;
                const places = await searchNaverPlaces(searchQueryPrefix + query, 10);
                allPlaces = [...allPlaces, ...places];
                await new Promise(r => setTimeout(r, 200));
            }

            const processedItems = await Promise.all(
                Array.from(new Map(allPlaces.map((p: any) => [p.title, p])).values())
                    .slice(0, 10)
                    .map(async (place: any) => {
                        const charCodeSum = place.title.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                        // Image is already handled by searchNaverPlaces (returns Naver URL or Placeholder)
                        // But let's verify if mirrorExternalImage is needed. 
                        // Actually searchNaverPlaces returns a direct URL or local path.
                        // mirrorExternalImage handles 'http' urls. Let's keep it safe but it might be redundant.
                        const mirroredUrl = place.imageUrl.startsWith('/') ? place.imageUrl : await mirrorExternalImage(place.imageUrl || '');

                        return {
                            id: place.id,
                            title: place.title,
                            address: place.address,
                            category: place.category,
                            imageUrl: mirroredUrl,
                            rating: parseFloat((4.5 + (charCodeSum % 5) / 10).toFixed(1)),
                            reviewCount: 100 + (charCodeSum % 800),
                            lat: place.lat,
                            lng: place.lng,
                            tags: generateTrendingTags(place.title, place.category),
                            theme_id: theme.id
                        };
                    })
            );

            // 3. Save new items to Supabase
            if (processedItems.length > 0) {
                await supabaseAdmin.from('places').upsert(processedItems, { onConflict: 'id' });
            }

            results.push({ ...theme, items: processedItems });
        }

        return NextResponse.json(results, {
            headers: { 'Cache-Control': 'public, s-maxage=3600' }
        });

    } catch (error: any) {
        console.error("Picks Supabase Engine Error:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}