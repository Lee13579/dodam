import { geminiModel } from "@/lib/gemini";
import { getNaverShoppingTrends } from "@/lib/naver-datalab";
import { NextRequest, NextResponse } from "next/server";
import { RecommendationSchema } from "@/lib/validations";
import listLimiter from "@/lib/rate-limit";

const limiter = listLimiter({ uniqueTokenPerInterval: 500, interval: 60000 });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { isRateLimited } = limiter.check(10, ip);

  if (isRateLimited) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const validation = RecommendationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid Input", details: validation.error.format() }, { status: 400 });
    }
    const { image } = validation.data;

    const base64Content = image.includes(",") ? image.split(",")[1] : image;

    // [네이버 API 극대화] 실시간 쇼핑 트렌드 데이터 수집
    const shoppingTrends = await getNaverShoppingTrends();
    const trendContext = shoppingTrends.join(", ");

    const prompt = `
당신은 대한민국 최고의 반려견 스타일 전문가입니다. 사진 속 강아지를 분석하고, 현재 대한민국 반려동물 패션 트렌드[${trendContext}]를 반영하여 최적의 스타일을 제안하세요.

### 작업 1: 화보 컨셉 제안 (스타일 모드용)
- **[K-로컬 감성]**: 한국의 장소와 정서를 담은 3가지 화보 컨셉을 제안하세요. (예: 성수동 힙스터, 제주도 감귤소년, 경복궁 산책 등)
- **[이미지 생성용 프롬프트]**: 각 컨셉별로 AI가 화보를 생성할 수 있는 상세한 영어 프롬프트(customPrompt)를 작성하세요.

### 작업 2: 트렌드 아이템 큐레이션 (피팅 모드용)
- 현재 인기 있는 트렌드[${trendContext}] 중 이 강아지에게 가장 잘 어울릴 법한 의류 5개, 소품 5개를 '스타일 아이템'으로 제안하세요.
- **[중요] 특정 브랜드명을 언급하지 마세요.** 대신 '누빔 조끼', '파스텔 톤 가디건', '벨벳 소재 리본' 등 디자인과 질감 위주로 명칭을 정하세요.
- **[일관성 초강력 지시]**: `visualPrompt`로 생성될 이미지의 시각적 특징(색상, 소재, 핏)과 `searchKeyword`는 반드시 **100% 일치**해야 합니다. 그래야 사용자가 선택한 AI 이미지와 나중에 추천될 실제 상품이 완벽히 매칭됩니다. (예: 그림이 "노란 패딩"이면 검색어도 "강아지 노란 패딩")

### 필독: 응답 데이터 구조 (JSON)
{
  "personalColor": "#HexCode",
  "concepts": [
    {
      "id": "style_1",
      "name": "컨셉 이름",
      "description": "추천 이유",
      "koreanAnalysis": "아이의 특징 분석 및 스타일링 추천 (한글 3-4줄)",
      "shoppingTip": "코디 팁",
      "customPrompt": "Detailed English prompt for image generation",
      "vtoOutfitEnglish": "English description of the outfit only for VTO",
      "searchKeywords": ["실제 제품 검색을 위한 키워드1", "키워드2"]
    },
    ...
  ],
  "suggestedClothes": [
    { 
      "id": "cloth_1", 
      "name": "트렌디 아이템 명칭", 
      "searchKeyword": "검색 키워드", 
      "description": "추천 이유",
      "visualPrompt": "A high-end fashion magazine style photography of a cute representative dog (like a Poodle or Maltese) wearing a [ITEM NAME], professional pet photography, clean aesthetic studio background, 4k resolution, stylish lighting."
    }
  ],
  "suggestedAccessories": [
    { 
      "id": "acc_1", 
      "name": "트렌디 소품 명칭", 
      "searchKeyword": "검색 키워드", 
      "description": "추천 이유",
      "visualPrompt": "A professional studio shot of a cute dog wearing a [ACCESSORY NAME], luxury pet fashion editorial, minimalist background, highly detailed fur and fabric textures."
    }
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
