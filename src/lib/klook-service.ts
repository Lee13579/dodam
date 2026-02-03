
export interface KlookProduct {
    id: string;
    title: string;
    price: number;
    originalPrice: number;
    imageUrl: string;
    url: string;
    rating: number;
    reviewCount: number;
}

export async function fetchKlookProducts(query: string, limit: number = 4): Promise<KlookProduct[]> {
    const CLIENT_ID = process.env.KLOOK_PARTNER_ID;
    const CLIENT_SECRET = process.env.KLOOK_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
        // console.warn("Missing Klook Credentials - Returning Mock Data");
        return getMockKlookData(query, limit);
    }

    try {
        // --- REAL API IMPLEMENTATION (Placeholder) ---
        // 1. Get Access Token (Client Credentials Flow)
        // const tokenRes = await fetch("https://api.klook.com/v1/oauth/token", { ... });
        // const token = (await tokenRes.json()).access_token;

        // 2. Search Activities
        // const searchRes = await fetch(`https://api.klook.com/v1/products?query=${query}`, {
        //     headers: { Authorization: `Bearer ${token}` }
        // });

        // return parseKlookResponse(await searchRes.json());

        // For now, fall back to mock until keys are provided
        return getMockKlookData(query, limit);

    } catch (e) {
        console.error("Klook API Error", e);
        return getMockKlookData(query, limit);
    }
}

function getMockKlookData(query: string, limit: number): KlookProduct[] {
    const mockImages = [
        "https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571896349842-6e5a5dd97a7e?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop"
    ];

    return Array.from({ length: limit }).map((_, i) => ({
        id: `klook_mock_${i}`,
        title: `[클록/특가] ${query} 패키지 ${i + 1}`,
        price: 45000 + (i * 5000),
        originalPrice: 60000 + (i * 5000),
        imageUrl: mockImages[i % mockImages.length],
        url: 'https://www.klook.com',
        rating: 4.8,
        reviewCount: 120 + (i * 30)
    }));
}
