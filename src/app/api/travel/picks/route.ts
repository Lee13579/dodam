
import { searchNaverPlaces } from "@/lib/naver-search";
import { generateTrendingTags } from "@/lib/naver-datalab";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Define themed collections
const THEMES = [
    {
        id: 'resort',
        title: '우리 아이랑 호캉스 🏨',
        subtitle: '럭셔리한 휴식',
        queries: ["애견동반 5성급 호텔", "애견동반 풀빌라", "반려견 리조트"]
    },
    {
        id: 'nature',
        title: '자연 속 힐링 캠핑 ⛺️',
        subtitle: '별 보며 불멍',
        queries: ["애견전용 캠핑장", "애견동반 글램핑", "반려견 숲속 펜션"]
    },
    {
        id: 'play',
        title: '신나는 운동장 & 카페 🐾',
        subtitle: '마음껏 뛰어놀개',
        queries: ["애견 운동장 카페", "대형견 동반 카페", "반려견 수영장"]
    }
];

export async function GET() {
    try {
        // 1. Try to read from local seeded DB
        const dataPath = path.join(process.cwd(), 'src/data/places.json');

        if (fs.existsSync(dataPath)) {
            const fileContent = fs.readFileSync(dataPath, 'utf-8');
            const db = JSON.parse(fileContent);

            // Transform DB format back to API response format
            const results = THEMES.map(theme => ({
                ...theme,
                items: (db[theme.id] || []).slice(0, 6).map((item: any) => ({
                    ...item,
                    // Re-randomize badges slightly to feel dynamic on refresh
                    badge: item.badge || ['인기', '추천', 'HOT'][Math.floor(Math.random() * 3)],
                    tags: item.tags || generateTrendingTags(item.title, item.category)
                }))
            }));

            return NextResponse.json(results, {
                headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' }
            });
        }

        // 2. Fallback: Fetch recommendations for each theme (Live API)
        const results = await Promise.all(
            THEMES.map(async (theme) => {
                // Select a random query from the theme to keep results fresh
                const randomQuery = theme.queries[Math.floor(Math.random() * theme.queries.length)];
                const places = await searchNaverPlaces(randomQuery, 3);

                return {
                    ...theme,
                    items: places.map(place => ({
                        ...place,
                        rating: (9.0 + Math.random()).toFixed(1),
                        reviews: Math.floor(Math.random() * 500) + 100,
                        badge: ['인기', '추천', 'NEW'][Math.floor(Math.random() * 3)],
                        tags: generateTrendingTags(place.title, place.category)
                    }))
                };
            })
        );

        return NextResponse.json(results, {
            headers: {
                'Cache-Control': 's-maxage=3600, stale-while-revalidate'
            }
        });

    } catch (error: any) {
        console.error("Picks Fetch Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
