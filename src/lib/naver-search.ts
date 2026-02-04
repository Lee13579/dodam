
import proj4 from 'proj4';

// 네이버 검색 API의 기본 URL
const NAVER_SEARCH_URL = 'https://openapi.naver.com/v1/search/local.json';
const NAVER_IMAGE_URL = 'https://openapi.naver.com/v1/search/image';

// 좌표 변환 정의 (KATECH -> WGS84)
// 네이버 OpenAPI의 mapx, mapy는 KATECH 좌표계(TM128)를 사용합니다.
const KATECH = '+proj=tmerc +lat_0=38 +lon_0=128 +k=0.9999 +x_0=400000 +y_0=600000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43';
const WGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

export interface NaverPlace {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

export interface TransformedPlace {
  id: string;
  name: string;
  title: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  description?: string;
  link?: string;
  imageUrl?: string;
  // Affiliate Extensions
  price?: number;
  originalPrice?: number;
  rating?: number | string;
  reviewCount?: number;
  bookingUrl?: string;
  source?: 'NAVER' | 'AGODA' | 'KLOOK';
  badge?: string;
  isPetFriendly?: boolean;
}

export async function searchNaverImages(query: string, context?: string): Promise<string | null> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  try {
    // Improve query by adding context (e.g., region or "pet friendly")
    const refinedQuery = context ? `${query} ${context}` : `${query} 업체사진`;

    // Fetch top 5 samples to find a valid direct image link
    const response = await fetch(`${NAVER_IMAGE_URL}?query=${encodeURIComponent(refinedQuery)}&display=5&sort=sim&filter=medium`, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.items || data.items.length === 0) return null;

    // Try to find the best image link among candidates
    // Prioritize jpg/png/webp for better loading reliability
    const bestItem = data.items.find((item: any) =>
      item.link.toLowerCase().includes('.jpg') ||
      item.link.toLowerCase().includes('.png') ||
      item.link.toLowerCase().includes('.webp')
    ) || data.items[0];

    return bestItem?.link || null;
  } catch (error) {
    console.error("Naver Image Search error:", error);
    return null;
  }
}

export async function searchNaverPlaces(query: string, display: number = 3): Promise<TransformedPlace[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Naver API Key is missing");
    return [];
  }

  try {
    const response = await fetch(`${NAVER_SEARCH_URL}?query=${encodeURIComponent(query)}&display=${display}&sort=random`, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error(`Naver API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // 데이터 변환 및 HTML 태그 제거
    const places = await Promise.all(data.items.map(async (item: NaverPlace, index: number) => {
      // HTML 태그 및 엔티티 제거/치환
      const cleanTitle = item.title
        .replace(/<[^>]*>?/gm, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      // 좌표 변환 (String -> Number -> Project -> [lng, lat])
      const [lng, lat] = proj4(KATECH, WGS84, [parseInt(item.mapx), parseInt(item.mapy)]);

      // 이미지 검색
      let imgUrl = null;
      if (display <= 5) {
        imgUrl = await searchNaverImages(cleanTitle, query);
      }

      const isPetFriendly = item.category.includes('반려동물') ||
        item.category.includes('애견') ||
        item.category.includes('반려견') ||
        cleanTitle.includes('애견') ||
        cleanTitle.includes('반려견');

      // 고해상도 반려견 테마 플레이스홀더들 (이미지 검색 실패 시 다양성 확보)
      const dogPlaceholders = [
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1514373941175-0a1410629e71?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=800&auto=format&fit=crop'
      ];

      return {
        id: `naver_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
        name: cleanTitle,
        title: cleanTitle,
        category: formatCategory(item.category),
        address: item.roadAddress || item.address,
        lat: lat,
        lng: lng,
        description: item.category,
        link: item.link,
        imageUrl: imgUrl || dogPlaceholders[index % dogPlaceholders.length],
        isPetFriendly: isPetFriendly
      };
    }));

    return places;

  } catch (error) {
    console.error("Naver Search Failed:", error);
    return [];
  }
}

// 네이버 카테고리 문자열을 우리 앱의 카테고리로 단순화 및 반려견 특성 추출 (UI 노출용 한국어)
function formatCategory(naverCategory: string): string {
  // 반려동물 공식 분류 우선 체크 (네이버 분류 체계 기준)
  if (naverCategory.includes('반려동물') || naverCategory.includes('애견') || naverCategory.includes('반려견')) {
    if (naverCategory.includes('카페')) return '애견 카페';
    if (naverCategory.includes('호텔') || naverCategory.includes('펜션') || naverCategory.includes('숙박')) return '애견 숙소';
    if (naverCategory.includes('병원')) return '동물 병원';
    if (naverCategory.includes('운동장') || naverCategory.includes('공원') || naverCategory.includes('놀이터')) return '애견 운동장';
    if (naverCategory.includes('미용') || naverCategory.includes('살롱')) return '애견 미용';
    if (naverCategory.includes('식당') || naverCategory.includes('음식점')) return '반려견 동반 식당';
    if (naverCategory.includes('용품')) return '반려용품점';
    return '반려동물 동반';
  }

  // 일반 카테고리 폴백
  if (naverCategory.includes('카페') || naverCategory.includes('디저트')) return '카페';
  if (naverCategory.includes('호텔') || naverCategory.includes('숙박') || naverCategory.includes('펜션') || naverCategory.includes('캠핑')) return '숙소';
  if (naverCategory.includes('공원') || naverCategory.includes('산책') || naverCategory.includes('유원지')) return '공원/산책';
  if (naverCategory.includes('음식점') || naverCategory.includes('뷔페') || naverCategory.includes('레스토랑')) return '음식점';

  return '장소'; // 기본값
}
