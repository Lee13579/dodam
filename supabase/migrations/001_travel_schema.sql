-- Travel Destinations Table
CREATE TABLE IF NOT EXISTS travel_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Hotel', 'Cafe', 'Park', 'Restaurant', 'Activity', etc.
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    image_url TEXT,
    is_pet_friendly BOOLEAN DEFAULT true,
    custom_desc TEXT,
    tags TEXT[], -- Array of tags like ['반려견 동반', '수영장', '넓은 마당']
    rating DECIMAL(2, 1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    badge TEXT, -- 'NEW', 'HOT', 'BEST', etc.
    price_range TEXT, -- '₩₩₩', '₩₩', '₩', etc.
    affiliate_url TEXT, -- Agoda, Klook, etc.
    affiliate_partner TEXT, -- 'agoda', 'klook', 'naver', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Travel Picks Categories (Curated by Dodam)
CREATE TABLE IF NOT EXISTS travel_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id TEXT NOT NULL, -- 'resort', 'activity', 'play', 'nature'
    category_title TEXT NOT NULL,
    category_desc TEXT,
    destination_id UUID REFERENCES travel_destinations(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Itineraries (AI-generated or manually created)
CREATE TABLE IF NOT EXISTS user_itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, -- Can be anonymous session ID or authenticated user ID
    title TEXT NOT NULL,
    region TEXT NOT NULL,
    people_count INTEGER DEFAULT 2,
    dog_count INTEGER DEFAULT 1,
    days TEXT DEFAULT '1 Day',
    conditions TEXT,
    places JSONB NOT NULL, -- Array of Place objects with full details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Favorites (Wishlist)
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    destination_id UUID REFERENCES travel_destinations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, destination_id)
);

-- Trending Destinations View (based on favorites and views)
CREATE TABLE IF NOT EXISTS destination_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID REFERENCES travel_destinations(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(destination_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_destinations_category ON travel_destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_location ON travel_destinations(lat, lng);
CREATE INDEX IF NOT EXISTS idx_destinations_rating ON travel_destinations(rating DESC);
CREATE INDEX IF NOT EXISTS idx_picks_category ON travel_picks(category_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_user ON user_itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_destination ON destination_analytics(destination_id);

-- Enable Row Level Security (RLS)
ALTER TABLE travel_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for destinations and picks
CREATE POLICY "Public read access for destinations" ON travel_destinations
    FOR SELECT USING (true);

CREATE POLICY "Public read access for picks" ON travel_picks
    FOR SELECT USING (true);

CREATE POLICY "Public read access for analytics" ON destination_analytics
    FOR SELECT USING (true);

-- RLS Policies: Users can manage their own itineraries
CREATE POLICY "Users can view their own itineraries" ON user_itineraries
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own itineraries" ON user_itineraries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own itineraries" ON user_itineraries
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own itineraries" ON user_itineraries
    FOR DELETE USING (true);

-- RLS Policies: Users can manage their own favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own favorites" ON user_favorites
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own favorites" ON user_favorites
    FOR DELETE USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON travel_destinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON user_itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON destination_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
