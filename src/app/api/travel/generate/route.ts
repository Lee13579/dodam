import { geminiModel } from "@/lib/gemini";
import { searchNaverPlaces, TransformedPlace } from "@/lib/naver-search";
import { fetchAgodaHotels, AgodaHotel } from "@/lib/agoda-service";
import { fetchKlookProducts, KlookProduct } from "@/lib/klook-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { days, people, dogs, region, conditions } = await req.json();

    // 1. Parallel Fetching: Agoda (Hotel) + Klook (Activity) + Gemini Keywords (for Naver)
    // We want to secure "Money Making" items first.
    const agodaPromise = fetchAgodaHotels(`${region} 애견동반 호텔`, 1);
    const klookPromise = fetchKlookProducts(`${region} 애견동반`, 1);

    // Ask Gemini for complementary places (Cafe, Restaurant, Park) avoiding Hotels if possible
    const prompt = `
      You are a professional Pet Travel Planner in Korea.
      User Plan: ${days} trip to ${region} for ${people} people and ${dogs} dogs.
      Preferences: ${conditions}

      Task: Generate 3 distinct search queries to find the best generic places using Naver Maps.
      Focus on:
      1. A popular pet-friendly cafe
      2. A pet-friendly restaurant
      3. A scenic park or walking trail
      (Do NOT suggest Hotels, as we use Agoda for that)

      Output ONLY a JSON array of strings (Korean).
      Example: ["청담동 애견 카페", "도산공원 산책로", "압구정 애견동반 식당"]
    `;

    const geminiPromise = geminiModel.generateContent(prompt);

    const [agodaHotels, klookProducts, geminiResult] = await Promise.all([
      agodaPromise,
      klookPromise,
      geminiPromise
    ]);

    // 2. Transform Affiliate Data
    const affiliatePlaces: TransformedPlace[] = [];

    // Agoda -> TransformedPlace
    if (agodaHotels.length > 0) {
      const h = agodaHotels[0];
      affiliatePlaces.push({
        id: h.id,
        name: h.name,
        title: h.name,
        category: 'Hotel',
        address: `${region} (상세 주소 예약시 안내)`, // Agoda mock often lacks address, fill generic
        lat: 0, // Mock lat/lng or use region center if available. 
        lng: 0, // We will handle 0,0 in frontend or add random jitter later.
        description: h.description,
        imageUrl: h.imageUrl,
        price: h.price,
        originalPrice: h.originalPrice,
        rating: h.rating,
        reviewCount: h.reviewCount,
        bookingUrl: h.url,
        source: 'AGODA'
      });
    }

    // Klook -> TransformedPlace
    if (klookProducts.length > 0) {
      const k = klookProducts[0];
      affiliatePlaces.push({
        id: k.id,
        name: k.title,
        title: k.title,
        category: 'Park', // Map Activity to Park or create new 'Activity' category? Let's use Park for 'Play'
        address: `${region} 주요 관광지`,
        lat: 0,
        lng: 0,
        description: "티켓/액티비티 특가",
        imageUrl: k.imageUrl,
        price: k.price,
        originalPrice: k.originalPrice,
        rating: k.rating,
        reviewCount: k.reviewCount,
        bookingUrl: k.url,
        source: 'KLOOK'
      });
    }

    // 3. Process Gemini & Naver
    const response = await geminiResult.response;
    const text = response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let queries: string[] = [];
    try {
      queries = JSON.parse(cleanText);
    } catch (e) {
      queries = [`${region} 애견 카페`, `${region} 공원`, `${region} 맛집`];
    }

    // Fetch Naver
    const searchPromises = queries.map(query => searchNaverPlaces(query, 1));
    const searchResults = await Promise.all(searchPromises);
    const naverPlaces: TransformedPlace[] = searchResults.flat().filter(p => p !== undefined && p.id !== undefined).map(p => ({
      ...p,
      source: 'NAVER' as const
    }));

    // 4. Combine: Affiliate First, then Naver
    const allPlaces = [...affiliatePlaces, ...naverPlaces];

    // Assign generic coordinates to Affiliate items if they are 0,0 by using the first Naver item's location + offset
    // This cheats the map to show them near the destination
    const referencePlace = naverPlaces[0];
    if (referencePlace) {
      allPlaces.forEach((p, idx) => {
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