
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
  rating?: number;
  reviewCount?: number;
  bookingUrl?: string;
  source?: 'NAVER' | 'AGODA' | 'KLOOK';
}

export async function searchNaverImages(query: string): Promise<string | null> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  try {
    const response = await fetch(`${NAVER_IMAGE_URL}?query=${encodeURIComponent(query)}&display=1&sort=sim&filter=medium`, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.items[0]?.link || null;
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
      // HTML 태그(<b> 등) 제거
      const cleanTitle = item.title.replace(/<[^>]*>?/gm, '');

      // 좌표 변환 (String -> Number -> Project -> [lng, lat])
      const [lng, lat] = proj4(KATECH, WGS84, [parseInt(item.mapx), parseInt(item.mapy)]);

      // 이미지 검색 (병렬로 처리하거나 필요할 때만 호출하는 것이 좋지만, 여기서는 간단히 구현)
      // 주의: 너무 많은 요청은 속도 저하를 유발하므로 상위 몇 개만 하거나 별도 처리가 나음.
      // 일단 여기서는 이미지 검색을 수행하지 않고, 호출하는 쪽(Route Handler)에서 필요한 경우에만 enrichment 하도록 설계하는게 좋음.
      // 하지만 편의상 display가 1(단건 최적화)일 땐 이미지도 가져오도록 해봅니다.
      let imgUrl = null;
      if (display <= 3) {
        imgUrl = await searchNaverImages(cleanTitle);
      }

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
        imageUrl: imgUrl || undefined
      };
    }));

    return places;

  } catch (error) {
    console.error("Naver Search Failed:", error);
    return [];
  }
}

// 네이버 카테고리 문자열을 우리 앱의 카테고리로 단순화
function formatCategory(naverCategory: string): string {
  if (naverCategory.includes('카페') || naverCategory.includes('디저트')) return 'Cafe';
  if (naverCategory.includes('호텔') || naverCategory.includes('숙박') || naverCategory.includes('펜션') || naverCategory.includes('캠핑')) return 'Hotel';
  if (naverCategory.includes('공원') || naverCategory.includes('산책') || naverCategory.includes('유원지')) return 'Park';
  return 'Restaurant'; // 기본값
}
