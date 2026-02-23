# Fireflies AI Integration Guide

## 🎯 Overview
This guide explains how to set up and test the Fireflies AI webhook integration for automatically importing meeting transcripts into InsightLoop.

## 🔧 Setup Steps

### 1. **Webhook Endpoint**
Your webhook endpoint is available at:
```
http://localhost:3000/api/webhooks/fireflies (for local testing)
https://your-domain.com/api/webhooks/fireflies (for production)
```

### 2. **Configure Fireflies Webhook**

1. Log in to [Fireflies.ai](https://fireflies.ai)
2. Go to **Settings** → **Integrations** → **Webhooks**
3. Add a new webhook with:
   - **URL**: `https://your-domain.com/api/webhooks/fireflies`
   - **Events**: Select "Transcription Complete" or similar
   - **Secret**: (optional, for webhook verification)

### 3. **For Local Testing with ngrok**

Since Fireflies needs a public URL, use ngrok for local testing:

```bash
# Install ngrok if you haven't
brew install ngrok

# Start ngrok tunnel
ngrok http 3000
```

Then use the ngrok URL in Fireflies:
```
https://your-ngrok-url.ngrok.io/api/webhooks/fireflies
```

## 📋 Expected Webhook Payload

Fireflies typically sends a payload like:
```json
{
  "eventType": "transcription_complete",
  "transcriptId": "abc123...",
  "meetingId": "xyz789...",
  "organizer_email": "user@example.com",
  "title": "Product Strategy Meeting",
  "date": "2026-02-17T10:00:00Z"
}
```

## 🧪 Testing the Webhook

### Option 1: Manual Test with curl

```bash
curl -X POST http://localhost:3000/api/webhooks/fireflies \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "transcription_complete",
    "transcriptId": "YOUR_REAL_TRANSCRIPT_ID",
    "organizer_email": "your-email@example.com"
  }'
```

### Option 2: Test with a Real Fireflies Transcript

1. Get a transcript ID from Fireflies dashboard
2. Use the test endpoint:

```bash
curl -X POST http://localhost:3000/api/webhooks/fireflies \
  -H "Content-Type: application/json" \
  -d '{
    "transcriptId": "REAL_TRANSCRIPT_ID_FROM_FIREFLIES"
  }'
```

## 🔍 How It Works

1. **Webhook Receives Data**: Fireflies sends a POST request with transcript info
2. **Fetch Full Transcript**: The webhook fetches complete transcript data from Fireflies API
3. **User Association**: 
   - Tries to match `organizer_email` to a user in your database
   - Falls back to `system-fireflies-import` if no user found
4. **Store in Database**: Meeting is saved to Supabase (bypasses RLS using service role)
5. **Trigger AI Analysis**: Inngest job is triggered to extract UX insights
6. **Process Insights**: Claude analyzes the transcript and saves insights to database

## 🐛 Troubleshooting

### Issue: "User not found for email"
**Solution**: The organizer email doesn't match any user in your system. Options:
- Create a user account with that email first
- Modify the webhook to create users automatically
- Use a default system user (current behavior)

### Issue: "Transcript not found in Fireflies"
**Solution**: 
- Verify the transcript ID is correct
- Check that `FIREFLIES_API_KEY` is valid in `.env.local`
- Ensure the transcript exists and is accessible via the API

### Issue: "Failed to store meeting"
**Solution**: Check the server logs for Supabase errors. Common causes:
- Database connection issues
- Missing `SUPABASE_SERVICE_ROLE_KEY`
- Database schema mismatch

## 📊 Monitoring

Check the logs for detailed information:
- ✅ Success indicators (green checkmarks)
- ❌ Error indicators (red X)
- 🔍 Processing steps
- 🚀 Inngest job triggers

Example successful log:
```
📥 Received Fireflies Webhook: {...}
🔍 Fetching transcript abc123 from Fireflies...
✅ Retrieved transcript: "Product Strategy Meeting"
🔍 Looking up user by email: user@example.com
✅ Found user: user_123
💾 Inserting meeting into database for user: user_123
✅ Meeting created with ID: meeting_456
🚀 Triggering Inngest job for UX insights processing...
✅ Webhook processing complete
```

## 🔐 Security Considerations

1. **Service Role Key**: The webhook uses the service role key to bypass RLS. Keep this secure!
2. **Webhook Verification**: Consider adding webhook signature verification
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **User Validation**: Ensure only authorized users can trigger imports

## 🎯 Next Steps

1. Set up ngrok for local testing
2. Configure Fireflies webhook with your URL
3. Test with a real transcript
4. Monitor the Inngest dashboard at `http://localhost:8288`
5. Check the meetings page to see imported meetings
