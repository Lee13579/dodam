-- Sample Data for Travel Destinations
-- Run this after the schema migration to populate initial data

-- Insert sample destinations
INSERT INTO travel_destinations (title, name, address, category, lat, lng, image_url, is_pet_friendly, custom_desc, tags, rating, review_count, badge, price_range, affiliate_partner) VALUES
-- Hotels
('그랜드 인터컨티넨탈 서울', 'Grand InterContinental Seoul', '서울특별시 강남구', 'Hotel', 37.5096, 127.0602, 'https://images.unsplash.com/photo-1566073771259-6a8506099945', true, '럭셔리한 반려견 동반 호텔', ARRAY['반려견 동반', '수영장', '스파'], 4.8, 342, 'BEST', '₩₩₩', 'agoda'),
('레스케이프 호텔', 'L''Escape Hotel', '서울특별시 중구', 'Hotel', 37.5599, 126.9806, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb', true, '도심 속 힐링 공간', ARRAY['반려견 동반', '루프탑', '조식 포함'], 4.6, 218, 'HOT', '₩₩', 'agoda'),

-- Cafes
('바이트 앤 십 퍼피 카페', 'Bite & Sip Puppy Cafe', '서울특별시 마포구', 'Cafe', 37.5555, 126.9230, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24', true, '반려견과 함께하는 브런치', ARRAY['반려견 동반', '브런치', '포토존'], 4.7, 156, 'NEW', '₩', null),
('어반 독', 'Urban Dog', '서울특별시 서초구', 'Cafe', 37.4870, 127.0150, 'https://images.unsplash.com/photo-1445116572660-236099ec97a0', true, '감성 애견 카페', ARRAY['반려견 동반', '디저트', '넓은 공간'], 4.5, 89, null, '₩', null),

-- Parks
('서울숲', 'Seoul Forest Park', '서울특별시 성동구', 'Park', 37.5444, 127.0374, 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae', true, '도심 속 자연 산책로', ARRAY['반려견 동반', '산책로', '넓은 잔디'], 4.9, 523, 'BEST', 'FREE', null),
('한강공원 여의도', 'Han River Park (Yeouido)', '서울특별시 영등포구', 'Park', 37.5284, 126.9344, 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f', true, '강변 산책의 명소', ARRAY['반려견 동반', '강변', '자전거'], 4.8, 412, null, 'FREE', null),
('반포한강공원', 'Banpo Hangang Park', '서울특별시 서초구', 'Park', 37.5098, 126.9947, 'https://images.unsplash.com/photo-1551632811-561732d1e306', true, '무지개 분수와 함께', ARRAY['반려견 동반', '분수쇼', '야경'], 4.7, 389, null, 'FREE', null),

-- Restaurants
('피기 앤 도기 BBQ', 'Piggy & Doggy BBQ', '서울특별시 강남구', 'Restaurant', 37.5160, 127.0400, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', true, '반려견과 함께하는 고기집', ARRAY['반려견 동반', 'BBQ', '테라스'], 4.6, 234, 'HOT', '₩₩', null),
('선샤인 브런치', 'Sunshine Brunch', '서울특별시 용산구', 'Restaurant', 37.5350, 126.9900, 'https://images.unsplash.com/photo-1550547660-d9450f859349', true, '햇살 가득한 브런치 맛집', ARRAY['반려견 동반', '브런치', '베이커리'], 4.8, 167, null, '₩₩', null),

-- Activities
('제주 애월 해변', 'Jeju Aewol Beach', '제주특별자치도 제주시 애월읍', 'Activity', 33.4673, 126.3189, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19', true, '반려견과 함께하는 해변 산책', ARRAY['반려견 동반', '해변', '일몰'], 4.9, 678, 'BEST', 'FREE', null),
('강원도 양양 서피비치', 'Yangyang Surfyy Beach', '강원특별자치도 양양군', 'Activity', 38.0756, 128.6190, 'https://images.unsplash.com/photo-1505142468610-359e7d316be0', true, '서핑과 함께하는 여행', ARRAY['반려견 동반', '서핑', '캠핑'], 4.7, 445, 'HOT', '₩', null),

-- Resorts
('펫파라다이스 리조트', 'Pet Paradise Resort', '경기도 가평군', 'Resort', 37.8314, 127.5097, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d', true, '반려견 전용 리조트', ARRAY['반려견 동반', '수영장', '놀이터', '넓은 마당'], 4.9, 892, 'BEST', '₩₩₩', 'klook'),
('강촌 펫 스테이', 'Gangchon Pet Stay', '강원특별자치도 춘천시', 'Resort', 37.8044, 127.5768, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', true, '자연 속 힐링 펜션', ARRAY['반려견 동반', '바베큐', '계곡'], 4.7, 567, 'HOT', '₩₩', 'klook');

-- Insert travel picks (curated categories)
INSERT INTO travel_picks (category_id, category_title, category_desc, destination_id, display_order, is_featured)
SELECT 
    'resort',
    '우리 아이 호캉스 🏨',
    '따뜻한 실내에서 즐기는 프리미엄 휴식',
    id,
    ROW_NUMBER() OVER (ORDER BY rating DESC),
    rating >= 4.8
FROM travel_destinations
WHERE category IN ('Hotel', 'Resort');

INSERT INTO travel_picks (category_id, category_title, category_desc, destination_id, display_order, is_featured)
SELECT 
    'activity',
    '추천 액티비티 🎈',
    '놓치면 아쉬운 이번 주 반려견 행사',
    id,
    ROW_NUMBER() OVER (ORDER BY rating DESC),
    rating >= 4.7
FROM travel_destinations
WHERE category = 'Activity';

INSERT INTO travel_picks (category_id, category_title, category_desc, destination_id, display_order, is_featured)
SELECT 
    'play',
    '신나는 순간 🐾',
    '활동적인 아이들을 위한 최적의 코스',
    id,
    ROW_NUMBER() OVER (ORDER BY rating DESC),
    rating >= 4.6
FROM travel_destinations
WHERE category IN ('Park', 'Activity');

INSERT INTO travel_picks (category_id, category_title, category_desc, destination_id, display_order, is_featured)
SELECT 
    'nature',
    '자연과 함께 🌳',
    '맑은 공기 마시며 즐기는 야외 산책',
    id,
    ROW_NUMBER() OVER (ORDER BY rating DESC),
    rating >= 4.5
FROM travel_destinations
WHERE category IN ('Park', 'Resort');

-- Initialize analytics for all destinations
INSERT INTO destination_analytics (destination_id, view_count, favorite_count, booking_count)
SELECT 
    id,
    FLOOR(RANDOM() * 1000 + 100)::INTEGER,
    FLOOR(RANDOM() * 200 + 20)::INTEGER,
    FLOOR(RANDOM() * 50 + 5)::INTEGER
FROM travel_destinations;

-- Update last_viewed_at for analytics
UPDATE destination_analytics
SET last_viewed_at = NOW() - (RANDOM() * INTERVAL '30 days');
