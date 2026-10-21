# Deployment Guide: Vercel + Railway

This guide replaces the Render deployment model with a robust combination of **Vercel** for the Next.js Frontend/API, and **Railway** for the Inngest Background Worker.

---

## 1. Deploying the Next.js App to Vercel

Vercel is purpose-built for Next.js and provides the best performance and developer experience.

### Steps:
1. Go to [Vercel](https://vercel.com) and sign in.
2. Click **Add New... > Project** and import your `kodasync` GitHub repository.
3. Vercel will automatically detect that it's a Next.js project.
4. **Environment Variables**: Add all your environment variables from `.env` to Vercel's Environment Variables section. (Make sure to include `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, etc.)
   * Note: For `AUTH_URL`, you can leave it blank initially or set it to Vercel's preview URL, but eventually update it to your production domain (e.g., `https://kodasync.app`).
5. Click **Deploy**.

Vercel will use the `vercel.json` in your repository to configure security headers automatically.

---

## 2. Deploying the Background Worker to Railway

Railway will run your standalone Node.js process that handles long-running background jobs via Inngest. 

We have added a `railway.json` file and a `start:worker:prod` script to support this natively.

### Steps:
1. Go to [Railway](https://railway.app/) and sign in.
2. Click **New Project > Deploy from GitHub repo** and select your `kodasync` repository.
3. Railway will automatically detect the `railway.json` file and know how to build and start your worker service.
4. **Environment Variables**: Go to the **Variables** tab for this service in Railway and add the following required variables:
   - `NODE_ENV=production`
   - `INNGEST_EVENT_KEY` (Get from Inngest dashboard)
   - `INNGEST_SIGNING_KEY` (Get from Inngest dashboard)
   - `GEMINI_API_KEY` (or `ANTHROPIC_API_KEY`)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Railway will automatically rebuild and deploy the worker once the variables are set.

---

## 3. Connecting Inngest to the Vercel App

Inngest needs to know where your Next.js API route is so it can ping your application.

1. Go to the [Inngest Dashboard](https://app.inngest.com).
2. Navigate to your production environment.
3. Update the **App URL** to point to your new Vercel deployment:
   - `https://your-vercel-domain.vercel.app/api/inngest`
4. The background worker running on Railway will automatically pull jobs from Inngest, so you don't need a public URL for the Railway service itself. It connects out to Inngest.
