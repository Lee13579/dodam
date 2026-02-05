
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const BUCKET_NAME = 'travel-images';

let supabaseAdmin: SupabaseClient | null = null;

function getAdminClient() {
    if (supabaseAdmin) return supabaseAdmin;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase configuration missing (URL or Service Role Key)');
    }

    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    });
    return supabaseAdmin;
}

/**
 * Mirrors an external image to Supabase Storage with pre-optimization.
 */
export async function mirrorExternalImage(url: string): Promise<string> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (!url || url.startsWith(supabaseUrl)) return url;

    try {
        const client = getAdminClient();

        // 1. Generate a unique filename (always .webp)
        // Using a simpler hash for Node compatibility if subtle crypto is tricky
        const crypto = await import('node:crypto');
        const hashHex = crypto.createHash('sha256').update(url).digest('hex');
        const filePath = `${hashHex}.webp`;

        // 2. Check if already mirrored
        const { data: existingFile, error: listError } = await client.storage
            .from(BUCKET_NAME)
            .list('', { search: filePath });

        if (listError) {
            console.error('List error for bucket:', BUCKET_NAME, listError);
        }

        if (existingFile && existingFile.length > 0) {
            return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
        }

        // 3. Fetch image
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

        const inputBuffer = Buffer.from(await response.arrayBuffer());

        // 4. Pre-optimization
        const optimizedBuffer = await sharp(inputBuffer)
            .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .rotate()
            .toBuffer();

        // 5. Upload
        const { error: uploadError } = await client.storage
            .from(BUCKET_NAME)
            .upload(filePath, optimizedBuffer, {
                contentType: 'image/webp',
                upsert: true
            });

        if (uploadError) {
            console.error(`Upload failed for ${filePath} in ${BUCKET_NAME}:`, uploadError);
            return url;
        }

        return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
    } catch (error) {
        console.error('Mirroring failed for URL:', url, error);
        return url;
    }
}
