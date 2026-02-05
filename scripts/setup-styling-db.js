
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

// Using the same connection string as found in existing scripts
// Ideally this should be in .env, but following project pattern for now
const connectionString = process.env.DATABASE_URL || `postgresql://postgres:dkssudgktpdy1!@db.iupyonfezyujccbqtndt.supabase.co:5432/postgres`;

async function setupStylingDB() {
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        console.log("Connected to Supabase PostgreSQL!");

        const migrationPath = path.join(__dirname, '../supabase/migrations/003_styling_schema.sql');
        const seedPath = path.join(__dirname, '../supabase/migrations/004_styling_sample_data.sql');

        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        console.log("Applying Styling Schema...");
        await client.query(migrationSql);
        console.log("✅ Styling Schema applied successfully!");

        console.log("Applying Sample Data...");
        await client.query(seedSql);
        console.log("✅ Sample Data applied successfully!");

    } catch (err) {
        console.error("❌ DB Setup Error:", err.message);
        if (err.detail) console.error("Detail:", err.detail);
    } finally {
        await client.end();
    }
}

setupStylingDB();
