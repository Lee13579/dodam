import { searchNaverPlaces } from "@/lib/naver-search";
import { generateTrendingTags, getNaverTrendingKeywords } from "@/lib/naver-datalab";
import { NextResponse } from "next/server";

// In-memory cache for trending places to minimize API costs
let cachedTrending: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

export async function GET() {
    try {
        const currentTime = Date.now();

        // Fetch fresh data only if cache is empty or expired (1 hour)
        if (!cachedTrending || (currentTime - lastFetchTime > CACHE_DURATION)) {
            const trendKeywords = (await getNaverTrendingKeywords()).slice(0, 8);
            const results = [];

            // Execute sequentially to avoid Naver API rate limits (Too Many Requests)
            for (const keyword of trendKeywords) {
                try {
                    const places = await searchNaverPlaces(keyword, 3);
                    const isPetKeyword = keyword.includes('애견') || keyword.includes('반려');
                    const bestPlace = places.find(p => p.isPetFriendly) || (isPetKeyword ? places[0] : null);

                    if (bestPlace) {
                        const tags = generateTrendingTags(bestPlace.name, bestPlace.category);
                        
                        // Generate stable rating based on title
                        const charCodeSum = bestPlace.title.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                        const stableRating = (4.5 + (charCodeSum % 5) / 10).toFixed(1);

                        results.push({
                            ...bestPlace,
                            customDesc: `요즘 뜨는 "${keyword}"`,
                            tags: tags,
                            rating: stableRating
                        });
                    }
                    // Small breathing room for API
                    await new Promise(r => setTimeout(r, 100));
                } catch (e) {
                    console.warn(`Failed to fetch for keyword: ${keyword}`, e);
                }
            }

            cachedTrending = results;
            lastFetchTime = currentTime;
        }

        const randomSubset = [...(cachedTrending || [])]
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);

        return NextResponse.json(randomSubset, {
            headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59' }
        });

    } catch (error: any) {
        console.error("Trending Fetch Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}