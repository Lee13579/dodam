import { geminiModel } from "@/lib/gemini";
import { searchNaverPlaces, TransformedPlace } from "@/lib/naver-search";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { days, people, dogs, region, conditions } = await req.json();

    // 1. Gemini에게 검색 키워드 생성을 요청합니다.
    // 장소 ID를 묻는 것이 아니라, "검색할 단어"를 묻습니다.
    const prompt = `
      You are a professional Pet Travel Planner in Korea.
      User Plan: ${days} trip to ${region} for ${people} people and ${dogs} dogs.
      Preferences: ${conditions}

      Task: Generate 4 distinct search queries to find the best places using Naver Maps.
      Include a mix of:
      1. A pet-friendly hotel/pension (if overnight)
      2. A pet-friendly cafe
      3. A nice park or walking trail
      4. A pet-friendly restaurant

      Output ONLY a JSON array of strings (Korean).
      Example: ["강남구 애견동반 호텔", "청담동 애견 카페", "도산공원", "압구정 애견동반 식당"]
    `;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let queries: string[] = [];
    try {
      queries = JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parse Failed, using fallback queries");
      queries = [`${region} 애견동반 호텔`, `${region} 애견 카페`, `${region} 공원`, `${region} 맛집`];
    }

    // 2. 생성된 키워드로 네이버 API를 병렬 호출합니다.
    // 각 키워드당 1개의 베스트 장소만 가져오도록 설정 (display: 1)
    const searchPromises = queries.map(query => searchNaverPlaces(query, 1));
    const searchResults = await Promise.all(searchPromises);

    // 3. 결과 평탄화 (2차원 배열 -> 1차원 배열)
    // 빈 결과 제거
    const places: TransformedPlace[] = searchResults.flat().filter(p => p !== undefined && p.id !== undefined);

    // 4. 결과 반환 (ID 리스트가 아닌, 장소 객체 리스트 자체를 반환합니다!)
    return NextResponse.json(places);

  } catch (error: any) {
    console.error("Course Generation Error:", error);
    return NextResponse.json({
      error: "Failed to generate course",
      details: error.message
    }, { status: 500 });
  }
}