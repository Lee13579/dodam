
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function testUpload() {
    const content = 'test ' + Date.now();
    const fileName = 'test-' + Date.now() + '.txt';

    console.log('Testing upload to travel-images...');
    const { data, error } = await supabaseAdmin.storage
        .from('travel-images')
        .upload(fileName, Buffer.from(content), {
            contentType: 'text/plain',
            upsert: true
        });

    if (error) {
        console.error('Upload Error:', error);
    } else {
        console.log('Upload Success:', data);
        const { data: publicUrl } = supabaseAdmin.storage.from('travel-images').getPublicUrl(fileName);
        console.log('Public URL:', publicUrl.publicUrl);
    }
}

testUpload();
