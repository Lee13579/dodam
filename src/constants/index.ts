import { StyleOption, Product } from "../types";

export const STYLE_OPTIONS: StyleOption[] = [
    {
        id: "Teddy Bear",
        name: "클래식 테디베어",
        description: "동글동글한 얼굴과 귀로 거부할 수 없는 귀여움을 선사합니다.",
        image: "/styles/teddy-bear.jpg",
    },
    {
        id: "Formal Tuxedo",
        name: "블랙 타이 포멀",
        description: "세련된 블랙 턱시도와 강렬한 레드 보타이로 격식 있는 룩을 완성합니다.",
        image: "/styles/tuxedo.jpg",
    },
    {
        id: "Streetwear",
        name: "어반 스트릿",
        description: "트렌디한 후디와 미니 선글라스로 힙한 감성을 더합니다.",
        image: "/styles/streetwear.jpg",
    },
    {
        id: "Hawaiian",
        name: "알로하 바캉스",
        description: "시원한 트로피컬 셔츠와 밀짚 모자로 해변의 분위기를 냅니다.",
        image: "/styles/summer.jpg",
    },
    {
        id: "Cozy Winter",
        name: "윈터 라운지",
        description: "포근한 꽈배기 니트와 어울리는 목도리로 따뜻한 겨울을 준비합니다.",
        image: "/styles/winter.jpg",
    },
    {
        id: "Rainy Day",
        name: "레인보우 체이서",
        description: "상큼한 노란 우비와 장화로 비 오는 날도 즐거운 산책을 즐깁니다.",
        image: "/styles/rainy.jpg",
    },
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: "p1",
        name: "실크 터치 피니싱 스프레이",
        description: "테디베어 컷의 볼륨감과 부드러운 윤기를 오랫동안 유지해 줍니다.",
        price: 24.99,
        image: "/products/spray.jpg",
        url: "https://example.com/p1",
        category: "Grooming",
    },
    {
        id: "p2",
        name: "프리미엄 실크 보타이",
        description: "특별한 날, 블랙 타이 룩을 완성시켜 줄 고품격 실크 액세서리입니다.",
        price: 15.00,
        image: "/products/bowtie.jpg",
        url: "https://example.com/p2",
        category: "Accessory",
    },
    {
        id: "p3",
        name: "어반 니트 반려견 후디",
        description: "부드러운 면 소재로 제작되어 스타일과 편안함을 동시에 잡았습니다.",
        price: 32.00,
        image: "/products/hoodie.jpg",
        url: "https://example.com/p3",
        category: "Accessory",
    },
    {
        id: "p4",
        name: "워터프루프 발바닥 보호 밤",
        description: "비 오는 날 산책 후에도 발바닥을 촉촉하고 건강하게 보호해 줍니다.",
        price: 19.50,
        image: "/products/balm.jpg",
        url: "https://example.com/p4",
        category: "Grooming",
    },
];
