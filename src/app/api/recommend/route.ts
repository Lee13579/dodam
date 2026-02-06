import { geminiModel } from "@/lib/gemini";
import { getNaverShoppingTrends } from "@/lib/naver-datalab";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { image } = await req.json();
        if (!image) return NextResponse.json({ error: "이미지가 없습니다." }, { status: 400 });

        const base64Content = image.includes(",") ? image.split(",")[1] : image;

        // [네이버 API 극대화] 실시간 쇼핑 트렌드 데이터 수집
        const shoppingTrends = await getNaverShoppingTrends();
        const trendContext = shoppingTrends.join(", ");

        const prompt = `
당신은 전 세계 상위 1%의 반려견 패션 컨설턴트입니다. 
제공된 사진을 '초정밀 시각 스캔'하여 아이의 고유한 매력을 분석하고, 그 결과를 바탕으로 최상의 쇼핑 큐레이션을 제안하세요.

### 1단계: 초정밀 시각 분석 (Deep Scan)
- 털의 특징: 질감(곱슬, 직모, 장모 등), 색상(톤, 배색)
- 체형 및 골격: 다리 길이, 목 두께, 가슴 너비에 따른 핏(Fit) 예측
- 분위기: 시크함, 귀여움, 우아함, 스포티함 등 아이만의 페르소나 파악

### 2단계: 전략적 큐레이션 지시
- [중요] 쇼핑 API 최적화: 'searchKeyword'는 네이버 쇼핑이나 쿠팡에서 고퀄리티 실매물이 검색될 수 있는 '정확한 상업적 명칭'으로 작성하세요.
- 예: 단순히 "예쁜 옷" (X) -> "강아지 트위드 자켓 핑크" (O)
- 개수: 의류 5개, 액세서리 5개 (총 10개)를 반드시 제안하세요.
- 트렌드 반영: 현재 인기 키워드인 [${trendContext}]를 아이의 특징과 믹스하세요.

### 응답 구조 (JSON)
{
  "concepts": [
    {
      "id": "ai_1",
      "name": "아이의 페르소나 컨셉명",
      "description": "분석된 외형 특징에 근거한 추천 이유",
      "koreanAnalysis": "전문적인 시각 분석 결과 (털색, 체형, 분위기 등 3줄 요약)",
      "shoppingTip": "이 아이의 체형을 고려한 코디 꿀팁",
      "customPrompt": "English fashion pictorial prompt",
      "vtoOutfitEnglish": "Precise English description for AI fitting",
      "searchKeywords": ["대표 검색어"]
    }
  ],
  "suggestedClothes": [
    { "id": "cloth_1", "name": "아이템 명칭", "searchKeyword": "API 검색용 핵심 키워드", "description": "어울리는 이유 (다정한 말투)" }
    // ... 5개
  ],
  "suggestedAccessories": [
    { "id": "acc_1", "name": "소품 명칭", "searchKeyword": "API 검색용 핵심 키워드", "description": "포인트가 되는 이유" }
    // ... 5개
  ]
}
`;

        const result = await geminiModel.generateContent({
            contents: [{
                role: "user",
                parts: [
                    { inlineData: { data: base64Content, mimeType: "image/jpeg" } },
                    { text: prompt }
                ]
            }],
            generationConfig: {
                responseMimeType: "application/json",
                maxOutputTokens: 4000,
                temperature: 0.4,
            },
        });

        const response = await result.response;
        let text = response.text();
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) text = text.substring(startIdx, endIdx + 1);

        try {
            const cleanedText = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
            const data = JSON.parse(cleanedText);
            return NextResponse.json(data);
        } catch (e: any) {
            return NextResponse.json({ error: "해석 실패", details: e.message }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: "API 오류", details: error.message }, { status: 500 });
    }
}
