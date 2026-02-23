# 🚀 Quick Start Guide: Fixing Fireflies Integration

## ✅ What We Fixed

1. **Service Role Client**: Created a dedicated Supabase client that bypasses RLS for webhooks
2. **Webhook Authentication**: Excluded `/api/webhooks/*` and `/api/inngest` from auth middleware
3. **Fireflies API Schema**: Fixed GraphQL queries to use correct field names (`speaker_id`, `speaker_name`)
4. **User Association**: Added logic to associate meetings with users (currently using system user)
5. **Error Handling**: Added comprehensive logging and error messages

## 🔴 Current Issue: Database Tables Don't Exist

The webhook is working, but the database tables haven't been created yet.

## 🛠️ Solution: Apply the Database Schema

### **Option 1: Supabase Dashboard (Recommended - 2 minutes)**

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard
   - Select your project: `hnzkneliozspuocswrsa`
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

2. **Copy and Paste the Schema**:
   - Open the file: `supabase/schema.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor

3. **Run the SQL**:
   - Click the "Run" button (or press Cmd+Enter)
   - Wait for success message

4. **Verify Tables Created**:
   - Go to "Table Editor" in the left sidebar
   - You should see `meetings` and `insights` tables

### **Option 2: Using Supabase CLI (If installed)**

```bash
# Install Supabase CLI if you haven't
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref hnzkneliozspuocswrsa

# Apply the schema
supabase db push
```

### **Option 3: Direct SQL Execution**

If you have `psql` installed:

```bash
# You'll need your database password from Supabase dashboard
psql 'postgresql://postgres:[YOUR-DB-PASSWORD]@db.hnzkneliozspuocswrsa.supabase.co:5432/postgres' \
  -f supabase/schema.sql
```

## 🧪 After Schema is Applied - Test the Integration

### **1. Test the Webhook Endpoint**

```bash
./test-fireflies-webhook.sh 01KHNN7QTCWHSCQWD1G7JKSW6P
```

Expected output:
```
✅ Webhook test successful!
📊 Check the Inngest dashboard: http://localhost:8288
📋 Check your meetings page: http://localhost:3000/meetings
```

### **2. Check the Inngest Dashboard**

Open: http://localhost:8288

You should see:
- The `processUxInsights` function registered
- A new run triggered by the webhook
- Real-time processing logs

### **3. Verify Data in Supabase**

1. Go to Supabase Dashboard → Table Editor
2. Check the `meetings` table - you should see 1 new row
3. Wait for Inngest to finish processing
4. Check the `insights` table - you should see extracted insights

### **4. View in the App**

Open: http://localhost:3000/meetings

You should see the imported meeting from Fireflies!

## 📋 Complete Testing Checklist

- [ ] Database schema applied successfully
- [ ] Webhook test returns success
- [ ] Inngest dashboard shows function run
- [ ] Meeting appears in Supabase `meetings` table
- [ ] Insights appear in Supabase `insights` table
- [ ] Meeting visible at http://localhost:3000/meetings

## 🔧 Setting Up Fireflies Webhook (Production)

### **For Local Testing with ngrok:**

```bash
# Install ngrok
brew install ngrok

# Start ngrok tunnel
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

### **Configure in Fireflies:**

1. Go to: https://fireflies.ai/integrations
2. Find "Webhooks" section
3. Add webhook URL: `https://your-ngrok-url.ngrok.io/api/webhooks/fireflies`
4. Select events: "Transcription Complete"
5. Save

### **For Production:**

Use your production URL:
```
https://your-domain.com/api/webhooks/fireflies
```

## 🎯 What Happens When Fireflies Sends a Webhook

1. **Fireflies** completes a transcription → sends webhook to your endpoint
2. **Your Webhook** receives the event → fetches full transcript from Fireflies API
3. **Database** stores the meeting (using service role to bypass RLS)
4. **Inngest** triggers background job for AI analysis
5. **Claude AI** analyzes transcript → extracts UX insights
6. **Database** stores insights (friction points, feature requests, etc.)
7. **User** sees meeting and insights in the app

## 📊 Monitoring & Debugging

### **Check Webhook Logs:**
```bash
# Terminal running npm run dev will show:
📥 Received Fireflies Webhook: {...}
🔍 Fetching transcript...
✅ Retrieved transcript: "Meeting Title"
💾 Inserting meeting into database...
✅ Meeting created with ID: ...
🚀 Triggering Inngest job...
✅ Webhook processing complete
```

### **Check Inngest Logs:**
- Open: http://localhost:8288
- Click on the function run
- View detailed step-by-step logs

### **Check Supabase Logs:**
- Supabase Dashboard → Logs
- Filter by table: `meetings` or `insights`

## 🐛 Common Issues & Solutions

### Issue: "Table 'meetings' not found"
**Solution**: Apply the database schema (see above)

### Issue: "User not found for email"
**Solution**: Currently using system user. To fix:
1. Create a user mapping table
2. Update webhook to look up users by email
3. Or manually associate meetings with users later

### Issue: "FIREFLIES_API_KEY is not set"
**Solution**: Check `.env.local` has `FIREFLIES_API_KEY=...`

### Issue: Webhook returns 404
**Solution**: Make sure Next.js dev server is running (`npm run dev`)

### Issue: Inngest job not triggering
**Solution**: Make sure Inngest dev server is running (`npx inngest-cli@latest dev`)

## 📚 Files Created/Modified

### **New Files:**
- `src/lib/supabase/service.ts` - Service role client for webhooks
- `FIREFLIES_INTEGRATION.md` - Detailed integration guide
- `test-fireflies-webhook.sh` - Webhook testing script
- `list-fireflies-transcripts.sh` - List available transcripts
- `apply-schema.sh` - Schema application helper

### **Modified Files:**
- `src/app/api/webhooks/fireflies/route.ts` - Fixed to use service client
- `src/lib/inngest/functions.ts` - Updated to use service client
- `src/services/fireflies.ts` - Fixed GraphQL field names
- `src/middleware.ts` - Excluded webhooks from auth
- `supabase/schema.sql` - Made idempotent with `if not exists`

## 🎉 Next Steps

1. **Apply the database schema** (see Option 1 above)
2. **Test the webhook** with the test script
3. **Set up ngrok** for local Fireflies testing
4. **Configure Fireflies webhook** to point to your URL
5. **Have a meeting** and watch it automatically import! 🚀

---

**Need Help?** Check the logs in:
- Terminal running `npm run dev`
- Inngest dashboard at http://localhost:8288
- Supabase dashboard logs
