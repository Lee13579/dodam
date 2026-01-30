import { StyleOption, Product } from "../types";

export const STYLE_OPTIONS: StyleOption[] = [
    {
        id: "Teddy Bear",
        name: "클래식 테디베어",
        description: "동글동글한 얼굴과 귀로 거부할 수 없는 귀여움을 선사합니다.",
        image: "/images/styles/teddy_bear.png",
    },
    {
        id: "Formal Tuxedo",
        name: "블랙 타이 포멀",
        description: "세련된 블랙 턱시도와 강렬한 레드 보타이로 격식 있는 룩을 완성합니다.",
        image: "/images/styles/formal_tuxedo.png",
    },
    {
        id: "Streetwear",
        name: "어반 스트릿",
        description: "트렌디한 후디와 미니 선글라스로 힙한 감성을 더합니다.",
        image: "/images/styles/streetwear.png",
    },
    {
        id: "Hawaiian",
        name: "알로하 바캉스",
        description: "시원한 트로피컬 셔츠와 밀짚 모자로 해변의 분위기를 냅니다.",
        image: "/images/styles/hawaiian.png",
    },
    {
        id: "custom",
        name: "나만의 스타일",
        description: "상상하는 무엇이든 만들어드립니다",
        image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=300&h=300&auto=format&fit=crop", // Keep unsplash for custom or generate one later
    },
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: "p1",
        name: "모던 테디베어 코지 베스트",
        description: "테디베어 컷과 찰떡궁합! 포근한 양털 소재로 우리 아이의 귀여움을 두 배로 높여줍니다.",
        price: 24000,
        image: "/images/products/teddy_bear_vest.png",
        url: "https://www.coupang.com/",
        category: "Clothing",
    },
    {
        id: "p2",
        name: "프리미엄 젠틀맨 턱시도 세트",
        description: "특별한 날을 위한 최고의 선택. 신축성 좋은 소재로 제작되어 장시간 착용도 편안합니다.",
        price: 45000,
        image: "/images/products/gentleman_tuxedo.png",
        url: "https://www.coupang.com/",
        category: "Clothing",
    },
    {
        id: "p3",
        name: "어반 네온 스트릿 후디",
        description: "힙한 감성 가득! 비비드한 컬러와 세련된 핏으로 산책길의 주인공이 되어보세요.",
        price: 29000,
        image: "/images/products/neon_street_hoodie.png",
        url: "https://www.coupang.com/",
        category: "Clothing",
    },
    {
        id: "p4",
        name: "트로피컬 알로하 바캉스 셔츠",
        description: "시원한 인견 소재와 화려한 패턴. 올여름 휴양지 룩은 이 셔츠 하나로 끝!",
        price: 19500,
        image: "/images/products/aloha_sunset_shirt.png",
        url: "https://www.coupang.com/",
        category: "Clothing",
    },
    {
        id: "p5",
        name: "럭셔리 클래식 트위드 자켓",
        description: "고급스러운 트위드 원단과 골드 버튼의 조화. 우리 아이를 진정한 패셔니스타로 만들어줍니다.",
        price: 58000,
        image: "/images/products/luxury_tweed_jacket.png",
        url: "https://www.coupang.com/",
        category: "Clothing",
    },
    {
        id: "p6",
        name: "액티브 스포티 매쉬 저지",
        description: "신나게 뛰어노는 아이들을 위한 통기성 만점 기능성 저지. 활동성이 뛰어납니다.",
        price: 22000,
        image: "/images/products/sporty_mesh_jersey.png",
        url: "https://www.coupang.com/",
        category: "Clothing",
    },
    {
        id: "p7",
        name: "레인보우 소프트 니트 스웨터",
        description: "부드러운 촉감과 화사한 무지개 컬러. 추운 날씨에도 따뜻하고 스타일리시하게.",
        price: 32000,
        image: "/images/products/rainbow_knit_sweater.png",
        url: "https://www.coupang.com/",
        category: "Clothing",
    },
    {
        id: "p8",
        name: "빈티지 블루 데님 오버롤",
        description: "클래식한 데님의 매력! 어떤 이너와 매치해도 귀여운 빈티지 룩을 완성합니다.",
        price: 36000,
        image: "/images/products/denim_overalls.png",
        url: "https://www.coupang.com/",
        category: "Clothing",
    },
];
