import { NextRequest, NextResponse } from "next/server";
import { MOCK_PRODUCTS } from "@/constants";
import { Product } from "@/types";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const start = searchParams.get("start") || "1";

    if (!query) return NextResponse.json(MOCK_PRODUCTS);

    try {
        const clientId = process.env.NAVER_CLIENT_ID;
        const clientSecret = process.env.NAVER_CLIENT_SECRET;

        // Create parallel fetch tasks for multiple platforms
        const tasks = [];

        // 1. Naver Shopping Task
        if (clientId && clientSecret) {
            tasks.push(fetch(
                `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=10&start=${start}`,
                { headers: { "X-Naver-Client-Id": clientId, "X-Naver-Client-Secret": clientSecret } }
            ).then(async res => {
                if (!res.ok) return [];
                const data = await res.json();
                return (data.items || []).map((item: any) => ({
                    id: `naver_${item.productId || Math.random()}`,
                    name: item.title.replace(/<[^>]*>?/gm, ''),
                    description: `${item.mallName} | 최저가`,
                    price: parseInt(item.lprice),
                    image: item.image,
                    url: item.link,
                    category: "Curation",
                    source: "Naver"
                }));
            }).catch(() => []));
        }

        // 2. Coupang Partners Task (Template)
        // Note: Real Coupang API requires HMAC signature. This represents the integration point.
        const coupangId = process.env.COUPANG_ACCESS_KEY;
        if (coupangId) {
            // Implementation for Coupang search would go here
            // tasks.push(fetchCoupangProducts(query));
        }

        // 3. LinkPrice Task (Template)
        const linkPriceId = process.env.LINKPRICE_ID;
        if (linkPriceId) {
            // Implementation for LinkPrice affiliate search would go here
            // tasks.push(fetchLinkPriceProducts(query));
        }

        const allResults = await Promise.all(tasks);
        const combinedProducts = allResults.flat();

        // Priority: Sort by source (Affiliate sources first) or Similarity
        if (combinedProducts.length > 0) {
            return NextResponse.json(combinedProducts);
        }

    } catch (error) {
        console.error("Multi-channel Search Error:", error);
    }

    return NextResponse.json(MOCK_PRODUCTS);
}
