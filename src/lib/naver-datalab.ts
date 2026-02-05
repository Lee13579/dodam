
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

// Fixed Trend Keywords: Focus on "Location" and "Dog-friendly infrastructure"
// This avoids fetching personal pet bios.
const REAL_TREND_KEYWORDS = [
    "스타필드 애견동반 장소", "더현대 서울 애견동반 카페", "반포 한강공원 애견 동반",
    "평창 애견동반 여행지", "제주도 반려동물 동반 명소", "남해 애견동반 산책로",
    "포천 아트밸리 애견동반", "서울숲 애견 산책", "경주 애견동반 유적지",
    "가평 수목원 애견동반", "부산 블루라인파크 애견동반", "강릉 커피거리 애견동반"
];

export async function getNaverTrendingKeywords(): Promise<string[]> {
    return [...REAL_TREND_KEYWORDS].sort(() => 0.5 - Math.random()).slice(0, 10);
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
