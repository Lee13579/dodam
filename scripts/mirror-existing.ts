
import { createClient } from '@supabase/supabase-js';
import { mirrorExternalImage } from '../src/lib/image-mirror';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function migrate() {
    console.log('Starting image mirroring migration...');

    // 1. Fetch all places with external URLs
    const { data: places, error } = await supabase
        .from('places')
        .select('id, title, imageUrl')
        .like('imageUrl', 'http%')
        .not('imageUrl', 'like', '%supabase.co%');

    if (error) {
        console.error('Error fetching places:', error);
        return;
    }

    console.log(`Found ${places?.length || 0} external images to mirror.`);

    if (!places) return;

    let successCount = 0;
    let failCount = 0;

    for (const place of places) {
        try {
            console.log(`Processing [${place.id}] ${place.title}...`);
            const mirroredUrl = await mirrorExternalImage(place.imageUrl);

            if (mirroredUrl && mirroredUrl.includes('supabase.co')) {
                const { error: updateError } = await supabase
                    .from('places')
                    .update({ imageUrl: mirroredUrl })
                    .eq('id', place.id);

                if (updateError) {
                    console.error(`Failed to update DB for ${place.id}:`, updateError);
                    failCount++;
                } else {
                    console.log(`Successfully mirrored: ${mirroredUrl}`);
                    successCount++;
                }
            } else {
                console.warn(`Mirroring returned same URL or failed for ${place.id}`);
                failCount++;
            }

            // Avoid rate limits
            await new Promise(r => setTimeout(r, 200));
        } catch (e) {
            console.error(`Error processing ${place.id}:`, e);
            failCount++;
        }
    }

    console.log('Migration completed.');
    console.log(`Stat: Success ${successCount}, Fail ${failCount}`);
}

migrate().catch(console.error);
