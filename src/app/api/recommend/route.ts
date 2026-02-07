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
당신은 대한민국 최고의 반려견 스타일 전문가입니다. 사진 속 강아지를 분석해 다음 두 가지 작업을 동시에 수행하세요.

### 작업 1: 화보 컨셉 제안 (스타일 모드용)
- 고정된 의상 카테고리에 얽매이지 마세요.
- **[K-컨셉 및 로컬 감성 극대화]**: 모든 컨셉은 한국의 장소, 문화, 일상 감성을 바탕으로 하세요. 
- 예: '성수동 카페 힙스터', '제주도 감귤밭 나들이', '경복궁 도령님', '한강 공원 피크닉' 등 우리에게 친숙하고 공감 가는 **'로컬 페르소나 화보'**를 적극 제안하세요. (해외 배경이나 명칭은 지양하세요)
- **[초강력 지시] '털'이라는 단어는 어떤 경우에도 절대 사용하지 마세요.** 대신 '모색', '코트', '결', '질감' 등의 전문적인 표현만 사용하세요.
- **[톤앤매너]**: 컨셉 이름은 위트 있게 짓되, 분석 설명은 글로벌 패션 매거진 에디터처럼 품격 있게 서술하세요.
- 예: "윤기 나는 브라운 코트의 색감이 제주 감귤밭의 상큼함과 어우러져, 아이만의 싱그러운 매력을 극대화하는 로컬 화보 컨셉입니다."

### 작업 2: 실전 큐레이션 (피팅 모드용)
- 현재 인기 트렌드 [${trendContext}]를 반영하여, 실제로 입혀볼 수 있는 의류 5개, 액세서리 5개를 골라주세요.
- 쇼핑 검색이 잘 되는 정확한 상품명을 사용하세요.

### 필독: 응답 데이터 구조 (JSON)
{
  "personalColor": "#HexCode (아이의 모색과 가장 잘 어울리는 대표 퍼스널 컬러)",
  "concepts": [ // 화보 컨셉 3개 (필수)
    {
      "id": "style_1",
      "name": "컨셉 이름 (예: 제주도 유채꽃 산책)",
      "description": "추천 이유 (따뜻한 말투, 한글 2줄)",
      "koreanAnalysis": "아이의 모색, 체형, 이미지를 분석하여 가장 잘 어울리는 '베스트 패션 스타일(예: 프레피 룩, 어반 시크 등)'을 구체적으로 추천해 주세요. 이 스타일이 아이의 어떤 매력을 살려주는지 설명하고, '아래 추천 아이템으로 이 룩을 완성해 보세요'라는 뉘앙스로 자연스럽게 연결되는 멘트를 작성하세요. (다정한 에디터 톤, 한글 3-4줄)",
      "shoppingTip": "이 스타일을 더 돋보이게 할 한 줄 코디 팁",
      "customPrompt": "High-quality English image generation prompt for this concept",
      "searchKeywords": ["검색어1", "검색어2"]
    },
    { "id": "style_2", ... },
    { "id": "style_3", ... }
  ],
  "suggestedClothes": [ // 의류 5개 (필수)
    { "id": "cloth_1", "name": "상품명", "searchKeyword": "검색어", "description": "추천 이유" },
    // ...
  ],
  "suggestedAccessories": [ // 소품 5개 (필수)
    { "id": "acc_1", "name": "상품명", "searchKeyword": "검색어", "description": "추천 이유" },
    // ...
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
