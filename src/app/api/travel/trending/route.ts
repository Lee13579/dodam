import { searchNaverPlaces } from "@/lib/naver-search";
import { generateTrendingTags, getNaverTrendingKeywords, getRegionalRanking } from "@/lib/naver-datalab";
import { NextResponse } from "next/server";
import { mirrorExternalImage } from "@/lib/image-mirror";

// In-memory cache for trending places to minimize API costs
let cachedTrending: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

export async function GET() {
    try {
        const currentTime = Date.now();

        // Fetch fresh data only if cache is empty or expired (1 hour)
        if (!cachedTrending || (currentTime - lastFetchTime > CACHE_DURATION)) {

            // 1. Get Regional Rankings (Top 1)
            let regionKeywords: string[] = [];
            try {
                const regionalRankings = await getRegionalRanking();
                regionKeywords = regionalRankings.length > 0
                    ? regionalRankings[0].keywords.slice(0, 2)
                    : [];
            } catch (e) {
                console.warn("Failed to fetch regional ranking", e);
            }

            // 2. Get General Trending Keywords
            let trendKeywords: string[] = [];
            try {
                trendKeywords = (await getNaverTrendingKeywords()).slice(0, 8);
            } catch (e) {
                console.warn("Failed to fetch trending keywords", e);
                trendKeywords = ["애견동반 여행", "강아지 운동장"]; // Fallback
            }

            // 3. Combine and Limit (Max 6 keywords to prevent timeout)
            const finalKeywords = [
                ...regionKeywords,
                ...trendKeywords
            ].slice(0, 6);

            const results = [];

            // 4. Parallel Execution in Chunks
            const CHUNK_SIZE = 3;
            for (let i = 0; i < finalKeywords.length; i += CHUNK_SIZE) {
                const chunk = finalKeywords.slice(i, i + CHUNK_SIZE);

                const chunkResults = await Promise.all(chunk.map(async (keyword) => {
                    try {
                        // Append "애견동반" for better accuracy
                        const searchStyle = keyword.includes('애견') || keyword.includes('반려') ? keyword : `${keyword} 애견동반`;

                        // Fetch max 2 places per keyword
                        const places = await searchNaverPlaces(searchStyle, 2);

                        // Pick the best place (pet friendly preferred)
                        const bestPlace = places.find(p => p.isPetFriendly) || places[0];

                        if (bestPlace) {
                            const tags = generateTrendingTags(bestPlace.name, bestPlace.category);

                            // Generate a stable pseudo-rating
                            const charCodeSum = bestPlace.title.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                            const stableRating = (4.5 + (charCodeSum % 5) / 10).toFixed(1);

                            // Mirror image to avoid 403 and ensure persistence
                            let mirroredUrl = bestPlace.imageUrl;
                            if (bestPlace.imageUrl && !bestPlace.imageUrl.startsWith('/')) {
                                try {
                                    mirroredUrl = await mirrorExternalImage(bestPlace.imageUrl);
                                } catch (err) {
                                    console.warn(`Mirroring failed for ${bestPlace.title}`, err);
                                }
                            }

                            return {
                                ...bestPlace,
                                imageUrl: mirroredUrl,
                                customDesc: `요즘 뜨는 "${keyword}"`,
                                tags: tags,
                                rating: stableRating
                            };
                        }
                    } catch (e) {
                        console.warn(`Failed to fetch for keyword: ${keyword}`, e);
                    }
                    return null;
                }));

                results.push(...chunkResults.filter(r => r !== null));

                // Delay between chunks to be nice to Naver API
                if (i + CHUNK_SIZE < finalKeywords.length) {
                    await new Promise(r => setTimeout(r, 200));
                }
            }

            cachedTrending = results;
            lastFetchTime = currentTime;
        }

        // Return random subset to keep UI fresh
        const randomSubset = [...(cachedTrending || [])]
            .sort(() => 0.5 - Math.random())
            .slice(0, 10);

        return NextResponse.json(randomSubset, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        console.error("Trending Fetch Error:", error);
        return NextResponse.json([], { status: 200 }); // Fail gracefully behavior
    }
}