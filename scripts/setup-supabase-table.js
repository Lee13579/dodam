
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const connectionString = `postgresql://postgres:dkssudgktpdy1!@db.iupyonfezyujccbqtndt.supabase.co:5432/postgres`;

async function setupDB() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("Connected to Supabase PostgreSQL!");

        const query = `
            create table if not exists public.places (
                id text primary key,
                title text not null,
                address text,
                category text,
                imageUrl text,
                rating numeric(3,1),
                reviewCount integer,
                lat double precision,
                lng double precision,
                tags text[],
                theme_id text,
                created_at timestamp with time zone default timezone('utc'::text, now()) not null
            );
            create index if not exists idx_places_theme on public.places(theme_id);
            alter table public.places enable row level security;
            drop policy if exists "Allow public access" on public.places;
            create policy "Allow public access" on public.places for all using (true);
        `;

        await client.query(query);
        console.log("✅ Table and Policies created successfully via MCP!");
    } catch (err) {
        console.error("❌ DB Setup Error:", err.message);
    } finally {
        await client.end();
    }
}

setupDB();
