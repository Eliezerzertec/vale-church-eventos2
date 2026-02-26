import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

async function applyMigration() {
  try {
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260223000000_add_payment_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('📝 Executing migration...');
    console.log(sql);
    
    // Execute using RPC or direct query
    // For Supabase, we need to use admin credentials to execute DDL
    // This requires using the Service Role Key, not the anon key
    console.log('\n⚠️  Note: To execute DDL migrations, you need to:');
    console.log('1. Go to https://app.supabase.com/project/cwzmiznlvhhnpjgxgsme/sql');
    console.log('2. Create a new query and paste the SQL below:');
    console.log('\n---');
    console.log(sql);
    console.log('---\n');
    console.log('3. Execute the query');
    console.log('4. Verify the changes in the tables view');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration();
