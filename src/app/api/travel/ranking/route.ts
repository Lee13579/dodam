import { getRegionalRanking } from "@/lib/naver-datalab";
import { NextResponse } from "next/server";

// Cache ranking for 6 hours as trends don't change that fast
const CACHE_DURATION = 1000 * 60 * 60 * 6;
let cachedRanking: any = null;
let lastFetchTime = 0;

export async function GET() {
    const currentTime = Date.now();

    if (!cachedRanking || (currentTime - lastFetchTime > CACHE_DURATION)) {
        try {
            const rankings = await getRegionalRanking();

            // Normalize ratio to percentage (highest = 100%)
            const maxRatio = Math.max(...rankings.map(r => r.ratio));
            const formattedRankings = rankings.map((r, idx) => ({
                rank: idx + 1,
                region: r.region.split('/')[0], // "강릉/속초" -> "강릉"
                ratio: Math.round((r.ratio / maxRatio) * 100),
                keywords: r.keywords
            }));

            cachedRanking = formattedRankings;
            lastFetchTime = currentTime;
        } catch (error) {
            console.error("Ranking API Error:", error);
            // Fallback data
            cachedRanking = [
                { rank: 1, region: "강릉", ratio: 95 },
                { rank: 2, region: "제주", ratio: 88 },
                { rank: 3, region: "부산", ratio: 72 },
                { rank: 4, region: "경주", ratio: 65 },
                { rank: 5, region: "여수", ratio: 50 }
            ];
        }
    }

    return NextResponse.json(cachedRanking, {
        headers: { 'Cache-Control': 'public, s-maxage=21600' }
    });
}
