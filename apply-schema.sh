#!/bin/bash

# Script to apply the database schema to Supabase
# This creates the meetings and insights tables

echo "🗄️  Applying database schema to Supabase..."
echo ""

# Get Supabase credentials from .env.local
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
SERVICE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
    echo "❌ Could not find Supabase credentials in .env.local"
    exit 1
fi

# Extract project reference from URL (e.g., https://abc123.supabase.co -> abc123)
PROJECT_REF=$(echo $SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')

echo "📍 Project: $PROJECT_REF"
echo "📄 Reading schema from: supabase/schema.sql"
echo ""

# Read the SQL file
SQL_CONTENT=$(cat supabase/schema.sql)

# Execute the SQL using Supabase REST API
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"${SQL_CONTENT}\"}")

# Alternative: Use psql if available
echo "⚠️  Note: The REST API method above may not work for DDL statements."
echo "📝 Recommended approach: Copy the SQL from supabase/schema.sql and run it in the Supabase SQL Editor"
echo ""
echo "🌐 Open the SQL Editor:"
echo "   https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
echo ""
echo "📋 Or run this command if you have psql installed:"
echo "   psql 'postgresql://postgres:[YOUR-PASSWORD]@db.${PROJECT_REF}.supabase.co:5432/postgres' -f supabase/schema.sql"
echo ""
echo "✅ Once applied, test the webhook again with:"
echo "   ./test-fireflies-webhook.sh 01KHNN7QTCWHSCQWD1G7JKSW6P"
