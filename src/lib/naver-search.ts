import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import proj4 from 'proj4';

// 네이버 검색 API의 기본 URL
const NAVER_SEARCH_URL = 'https://openapi.naver.com/v1/search/local.json';
const NAVER_IMAGE_URL = 'https://openapi.naver.com/v1/search/image';

// 좌표 변환 정의 (KATECH -> WGS84)
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

// Helper: Scrape Naver Place for OG Image (High Quality)
async function scrapeNaverPlaceImage(query: string): Promise<string | null> {
  // Note: Scraping search results directly is flaky.
  // For now, we will rely on the Image Search API with stricter filters.
  // If user explicitly wants "Place" photos only, we'd need the Place ID first, 
  // but the Search API doesn't give it reliably.
  return null;
}

export async function searchNaverImages(query: string, context?: string): Promise<string | null> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  try {
    const refinedQuery = query;

    const response = await fetch(`${NAVER_IMAGE_URL}?query=${encodeURIComponent(refinedQuery)}&display=5&sort=sim&filter=medium`, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return null;
    }

    // Filter logic: Prefer .jpg, avoid blog post thumbnails if possible
    const bestItem = data.items.find((item: any) =>
      (item.link.includes('.jpg') || item.link.includes('.png'))
    ) || data.items[0];

    return bestItem?.link || null;
  } catch (error) {
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
      const cleanTitle = item.title
        .replace(/<[^>]*>?/gm, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      const [lng, lat] = proj4(KATECH, WGS84, [parseInt(item.mapx), parseInt(item.mapy)]);

      // 1. Try Image Search API
      let imgUrl = null;
      if (index < 4) {
        imgUrl = await searchNaverImages(cleanTitle, query);
      }

      const isPetFriendly = item.category.includes('반려동물') ||
        item.category.includes('애견') ||
        item.category.includes('반려견') ||
        cleanTitle.includes('애견') ||
        cleanTitle.includes('반려견');

      // 2. If NO Image found, Use a Custom Placeholder (Not Unsplash)
      const placeholder = '/images/place_placeholder.png'; // Local asset

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
        imageUrl: imgUrl || placeholder,
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

  if (naverCategory.includes('카페') || naverCategory.includes('디저트')) return '카페';
  if (naverCategory.includes('호텔') || naverCategory.includes('숙박') || naverCategory.includes('펜션') || naverCategory.includes('캠핑')) return '숙소';
  if (naverCategory.includes('공원') || naverCategory.includes('산책') || naverCategory.includes('유원지')) return '공원/산책';
  if (naverCategory.includes('음식점') || naverCategory.includes('뷔페') || naverCategory.includes('레스토랑')) return '음식점';

  return '장소';
}
