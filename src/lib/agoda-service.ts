
export interface AgodaHotel {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    imageUrl: string;
    url: string;
    rating: number;
    reviewCount: number;
    stars: number;
}

export async function fetchAgodaHotels(query: string, limit: number = 4): Promise<AgodaHotel[]> {
    const API_KEY = process.env.AGODA_API_KEY;
    const SITE_ID = process.env.AGODA_SITE_ID;

    if (!API_KEY || !SITE_ID) {
        // console.warn("Missing Agoda Credentials - Returning Mock Data");
        return getMockAgodaData(query, limit);
    }

    try {
        // --- REAL API IMPLEMENTATION (Placeholder) ---
        // Agoda has multiple APIs (Search, Data Feed, Pricing).
        // Typically requires constructing a request with Authorization header:
        // Authorization: site_id={SITE_ID}:api_key={API_KEY}

        // const res = await fetch(`https://api.agoda.com/xml/v1/search/xmlsearch.xml`, {
        //     method: 'POST',
        //     headers: { 
        //         'Authorization': `site_id=${SITE_ID}:api_key=${API_KEY}`,
        //         'Content-Type': 'application/xml'
        //     },
        //     body: `<SearchRequest>...</SearchRequest>`
        // });

        // return parseAgodaXML(await res.text());

        return getMockAgodaData(query, limit);

    } catch (e) {
        console.error("Agoda API Error", e);
        return getMockAgodaData(query, limit);
    }
}

function getMockAgodaData(query: string, limit: number): AgodaHotel[] {
    const mockImages = [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571896349842-6e5a5dd97a7e?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=400&auto=format&fit=crop"
    ];

    return Array.from({ length: limit }).map((_, i) => ({
        id: `agoda_mock_${i}`,
        name: `[아고다/특가] ${query} 럭셔리 호텔 ${i + 1}`,
        description: "조식 포함 | 무료 취소 가능",
        price: 120000 + (i * 15000),
        originalPrice: 180000 + (i * 15000),
        imageUrl: mockImages[i % mockImages.length],
        url: 'https://www.agoda.com',
        rating: 4.5 + (Math.random() * 0.5),
        reviewCount: 200 + (i * 50),
        stars: 5
    }));
}
