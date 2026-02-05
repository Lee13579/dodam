/**
 * Supabase Migration Script for Travel Feature
 * Run this script once to set up the database schema
 * 
 * Usage: npx tsx scripts/migrate-travel-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const schema = `
-- Travel Destinations Table
CREATE TABLE IF NOT EXISTS travel_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    category TEXT NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    image_url TEXT,
    is_pet_friendly BOOLEAN DEFAULT true,
    custom_desc TEXT,
    tags TEXT[],
    rating DECIMAL(2, 1) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    badge TEXT,
    price_range TEXT,
    affiliate_url TEXT,
    affiliate_partner TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Travel Picks Categories
CREATE TABLE IF NOT EXISTS travel_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id TEXT NOT NULL,
    category_title TEXT NOT NULL,
    category_desc TEXT,
    destination_id UUID REFERENCES travel_destinations(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Itineraries
CREATE TABLE IF NOT EXISTS user_itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    title TEXT NOT NULL,
    region TEXT NOT NULL,
    people_count INTEGER DEFAULT 2,
    dog_count INTEGER DEFAULT 1,
    days TEXT DEFAULT '1 Day',
    conditions TEXT,
    places JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Favorites
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    destination_id UUID REFERENCES travel_destinations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, destination_id)
);

-- Destination Analytics
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_destinations_category ON travel_destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_location ON travel_destinations(lat, lng);
CREATE INDEX IF NOT EXISTS idx_destinations_rating ON travel_destinations(rating DESC);
CREATE INDEX IF NOT EXISTS idx_picks_category ON travel_picks(category_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_user ON user_itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_destination ON destination_analytics(destination_id);

-- Enable RLS
ALTER TABLE travel_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for destinations" ON travel_destinations;
DROP POLICY IF EXISTS "Public read access for picks" ON travel_picks;
DROP POLICY IF EXISTS "Public read access for analytics" ON destination_analytics;
DROP POLICY IF EXISTS "Users can view their own itineraries" ON user_itineraries;
DROP POLICY IF EXISTS "Users can insert their own itineraries" ON user_itineraries;
DROP POLICY IF EXISTS "Users can update their own itineraries" ON user_itineraries;
DROP POLICY IF EXISTS "Users can delete their own itineraries" ON user_itineraries;
DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON user_favorites;

-- RLS Policies
CREATE POLICY "Public read access for destinations" ON travel_destinations FOR SELECT USING (true);
CREATE POLICY "Public read access for picks" ON travel_picks FOR SELECT USING (true);
CREATE POLICY "Public read access for analytics" ON destination_analytics FOR SELECT USING (true);
CREATE POLICY "Users can view their own itineraries" ON user_itineraries FOR SELECT USING (true);
CREATE POLICY "Users can insert their own itineraries" ON user_itineraries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own itineraries" ON user_itineraries FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own itineraries" ON user_itineraries FOR DELETE USING (true);
CREATE POLICY "Users can view their own favorites" ON user_favorites FOR SELECT USING (true);
CREATE POLICY "Users can insert their own favorites" ON user_favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete their own favorites" ON user_favorites FOR DELETE USING (true);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_destinations_updated_at ON travel_destinations;
DROP TRIGGER IF EXISTS update_itineraries_updated_at ON user_itineraries;
DROP TRIGGER IF EXISTS update_analytics_updated_at ON destination_analytics;

-- Create triggers
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON travel_destinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_itineraries_updated_at BEFORE UPDATE ON user_itineraries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON destination_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function migrate() {
    console.log('🚀 Starting migration...\n');
    console.log('Supabase URL:', supabaseUrl);

    try {
        // Execute the schema
        const { data, error } = await supabase.rpc('exec_sql', { sql: schema });

        if (error) {
            // If exec_sql doesn't exist, try direct execution (requires service role key)
            console.log('⚠️  exec_sql RPC not found, trying direct SQL execution...\n');

            // Split schema into individual statements
            const statements = schema
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            console.log(`📝 Executing ${statements.length} SQL statements...\n`);

            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                if (statement) {
                    try {
                        console.log(`[${i + 1}/${statements.length}] Executing...`);
                        const { error: execError } = await supabase.rpc('exec', { sql: statement + ';' });
                        if (execError) {
                            console.error(`❌ Error in statement ${i + 1}:`, execError.message);
                        } else {
                            console.log(`✅ Statement ${i + 1} completed`);
                        }
                    } catch (e: any) {
                        console.error(`❌ Error in statement ${i + 1}:`, e.message);
                    }
                }
            }
        } else {
            console.log('✅ Migration completed successfully!');
            console.log('Data:', data);
        }

        console.log('\n🎉 Database schema created successfully!');
        console.log('\n📋 Created tables:');
        console.log('  - travel_destinations');
        console.log('  - travel_picks');
        console.log('  - user_itineraries');
        console.log('  - user_favorites');
        console.log('  - destination_analytics');

    } catch (error: any) {
        console.error('❌ Migration failed:', error.message);
        console.error('\n💡 Please run the SQL manually in Supabase Dashboard:');
        console.error('   https://supabase.com/dashboard/project/iupyonfezyujccbqtndt/editor');
        console.error('\n📄 SQL file location: /tmp/travel_schema.sql');
        process.exit(1);
    }
}

migrate();
