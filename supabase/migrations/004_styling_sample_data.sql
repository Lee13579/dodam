-- Sample Data for Styles
INSERT INTO styles (slug, name, description, custom_prompt, image_url, display_order) VALUES
('formal', '포멀 턱시도', '특별한 날을 위한 우아하고 격식 있는 스타일', 'A cute dog wearing a formal black tuxedo with a bow tie, high quality, photorealistic, studio lighting', '/images/styles/formal_tuxedo.png', 1),
('hawaiian', '하와이안 셔츠', '휴양지 느낌 물씬 나는 시원하고 화려한 패턴', 'A cute dog wearing a colorful Hawaiian shirt with floral patterns, sunglasses, summer vibes, sunny beach background', '/images/styles/hawaiian.png', 2),
('streetwear', '힙합 스트릿', '트렌디하고 힙한 감성의 스트릿 패션', 'A cute dog wearing a hoodie and a cap, street fashion style, graffiti background, cool vibes', '/images/styles/streetwear.png', 3),
('teddy', '테디베어 룩', '포근하고 귀여운 곰돌이 스타일의 의상', 'A cute dog wearing a fuzzy teddy bear costume, soft textures, cozy atmosphere, pastel colors', '/images/styles/teddy_bear.png', 4);

-- Sample Data for Products
WITH 
    style_formal AS (SELECT id FROM styles WHERE slug = 'formal'),
    style_hawaiian AS (SELECT id FROM styles WHERE slug = 'hawaiian'),
    style_street AS (SELECT id FROM styles WHERE slug = 'streetwear'),
    style_teddy AS (SELECT id FROM styles WHERE slug = 'teddy')
INSERT INTO products (name, description, category, image_url, purchase_url, price) VALUES
-- Formal Products
('젠틀맨 턱시도', '고급스러운 소재의 강아지 전용 턱시도입니다. 특별한 행사나 웨딩 촬영에 적합합니다.', 'Clothing', '/images/products/gentleman_tuxedo.png', 'https://smartstore.naver.com/example/products/1', 45000),
('럭셔리 트위드 자켓', '우아함을 더해주는 클래식한 트위드 자켓입니다.', 'Clothing', '/images/products/luxury_tweed_jacket.png', 'https://smartstore.naver.com/example/products/2', 52000),

-- Hawaiian Products
('알로하 선셋 셔츠', '석양이 지는 해변을 담은 듯한 화려한 컬러감의 셔츠입니다.', 'Clothing', '/images/products/aloha_sunset_shirt.png', 'https://smartstore.naver.com/example/products/3', 28000),
('쿨 메쉬 민소매', '통기성이 뛰어난 메쉬 소재로 여름철 산책에 딱입니다.', 'Clothing', '/images/products/sporty_mesh_jersey.png', 'https://smartstore.naver.com/example/products/4', 19000),

-- Streetwear Products
('네온 스트릿 후디', '밤 산책 시 안전과 스타일을 동시에 챙기는 네온 컬러 후드티.', 'Clothing', '/images/products/neon_street_hoodie.png', 'https://smartstore.naver.com/example/products/5', 35000),
('데님 오버올', '어떤 이너와도 잘 어울리는 귀여운 데님 멜빵바지.', 'Clothing', '/images/products/denim_overalls.png', 'https://smartstore.naver.com/example/products/6', 32000),

-- Teddy Products
('레인보우 니트 스웨터', '알록달록한 색감이 사랑스러운 포근한 니트입니다.', 'Clothing', '/images/products/rainbow_knit_sweater.png', 'https://smartstore.naver.com/example/products/7', 29000),
('곰돌이 퍼 조끼', '입는 순간 곰인형으로 변신하는 부드러운 퍼 조끼.', 'Clothing', '/images/products/teddy_bear_vest.png', 'https://smartstore.naver.com/example/products/8', 25000);

-- Link Products to Styles
-- This part is tricky with pure SQL without variables, so we use subqueries or DO block.
-- Using a simpler approach with DO block for linking.

DO $$
DECLARE
    s_formal UUID;
    s_hawaiian UUID;
    s_street UUID;
    s_teddy UUID;
    p_tuxedo UUID;
    p_tweed UUID;
    p_aloha UUID;
    p_mesh UUID;
    p_neon UUID;
    p_denim UUID;
    p_rainbow UUID;
    p_bear UUID;
BEGIN
    SELECT id INTO s_formal FROM styles WHERE slug = 'formal';
    SELECT id INTO s_hawaiian FROM styles WHERE slug = 'hawaiian';
    SELECT id INTO s_street FROM styles WHERE slug = 'streetwear';
    SELECT id INTO s_teddy FROM styles WHERE slug = 'teddy';

    SELECT id INTO p_tuxedo FROM products WHERE name = '젠틀맨 턱시도';
    SELECT id INTO p_tweed FROM products WHERE name = '럭셔리 트위드 자켓';
    SELECT id INTO p_aloha FROM products WHERE name = '알로하 선셋 셔츠';
    SELECT id INTO p_mesh FROM products WHERE name = '쿨 메쉬 민소매';
    SELECT id INTO p_neon FROM products WHERE name = '네온 스트릿 후디';
    SELECT id INTO p_denim FROM products WHERE name = '데님 오버올';
    SELECT id INTO p_rainbow FROM products WHERE name = '레인보우 니트 스웨터';
    SELECT id INTO p_bear FROM products WHERE name = '곰돌이 퍼 조끼';

    INSERT INTO product_styles (product_id, style_id) VALUES
    (p_tuxedo, s_formal),
    (p_tweed, s_formal),
    (p_aloha, s_hawaiian),
    (p_mesh, s_hawaiian),
    (p_neon, s_street),
    (p_denim, s_street),
    (p_rainbow, s_teddy),
    (p_bear, s_teddy);
END $$;

-- Sample Gallery Images
INSERT INTO gallery_images (title, image_url, category, display_order) VALUES
('Velvet Cozy', '/gallery_velvet_cozy.png', 'gallery', 1),
('Walking Free', '/gallery_walking_free.png', 'gallery', 2),
('Gallery 1', '/gallery_1.png', 'gallery', 3),
('Gallery 2', '/gallery_2.png', 'gallery', 4),
('Gallery 4', '/gallery_4.png', 'gallery', 5),
('Gallery 5', '/gallery_5.png', 'gallery', 6);
