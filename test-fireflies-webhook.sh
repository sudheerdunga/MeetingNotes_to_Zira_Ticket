#!/bin/bash

# Test script for Fireflies webhook
# This script tests the webhook endpoint with a sample payload

echo "🧪 Testing Fireflies Webhook..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if transcript ID is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}⚠️  No transcript ID provided. Using test payload...${NC}"
    echo ""
    
    # Test with a mock payload (will fail to fetch from Fireflies but tests the endpoint)
    PAYLOAD='{
        "eventType": "transcription_complete",
        "transcriptId": "test-transcript-id",
        "organizer_email": "test@example.com"
    }'
    
    echo "📤 Sending test payload:"
    echo "$PAYLOAD" | jq .
    echo ""
    
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/webhooks/fireflies \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD")
    
    echo "📥 Response:"
    echo "$RESPONSE" | jq .
    
    if echo "$RESPONSE" | jq -e '.error' > /dev/null; then
        echo -e "\n${RED}❌ Test failed (expected - no real transcript)${NC}"
        echo -e "${YELLOW}💡 To test with a real transcript, run:${NC}"
        echo -e "${YELLOW}   ./test-fireflies-webhook.sh YOUR_TRANSCRIPT_ID${NC}"
    else
        echo -e "\n${GREEN}✅ Endpoint is responding${NC}"
    fi
else
    echo -e "${GREEN}✅ Using transcript ID: $1${NC}"
    echo ""
    
    PAYLOAD="{
        \"eventType\": \"transcription_complete\",
        \"transcriptId\": \"$1\",
        \"organizer_email\": \"${2:-test@example.com}\"
    }"
    
    echo "📤 Sending payload:"
    echo "$PAYLOAD" | jq .
    echo ""
    
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/webhooks/fireflies \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD")
    
    echo "📥 Response:"
    echo "$RESPONSE" | jq .
    
    if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
        echo -e "\n${GREEN}✅ Webhook test successful!${NC}"
        echo -e "${GREEN}📊 Check the Inngest dashboard: http://localhost:8288${NC}"
        echo -e "${GREEN}📋 Check your meetings page: http://localhost:3000/meetings${NC}"
    else
        echo -e "\n${RED}❌ Webhook test failed${NC}"
        echo -e "${YELLOW}💡 Check the server logs for more details${NC}"
    fi
fi

echo ""
echo "📝 Usage:"
echo "  ./test-fireflies-webhook.sh                          # Test endpoint only"
echo "  ./test-fireflies-webhook.sh TRANSCRIPT_ID            # Test with real transcript"
echo "  ./test-fireflies-webhook.sh TRANSCRIPT_ID EMAIL      # Test with specific user email"
