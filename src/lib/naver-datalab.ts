
// 네이버 데이터랩 검색어 트렌드 API URL
const NAVER_DATALAB_URL = 'https://openapi.naver.com/v1/datalab/search';

interface DataLabResponse {
    startDate: string;
    endDate: string;
    timeUnit: string;
    results: {
        title: string;
        keyword: string[];
        data: {
            period: string;
            ratio: number;
        }[];
    }[];
}

const TREND_GROUPS = [
    { groupName: "애견동반스팟", keywords: ["애견동반카페", "애견동반식당", "애견동반호텔", "애견동반여행"] },
    { groupName: "산책코스", keywords: ["강아지산책로", "반려견운동장", "강아지공원"] },
    { groupName: "강아지패션", keywords: ["강아지옷", "강아지액세서리", "강아지인식표"] },
    { groupName: "펫푸드", keywords: ["강아지수제간식", "강아지사료추천"] }
];

const FALLBACK_KEYWORDS = [
    "스타필드 애견동반 장소", "더현대 서울 애견동반 카페", "반포 한강공원 애견 동반",
    "평창 애견동반 여행지", "제주도 반려동물 동반 명소", "남해 애견동반 산책로"
];

// 네이버 쇼핑 인사이트 API URL
const NAVER_SHOPPING_INSIGHT_URL = 'https://openapi.naver.com/v1/datalab/shopping/category/keywords';

export interface ShoppingTrend {
    name: string;
    rank: number;
}

/**
 * 네이버 쇼핑 인사이트에서 반려견 패션 카테고리의 인기 키워드를 가져옵니다.
 * 카테고리 ID: 50000154 (강아지 의류/잡화)
 */
export async function getNaverShoppingTrends(): Promise<string[]> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) return ["강아지 패딩", "강아지 올인원", "강아지 원피스"];

    try {
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

        const body = {
            startDate: sevenDaysAgo.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            timeUnit: "date",
            category: "50000154", // 반려견 의류/잡화
            device: "",
            gender: "",
            ages: []
        };

        const response = await fetch(NAVER_SHOPPING_INSIGHT_URL, {
            method: 'POST',
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) return ["강아지 옷", "강아지 액세서리"];

        const data = await response.json();
        // 가장 최근 날짜의 키워드 비율 데이터를 가져와 정렬 (실제로는 카테고리 내 키워드 랭킹을 활용)
        // API 구조상 결과가 복잡하므로 대표적인 트렌드 키워드 그룹으로 변환하여 반환
        return data.results?.[0]?.keywords?.map((k: any) => k.name).slice(0, 10) || ["강아지 옷", "강아지 액세서리"];

    } catch (error) {
        console.error("Naver Shopping Insight Error:", error);
        return ["강아지 옷", "강아지 액세서리"];
    }
}

export async function getNaverTrendingKeywords(): Promise<string[]> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) return FALLBACK_KEYWORDS;

    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const body = {
            startDate: thirtyDaysAgo.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            timeUnit: "month",
            keywordGroups: TREND_GROUPS
        };

        const response = await fetch(NAVER_DATALAB_URL, {
            method: 'POST',
            headers: {
                'X-Naver-Client-Id': clientId,
                'X-Naver-Client-Secret': clientSecret,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error(`DataLab API failed: ${response.status}`);

        const data: DataLabResponse = await response.json();
        
        // 각 그룹의 최신 데이터(ratio)를 기준으로 정렬하여 가장 인기 있는 키워드 추출
        const sortedResults = data.results.sort((a, b) => {
            const aLast = a.data[a.data.length - 1]?.ratio || 0;
            const bLast = b.data[b.data.length - 1]?.ratio || 0;
            return bLast - aLast;
        });

        // 가장 인기 있는 그룹의 키워드들과 고유 키워드 조합 반환
        const topKeywords = sortedResults.flatMap(r => r.keyword);
        return topKeywords.length > 0 ? topKeywords.slice(0, 10) : FALLBACK_KEYWORDS;

    } catch (error) {
        console.error("Naver DataLab Error:", error);
        return FALLBACK_KEYWORDS;
    }
}

export function generateTrendingTags(placeName: string, category: string): string[] {
    const tags = [];
    if (category) {
        tags.push(`#${category.split('>').pop()?.trim().replace(/\s+/g, '') || '추천스팟'}`);
    }

    const attributes = [
        "#주차편리", "#야외테라스", "#대형견가능",
        "#포토존명소", "#견생샷환경", "#산책로연결"
    ];

    // Pick 2 deterministic attributes based on name to keep UI stable
    const idx = placeName.length % attributes.length;
    tags.push(attributes[idx]);
    if (placeName.length > 5) {
        tags.push(attributes[(idx + 2) % attributes.length]);
    }

    return tags;
}
