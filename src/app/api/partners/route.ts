import { NextRequest, NextResponse } from "next/server";
import { MOCK_PRODUCTS } from "@/constants";
import { Product } from "@/types";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
        return NextResponse.json(MOCK_PRODUCTS);
    }

    try {
        // --- NAVER SHOPPING API ---
        const NAVER_ID = process.env.NAVER_CLIENT_ID;
        const NAVER_SECRET = process.env.NAVER_CLIENT_SECRET;

        if (NAVER_ID && NAVER_SECRET) {
            const naverRes = await fetch(
                `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=8&filter=naverpay`,
                {
                    headers: {
                        "X-Naver-Client-Id": NAVER_ID,
                        "X-Naver-Client-Secret": NAVER_SECRET,
                    },
                }
            );

            if (naverRes.ok) {
                const data = await naverRes.json();
                const products: Product[] = data.items.map((item: any, index: number) => ({
                    id: `naver_${index}`,
                    name: item.title.replace(/<[^>]*>?/gm, ''), // Remove HTML tags
                    description: `${item.lprice}원 | ${item.mallName}`,
                    price: parseInt(item.lprice),
                    image: item.image,
                    url: item.link,
                    category: "Clothing"
                }));

                if (products.length > 0) return NextResponse.json(products);
            }
        }

        // --- COUPANG PARTNERS API (Template) ---
        // Coupang requires a more complex signature generation. 
        // If you have the keys, you can implement the HMAC-SHA256 signature here.
        /*
        const COUPANG_ACCESS_KEY = process.env.COUPANG_ACCESS_KEY;
        const COUPANG_SECRET_KEY = process.env.COUPANG_SECRET_KEY;
        if (COUPANG_ACCESS_KEY && COUPANG_SECRET_KEY) {
            // ... (Signature logic would go here)
        }
        */

    } catch (error) {
        console.error("Partners Search Error:", error);
    }

    // Fallback to mock products if API fails or no keys provided
    return NextResponse.json(MOCK_PRODUCTS);
}
