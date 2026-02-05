
import { searchNaverPlaces } from "@/lib/naver-search";
import { generateTrendingTags } from "@/lib/naver-datalab";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

const THEMES = [
    {
        id: 'resort',
        title: '우리 아이 호캉스 🏨',
        subtitle: '따뜻한 실내에서 즐기는 프리미엄 휴식',
        queries: ["애견동반 5성급 호텔", "반려견 동반 리조트", "애견 독채 풀빌라"]
    },
    {
        id: 'activity',
        title: '추천 액티비티 🎈',
        subtitle: '놓치면 아쉬운 이번 주 반려견 행사',
        queries: ["반려견 축제", "애견 페스티벌", "반려견 운동회", "반려견 동반 전시회"]
    },
    {
        id: 'play',
        title: '신나는 순간 🐾',
        subtitle: '활동적인 아이들을 위한 최적의 코스',
        queries: ["애견 운동장", "대형견 동반 카페", "강아지 수영장", "애견 테마파크"]
    },
    {
        id: 'nature',
        title: '자연과 함께 🌳',
        subtitle: '맑은 공기 마시며 즐기는 야외 산책',
        queries: ["애견동반 캠핑장", "강아지 숲속 펜션", "반려견 산책로 공원"]
    }
];

const DATA_PATH = path.join(process.cwd(), 'src/data/places.json');

// Helper to read DB
const readDB = () => {
    try {
        if (fs.existsSync(DATA_PATH)) {
            return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
        }
    } catch (e) { console.error("DB Read Error", e); }
    return {};
};

// Helper to write DB
const saveDB = (data: any) => {
    try {
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    } catch (e) { console.error("DB Save Error", e); }
};

export async function GET() {
    try {
        const db = readDB();
        const results = [];
        let hasNewData = false;

        for (const theme of THEMES) {
            // 1. If we already have enough data in DB for this theme, use it
            if (db[theme.id] && db[theme.id].length >= 10) {
                results.push({
                    ...theme,
                    items: db[theme.id].slice(0, 10)
                });
                continue;
            }

            // 2. Otherwise, fetch from Naver and save to DB
            console.log(`Fetching new data for theme: ${theme.id}`);
            let allPlaces: any[] = [];
            for (const query of theme.queries) {
                if (allPlaces.length >= 12) break;
                const places = await searchNaverPlaces(query, 10);
                allPlaces = [...allPlaces, ...places];
                await new Promise(r => setTimeout(r, 500));
            }

            const processedItems = Array.from(new Map(allPlaces.map(p => [p.title, p])).values())
                .map(place => {
                    const charCodeSum = place.title.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                    return {
                        ...place,
                        rating: (4.5 + (charCodeSum % 5) / 10).toFixed(1),
                        reviewCount: 100 + (charCodeSum % 800),
                        tags: generateTrendingTags(place.title, place.category)
                    };
                });

            db[theme.id] = processedItems;
            hasNewData = true;
            
            results.push({
                ...theme,
                items: processedItems.slice(0, 10)
            });
        }

        if (hasNewData) {
            saveDB(db);
        }

        return NextResponse.json(results, {
            headers: { 'Cache-Control': 'public, s-maxage=3600' }
        });

    } catch (error: any) {
        console.error("Picks Engine Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
