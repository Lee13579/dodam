const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase Environment Variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const DATA_PATH = path.join(process.cwd(), 'src/data/places.json');

async function migrate() {
    console.log("🚀 Starting MCP Migration to Supabase...");

    if (!fs.existsSync(DATA_PATH)) {
        console.log("❌ No local data file found at src/data/places.json");
        return;
    }

    const db = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    let totalInserted = 0;

    for (const [themeId, items] of Object.entries(db)) {
        console.log(`📦 Migrating theme: ${themeId} (${items.length} items)`);
        
        const transformedItems = items.map(item => ({
            id: item.id,
            title: item.title,
            address: item.address,
            category: item.category,
            imageUrl: item.imageUrl,
            rating: parseFloat(item.rating || 0),
            reviewCount: item.reviewCount || 0,
            lat: item.lat,
            lng: item.lng,
            tags: item.tags,
            theme_id: themeId
        }));

        const { error } = await supabase
            .from('places')
            .upsert(transformedItems, { onConflict: 'id' });

        if (error) {
            console.error(`❌ Error migrating ${themeId}:`, error.message);
        } else {
            totalInserted += transformedItems.length;
            console.log(`✅ Successfully migrated ${themeId}`);
        }
    }

    console.log(`\n🎉 MCP Migration Complete! Total items in Supabase: ${totalInserted}`);
}

migrate();