
import proj4 from 'proj4';

// 네이버 검색 API의 기본 URL
const NAVER_SEARCH_URL = 'https://openapi.naver.com/v1/search/local.json';

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
    return data.items.map((item: NaverPlace, index: number) => {
      // HTML 태그(<b> 등) 제거
      const cleanTitle = item.title.replace(/<[^>]*>?/gm, '');
      
      // 좌표 변환 (String -> Number -> Project -> [lng, lat])
      // 주의: proj4는 [경도(lng), 위도(lat)] 순서로 반환합니다.
      const [lng, lat] = proj4(KATECH, WGS84, [parseInt(item.mapx), parseInt(item.mapy)]);

      return {
        id: `naver_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`, // 유니크 ID 생성
        name: cleanTitle,
        title: cleanTitle,
        category: formatCategory(item.category),
        address: item.roadAddress || item.address,
        lat: lat,
        lng: lng,
        description: item.category, // 카테고리 상세 정보를 설명으로 사용
        link: item.link
      };
    });

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
