import { StyleOption, Product } from "../types";

export const STYLE_OPTIONS: StyleOption[] = [
    {
        id: "Teddy Bear",
        name: "클래식 테디베어",
        description: "동글동글한 얼굴과 귀로 거부할 수 없는 귀여움을 선사합니다.",
        image: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab1?q=80&w=300&h=300&auto=format&fit=crop",
    },
    {
        id: "Formal Tuxedo",
        name: "블랙 타이 포멀",
        description: "세련된 블랙 턱시도와 강렬한 레드 보타이로 격식 있는 룩을 완성합니다.",
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=300&h=300&auto=format&fit=crop",
    },
    {
        id: "Streetwear",
        name: "어반 스트릿",
        description: "트렌디한 후디와 미니 선글라스로 힙한 감성을 더합니다.",
        image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=300&h=300&auto=format&fit=crop",
    },
    {
        id: "Hawaiian",
        name: "알로하 바캉스",
        description: "시원한 트로피컬 셔츠와 밀짚 모자로 해변의 분위기를 냅니다.",
        image: "https://images.unsplash.com/photo-1516383074327-ac48c4e22f16?q=80&w=300&h=300&auto=format&fit=crop",
    },
    {
        id: "custom",
        name: "나만의 스타일",
        description: "상상하는 무엇이든 만들어드립니다",
        image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=300&h=300&auto=format&fit=crop",
    },
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: "p1",
        name: "모던 테디베어 코지 베스트",
        description: "테디베어 컷과 찰떡궁합! 포근한 양털 소재로 우리 아이의 귀여움을 두 배로 높여줍니다.",
        price: 24000,
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=300&h=300&auto=format&fit=crop",
        url: "https://www.coupang.com/", // Replace with actual Coupang Partners link
        category: "Accessory",
    },
    {
        id: "p2",
        name: "프리미엄 젠틀맨 턱시도 세트",
        description: "특별한 날을 위한 최고의 선택. 신축성 좋은 소재로 제작되어 장시간 착용도 편안합니다.",
        price: 45000,
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=300&h=300&auto=format&fit=crop",
        url: "https://www.coupang.com/", // Replace with actual Coupang Partners link
        category: "Accessory",
    },
    {
        id: "p3",
        name: "어반 네온 스트릿 후디",
        description: "힙한 감성 가득! 비비드한 컬러와 세련된 핏으로 산책길의 주인공이 되어보세요.",
        price: 29000,
        image: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?q=80&w=300&h=300&auto=format&fit=crop",
        url: "https://www.coupang.com/", // Replace with actual Coupang Partners link
        category: "Accessory",
    },
    {
        id: "p4",
        name: "트로피컬 알로하 선셋 셔츠",
        description: "시원한 인견 소재와 화려한 패턴. 올여름 휴양지 룩은 이 셔츠 하나로 끝!",
        price: 19500,
        image: "https://images.unsplash.com/photo-1591768793355-74d7af236c1f?q=80&w=300&h=300&auto=format&fit=crop",
        url: "https://www.coupang.com/", // Replace with actual Coupang Partners link
        category: "Accessory",
    },
];
