
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
        const topKeywords = sortedResults.flatMap(r => r.keyword || []);
        return topKeywords.length > 0 ? topKeywords.filter(k => !!k).slice(0, 10) : FALLBACK_KEYWORDS;

    } catch (error) {
        console.error("Naver DataLab Error:", error);
        return FALLBACK_KEYWORDS;
    }
}

// [NEW] Regional & Seasonal Trend Logic

const REGION_GROUPS = [
    { groupName: "강릉/속초", keywords: ["강릉 여행", "속초 여행", "양양 서핑", "고성 여행"] },
    { groupName: "제주도", keywords: ["제주도 여행", "제주 애견동반", "서귀포 여행"] },
    { groupName: "부산/거제", keywords: ["부산 여행", "해운대", "광안리", "거제도 여행"] },
    { groupName: "경상도", keywords: ["경주 여행", "포항 여행", "남해 여행"] },
    { groupName: "전라도", keywords: ["여수 여행", "전주 한옥마을", "담양 죽녹원"] },
    { groupName: "충청도", keywords: ["태안 여행", "단양 여행", "제천 여행"] },
    { groupName: "경기도", keywords: ["가평 여행", "양평 여행", "포천 여행"] }
];

const SEASONAL_GROUPS = [
    { groupName: "봄꽃여행", keywords: ["벚꽃 명소", "유채꽃 축제", "매화 마을", "봄꽃 축제"] },
    { groupName: "여름물놀이", keywords: ["해수욕장", "계곡 물놀이", "서핑 강습", "수상레저"] },
    { groupName: "가을단풍", keywords: ["단풍 명소", "핑크뮬리", "억새 축제", "가을 캠핑"] },
    { groupName: "겨울눈꽃", keywords: ["눈꽃 산행", "겨울 바다", "얼음 낚시", "온천 여행"] }
];

export interface RegionRank {
    region: string;
    keywords: string[];
    ratio: number;
}

export async function getRegionalRanking(): Promise<RegionRank[]> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) return [
        { region: "강릉/속초", keywords: ["강릉", "속초"], ratio: 100 },
        { region: "제주도", keywords: ["제주", "서귀포"], ratio: 80 },
        { region: "부산", keywords: ["해운대", "광안리"], ratio: 60 }
    ];

    try {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

        const body = {
            startDate: weekAgo.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            timeUnit: "date",
            keywordGroups: REGION_GROUPS
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

        if (!response.ok) throw new Error(`DataLab Rank API failed: ${response.status}`);

        const data: DataLabResponse = await response.json();

        // Calculate average ratio for last 7 days for each group
        const rankings = data.results.map(group => {
            const totalRatio = group.data.reduce((acc, curr) => acc + (curr.ratio || 0), 0);
            return {
                region: group.title,
                keywords: Array.isArray(group.keyword) ? group.keyword : [],
                ratio: totalRatio
            };
        }).sort((a, b) => b.ratio - a.ratio);

        return rankings.slice(0, 5); // Return Top 5

    } catch (error) {
        console.error("Regional Ranking Error:", error);
        return [];
    }
}

export async function getSmartSeasonalTheme(): Promise<{ title: string, queries: string[] }> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    // Default based on month if API fails
    const month = new Date().getMonth() + 1;
    let defaultTheme = { title: "사계절 힐링 여행", queries: ["애견동반 여행"] };
    if (month >= 3 && month <= 5) defaultTheme = { title: "봄꽃 나들이", queries: ["벚꽃", "유채꽃"] };
    else if (month >= 6 && month <= 8) defaultTheme = { title: "시원한 물놀이", queries: ["계곡", "바다"] };
    else if (month >= 9 && month <= 11) defaultTheme = { title: "가을 단풍여행", queries: ["단풍", "핑크뮬리"] };
    else defaultTheme = { title: "겨울 눈꽃여행", queries: ["눈꽃", "온천"] };

    if (!clientId || !clientSecret) return defaultTheme;

    try {
        const today = new Date();
        const twoWeeksAgo = new Date(today.getTime() - (14 * 24 * 60 * 60 * 1000));

        const body = {
            startDate: twoWeeksAgo.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            timeUnit: "date",
            keywordGroups: SEASONAL_GROUPS
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

        if (!response.ok) return defaultTheme;

        const data: DataLabResponse = await response.json();
        const winner = data.results.sort((a, b) => {
            const aVal = a.data.reduce((acc, curr) => acc + curr.ratio, 0);
            const bVal = b.data.reduce((acc, curr) => acc + curr.ratio, 0);
            return bVal - aVal;
        })[0];

        if (!winner) return defaultTheme;

        // Map winner group to our app's theme structure
        switch (winner.title) {
            case "봄꽃여행": return {
                title: '봄바람 살랑이는 꽃놀이 🌸',
                queries: ["애견동반 벚꽃", "유채꽃 애견동반", "봄꽃 축제 애견", "강아지 피크닉"]
            };
            case "여름물놀이": return {
                title: '시원한 계곡과 바다 🌊',
                queries: ["애견동반 계곡", "강아지 해수욕장", "애견 수영장 펜션", "반려견 동반 서핑"]
            };
            case "가을단풍": return {
                title: '가을 단풍놀이 산책 🍁',
                queries: ["애견동반 단풍", "억새밭 애견동반", "가을 캠핑장 애견", "핑크뮬리 애견"]
            };
            case "겨울눈꽃": return {
                title: '따뜻한 감성 겨울여행 ☃️',
                queries: ["애견동반 겨울바다", "강아지 눈썰매", "애견 글램핑 불멍", "반려견 동반 온천"]
            };
            default: return defaultTheme;
        }

    } catch (error) {
        console.error("Seasonal Theme Error:", error);
        return defaultTheme;
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
