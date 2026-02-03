
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

dotenv.config({ path: envPath });

const NAVER_ID = process.env.NAVER_CLIENT_ID;
const NAVER_SECRET = process.env.NAVER_CLIENT_SECRET;

if (!NAVER_ID || !NAVER_SECRET) {
    console.error('❌ Missing Naver API credentials in .env.local');
    process.exit(1);
}

const THEMES = [
    {
        id: 'resort',
        queries: ["애견동반 5성급 호텔", "애견동반 풀빌라", "반려견 리조트 강원도", "애견동반 호캉스 제주"]
    },
    {
        id: 'nature',
        queries: ["애견전용 캠핑장", "애견동반 글램핑", "반려견 숲속 펜션", "애견동반 독채 펜션 계곡"]
    },
    {
        id: 'play',
        queries: ["애견 운동장 카페", "대형견 동반 카페", "반려견 수영장 펜션", "강아지 숲 공원"]
    }
];

async function fetchNaverPlaces(query: string) {
    try {
        const response = await fetch(
            `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&sort=random`,
            {
                headers: {
                    "X-Naver-Client-Id": NAVER_ID!,
                    "X-Naver-Client-Secret": NAVER_SECRET!,
                },
            }
        );

        if (!response.ok) {
            console.error(`Error fetching ${query}: ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        return data.items.map((item: any) => ({
            id: item.link || `naver_${Math.random().toString(36).substr(2, 9)}`,
            title: item.title.replace(/<[^>]*>?/gm, ''),
            category: item.category,
            description: item.description,
            address: item.roadAddress || item.address,
            mapx: item.mapx,
            mapy: item.mapy,
            // Enhanced mock fields
            imageUrl: `https://source.unsplash.com/800x600/?${query.split(' ')[1]},dog`,
            rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1),
            reviews: Math.floor(Math.random() * 500) + 50,
            badge: ['인기', '추천', 'NEW'][Math.floor(Math.random() * 3)]
        }));
    } catch (error) {
        console.error(`Failed usage for ${query}`, error);
        return [];
    }
}

async function seed() {
    console.log('🌱 Starting data seed...');

    // Check if data dir exists
    const dataDir = path.resolve(__dirname, '../src/data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const db: Record<string, any> = {};

    for (const theme of THEMES) {
        console.log(`\nProcessing Theme: ${theme.id}`);
        let themeItems: any[] = [];

        for (const query of theme.queries) {
            console.log(`  - Fetching: ${query}...`);
            const items = await fetchNaverPlaces(query);
            themeItems = [...themeItems, ...items];
            // Naver API Rate Limit safety
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Deduplicate
        const uniqueItems = Array.from(new Map(themeItems.map(item => [item.title, item])).values());
        db[theme.id] = uniqueItems;
        console.log(`  ✅ Cached ${uniqueItems.length} unique places for ${theme.id}`);
    }

    const outputPath = path.join(dataDir, 'places.json');
    fs.writeFileSync(outputPath, JSON.stringify(db, null, 2));
    console.log(`\n🎉 Data seeding complete! Saved to ${outputPath}`);
}

seed();
