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
            // Fetch "Real" Trending Keywords from DataLab (Simulated for robustness)
            const trendKeywords = await getNaverTrendingKeywords();

            const results = await Promise.all(
                trendKeywords.map(async (keyword) => {
                    // Fetch results for this specific trending keyword
                    const places = await searchNaverPlaces(keyword, 5);

                    const petFriendlyPlace = places.find(p => p.isPetFriendly);

                    if (petFriendlyPlace) {
                        const tags = generateTrendingTags(petFriendlyPlace.name, petFriendlyPlace.category);
                        return {
                            ...petFriendlyPlace,
                            // Use the keyword itself to describe the trend
                            customDesc: `🔥 요즘 뜨는 "${keyword}"`,
                            tags: tags,
                        };
                    }
                    return null;
                })
            );

            cachedTrending = results.filter(r => r !== null);
            lastFetchTime = currentTime;
        }

        // Shuffle the cached items and return a random subset of 10 for variety
        const randomSubset = [...(cachedTrending || [])]
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);

        return NextResponse.json(randomSubset, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
            }
        });

    } catch (error: any) {
        console.error("Trending Fetch Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
