import { geminiModel } from "@/lib/gemini";
import { searchNaverPlaces, TransformedPlace } from "@/lib/naver-search";
import { fetchAgodaHotels } from "@/lib/agoda-service";
import { fetchKlookProducts } from "@/lib/klook-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { days, people, dogs, region, conditions } = await req.json();

    // 1. Parallel Fetching: Agoda (Hotel) + Klook (Activity) + Gemini Keywords (for Naver)
    // We want to secure "Money Making" items first.
    const agodaPromise = fetchAgodaHotels(`${region} 애견동반 호텔`, 1);
    const klookPromise = fetchKlookProducts(`${region} 애견동반`, 1);

    // Ask Gemini for a structured One-Day Course (Morning -> Lunch -> Cafe -> Dinner/Walk)
    const prompt = `
      You are a professional Pet Travel Planner in Korea.
      User Plan: ${days} trip to ${region} for ${people} people and ${dogs} dogs.
      Preferences: ${conditions}

      Task: Create a perfect "One-Day Pet Travel Course" timeline.
      - Do NOT suggest Hotels/Resorts (we already have accommodation).
      - Focus on 3-4 key stops: Lunch, Cafe, and a Walking Spot/Activity.
      - Ensure the route is logical for a single day.

      Output ONLY a JSON array of objects:
      [
        {
          "query": "Naver Search Query (e.g., '가평 애견동반 닭갈비')",
          "type": "Lunch" | "Cafe" | "Activity" | "Dinner",
          "time": "Suggested Time (e.g., '12:00')",
          "title": "Display Title (e.g., '남이섬 꼬꼬춘천닭갈비')",
          "reason": "Why this place fits the user's preference (Korean, 1 sentence)",
          "petTip": "Specific tip for dog owners (e.g., '테라스석만 가능해요', '오프리쉬 가능', '기저귀 필수') (Korean)"
        },
        ...
      ]
    `;

    const geminiPromise = geminiModel.generateContent(prompt);

    const [agodaHotels, klookProducts, geminiResult] = await Promise.all([
      agodaPromise,
      klookPromise,
      geminiPromise
    ]);

    // 2. Transform Affiliate Data
    const affiliatePlaces: TransformedPlace[] = [];

    // ... (Agoda & Klook processing remains the same) ...
    // Agoda -> TransformedPlace
    if (agodaHotels.length > 0) {
      const h = agodaHotels[0];
      affiliatePlaces.push({
        id: h.id,
        name: h.name,
        title: h.name,
        category: 'Hotel',
        address: `${region} (상세 주소 예약시 안내)`,
        lat: 0,
        lng: 0,
        description: h.description,
        imageUrl: h.imageUrl,
        price: h.price,
        originalPrice: h.originalPrice,
        rating: h.rating,
        reviewCount: h.reviewCount,
        bookingUrl: h.url,
        source: 'AGODA',
        isPetFriendly: true // Explicitly mark Agoda items as pet friendly
      });
    }

    // Klook -> TransformedPlace
    if (klookProducts.length > 0) {
        const k = klookProducts[0];
        affiliatePlaces.push({
          id: k.id,
          name: k.title,
          title: k.title,
          category: 'Activity', 
          address: `${region} 주요 명소`,
          lat: 0,
          lng: 0,
          description: "티켓/액티비티 특가",
          imageUrl: k.imageUrl,
          price: k.price,
          originalPrice: k.originalPrice,
          rating: k.rating,
          reviewCount: k.reviewCount,
          bookingUrl: k.url,
          source: 'KLOOK',
          isPetFriendly: true
        });
      }

    // 3. Process Gemini & Naver
    const response = await geminiResult.response;
    const text = response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let courseItems: any[] = [];
    try {
        courseItems = JSON.parse(cleanText);
        if (!Array.isArray(courseItems)) throw new Error("Not an array");
    } catch (e) {
        // Fallback
        courseItems = [
            { query: `${region} 애견동반 식당`, type: 'Lunch', time: '12:00', title: '현지 맛집', reason: '현지인 추천 맛집입니다.', petTip: '이동가방을 지참해주세요.' },
            { query: `${region} 애견 카페`, type: 'Cafe', time: '14:00', title: '감성 카페', reason: '사진 찍기 좋은 카페입니다.', petTip: '실내 입장이 가능합니다.' },
            { query: `${region} 산책로`, type: 'Activity', time: '16:00', title: '힐링 산책', reason: '여유롭게 걷기 좋아요.', petTip: '리드줄 착용 필수입니다.' }
        ];
    }

    // Naver Places API fetch for each course item
    // We Map Gemini's structured data to actual Naver Search results
    const searchPromises = courseItems.map(async (item) => {
        const results = await searchNaverPlaces(item.query, 1);
        if (results && results.length > 0) {
            const place = results[0];
            return {
                ...place,
                source: 'NAVER' as const,
                // Enrich with Gemini's Context
                category: item.type, // Override category with Timeline type (Lunch, Cafe, etc)
                description: item.reason, // Use Gemini's reason as description
                petTip: item.petTip, // [NEW] Custom field
                visitTime: item.time, // [NEW] Custom field
                displayTitle: item.title // [NEW] Gemini's nice title
            };
        }
        return null;
    });

    const searchResults = await Promise.all(searchPromises);
    const naverPlaces = searchResults.filter(p => p !== null) as TransformedPlace[];

    // 4. Combine: Affiliate First (Hotel/Ticket), then The Course
    // We might want to insert Hotel at the end or as a "Basecamp"
    const allPlaces = [...affiliatePlaces, ...naverPlaces];

    // Assign generic coordinates to Affiliate items if they are 0,0 by using the first Naver item's location + offset
    // This cheats the map to show them near the destination
    const referencePlace = naverPlaces[0];
    if (referencePlace) {
      allPlaces.forEach((p) => {
        if (p.lat === 0 && p.lng === 0) {
          // Add slight jitter so they don't stack exactly
          p.lat = referencePlace.lat + (Math.random() * 0.01 - 0.005);
          p.lng = referencePlace.lng + (Math.random() * 0.01 - 0.005);
        }
      });
    }

    return NextResponse.json(allPlaces);

  } catch (error: any) {
    console.error("Course Generation Error:", error);
    return NextResponse.json({
      error: "Failed to generate course",
      details: error.message
    }, { status: 500 });
  }
}