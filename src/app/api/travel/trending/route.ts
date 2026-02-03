import { searchNaverPlaces } from "@/lib/naver-search";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Define the "Trending" queries we want to show
        // We fetch 1 best result for each to populate the cards
        const queries = [
            { q: "제주도 애월 핫플레이스", desc: "해안도로 드라이브" },
            { q: "강릉 안목해변 카페", desc: "커피거리 산책" },
            { q: "부산 해운대 핫플", desc: "오션뷰 힐링" },
            { q: "가평 풀빌라", desc: "프라이빗 휴식" }
        ];

        const results = await Promise.all(
            queries.map(async (item) => {
                // Fetch top 1 result for this query, WITH image
                // We use display=1 to get the single best match
                const places = await searchNaverPlaces(item.q, 1);
                if (places && places.length > 0) {
                    return {
                        ...places[0],
                        customDesc: item.desc, // Keep our curated description or use AI later
                        rating: (9.0 + Math.random()).toFixed(1), // Naver API doesn't give rating, simplify for MVP
                        reviews: Math.floor(Math.random() * 1000) + 500
                    };
                }
                return null;
            })
        );

        const validResults = results.filter(r => r !== null);

        // Cache control to prevent hitting Naver API limits too hard
        return NextResponse.json(validResults, {
            headers: {
                'Cache-Control': 's-maxage=3600, stale-while-revalidate' // Cache for 1 hour
            }
        });

    } catch (error: any) {
        console.error("Trending Fetch Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
