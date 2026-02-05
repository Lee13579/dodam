
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function setup() {
    console.log('Checking Supabase Storage bucket...');
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
        process.exit(1);
    }

    const travelBucket = buckets.find(b => b.id === 'travel-images');
    if (!travelBucket) {
        console.log('Bucket "travel-images" not found. Creating...');
        const { error: createError } = await supabaseAdmin.storage.createBucket('travel-images', {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            fileSizeLimit: 10485760 // 10MB
        });

        if (createError) {
            console.error('Error creating bucket:', createError);
            process.exit(1);
        }
        console.log('Bucket created successfully.');
    } else {
        console.log('Bucket "travel-images" already exists.');
    }
}

setup();
