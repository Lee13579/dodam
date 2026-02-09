import { NextRequest, NextResponse } from "next/server";
import { MOCK_PRODUCTS } from "@/constants";

const MOCK_COUPANG_PRODUCTS = [
    { id: 'cp_1', name: 'Premium Dog Hoodie', price: 25000, image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500', url: 'https://coupang.com', source: 'Coupang', category: 'Clothing', description: 'Cozy winter hoodie for small dogs' },
    { id: 'cp_2', name: 'Luxury Leather Leash', price: 45000, image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=500', url: 'https://coupang.com', source: 'Coupang', category: 'Accessory', description: 'Handcrafted leather leash' }
];

const MOCK_LINKPRICE_PRODUCTS = [
    { id: 'lp_1', name: 'Organic Dog Treats', price: 12000, image: 'https://images.unsplash.com/photo-1581888227599-77981198520d?auto=format&fit=crop&w=500', url: 'https://linkprice.com', source: 'LinkPrice', category: 'Grooming', description: 'Healthy organic snacks' },
    { id: 'lp_2', name: 'Soft Pet Bed', price: 38000, image: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=500', url: 'https://linkprice.com', source: 'LinkPrice', category: 'Accessory', description: 'Cloud-like comfort bed' }
];

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const start = searchParams.get("start") || "1";

    if (!query) return NextResponse.json(MOCK_PRODUCTS);

    try {
        const clientId = process.env.NAVER_CLIENT_ID;
        const clientSecret = process.env.NAVER_CLIENT_SECRET;

        // Clean query: remove generic words to improve specificity if query is long
        let cleanQuery = query;
        if (query.length > 20) {
            cleanQuery = query.replace(/(dog|puppy|pet|wear|clothes|outfit)/gi, "").trim();
        }

        const tasks = [];

        // 1. Naver Shopping (Real API)
        if (clientId && clientSecret) {
            tasks.push(fetch(
                `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(cleanQuery)}&display=10&start=${start}&sort=sim`,
                { headers: { "X-Naver-Client-Id": clientId, "X-Naver-Client-Secret": clientSecret } }
            ).then(async res => {
                if (!res.ok) return [];
                const data = await res.json();
                return (data.items || []).map((item: any) => ({
                    id: `naver_${item.productId}`,
                    name: item.title.replace(/<[^>]*>?/gm, ''),
                    description: `${item.mallName}`,
                    price: parseInt(item.lprice),
                    image: item.image,
                    url: item.link,
                    category: cleanQuery.includes("옷") || cleanQuery.includes("의류") ? "Clothing" : "Accessory",
                    source: "Naver",
                    mallName: item.mallName
                }));
            }).catch(e => {
                console.error("Naver Shopping Fetch Error:", e);
                return [];
            }));
        }

        // 2. Coupang Partners (Mock for now)
        // In real impl, check title match with query
        tasks.push(Promise.resolve(MOCK_COUPANG_PRODUCTS.filter(p => p.name.toLowerCase().includes(cleanQuery.toLowerCase()) || true).slice(0, 2)));

        // 3. LinkPrice (Mock for now)
        tasks.push(Promise.resolve(MOCK_LINKPRICE_PRODUCTS.filter(p => p.name.toLowerCase().includes(cleanQuery.toLowerCase()) || true).slice(0, 2)));

        const allResults = await Promise.all(tasks);
        const combinedProducts = allResults.flat();

        // Fallback if no results
        if (combinedProducts.length === 0) {
            return NextResponse.json(MOCK_PRODUCTS);
        }

        // KEEP RELEVANCE: Do not shuffle. Naver's 'sim' (similarity) sort is valuable.
        // We just return them in the order they were fetched/combined.
        return NextResponse.json(combinedProducts);

    } catch (error) {
        console.error("Multi-channel Search Error:", error);
        return NextResponse.json(MOCK_PRODUCTS);
    }
}
