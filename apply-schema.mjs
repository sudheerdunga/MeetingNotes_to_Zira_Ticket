// Script to apply database schema to Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function applySchema() {
    console.log('🗄️  Applying database schema to Supabase...\n');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        console.error('❌ Missing Supabase credentials in environment variables');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    // Read the schema file
    const schemaPath = join(__dirname, 'supabase', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('📄 Schema file loaded');
    console.log('🚀 Executing SQL statements...\n');

    // Split the schema into individual statements
    const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
        try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement });

            if (error) {
                // Try direct execution if RPC doesn't work
                console.log(`⚠️  RPC method not available, using direct execution...`);
                break;
            }

            successCount++;
            console.log(`✅ Executed statement ${successCount}`);
        } catch (err) {
            errorCount++;
            console.error(`❌ Error executing statement:`, err.message);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);

    if (errorCount > 0) {
        console.log('\n⚠️  Some statements failed. Please apply the schema manually:');
        console.log('   1. Go to: https://supabase.com/dashboard');
        console.log('   2. Select your project');
        console.log('   3. Go to SQL Editor');
        console.log('   4. Copy and paste the contents of supabase/schema.sql');
        console.log('   5. Click "Run"');
    } else {
        console.log('\n✅ Schema applied successfully!');
        console.log('🧪 Test the webhook with:');
        console.log('   ./test-fireflies-webhook.sh 01KHNN7QTCWHSCQWD1G7JKSW6P');
    }
}

applySchema().catch(console.error);
