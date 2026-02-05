
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function check() {
    console.log('Project URL:', supabaseUrl);
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
        console.error('Error listing buckets:', error);
    } else {
        console.log('Existing buckets:', buckets.map(b => b.id));
        const exists = buckets.some(b => b.id === 'travel-images');
        console.log('travel-images exists:', exists);

        if (!exists) {
            console.log('Attempting to create bucket again...');
            const { error: createError } = await supabaseAdmin.storage.createBucket('travel-images', { public: true });
            if (createError) console.error('Create error:', createError);
            else console.log('Bucket created.');
        }
    }
}

check();
