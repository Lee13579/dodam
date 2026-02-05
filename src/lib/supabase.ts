
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PlaceDB {
  id: string;
  title: string;
  address: string;
  category: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  lat: number;
  lng: number;
  tags: string[];
  theme_id: string; // To group by sections like 'resort', 'activity', etc.
  created_at?: string;
}
