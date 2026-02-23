#!/bin/bash

# Script to list available Fireflies transcripts
# This helps you find a transcript ID to test with

echo "🔍 Fetching available Fireflies transcripts..."
echo ""

API_KEY="${FIREFLIES_API_KEY:-$(grep FIREFLIES_API_KEY .env.local | cut -d '=' -f2)}"

if [ -z "$API_KEY" ]; then
    echo "❌ FIREFLIES_API_KEY not found"
    echo "💡 Set it in .env.local or export it as an environment variable"
    exit 1
fi

QUERY='query { transcripts(limit: 5) { id title date } }'

RESPONSE=$(curl -s -X POST https://api.fireflies.ai/graphql \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d "{\"query\":\"$QUERY\"}")

echo "📋 Latest 5 transcripts:"
echo "$RESPONSE" | jq -r '.data.transcripts[] | "  ID: \(.id)\n  Title: \(.title)\n  Date: \(.date)\n"'

echo ""
echo "💡 To test the webhook with a transcript, run:"
echo "   ./test-fireflies-webhook.sh TRANSCRIPT_ID"
