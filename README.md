# ampAI

Private chat web app: **Next.js (App Router)** + **react-native-web** + **NativeWind**, **Supabase** (email magic link + Postgres + RLS), and a **Mac Mini LLM gateway** in front of LM Studio.

## Web now, native later

This repo ships a **web** app from Next.js. The UI uses React Native primitives so you can later add an Expo app or monorepo and reuse `components/`. Next.js alone does not produce iOS/Android binaries.

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase and gateway values.
2. In Supabase SQL editor (or CLI), run `supabase/migrations/001_initial_schema.sql`.
3. Enable **Email** auth. Under **URL configuration**, add your site URL and redirect allow list, including `/callback` (e.g. `http://localhost:3000/callback`).
4. In **Authentication → Email templates**, use the **Magic Link** style template (link to sign in) rather than a code-only template if you want click-to-sign-in only.
5. `npm install` and `npm run dev`.

### “Email rate limit exceeded”

Supabase limits how many auth emails (magic links, etc.) can be sent per hour when you use their **built-in** email. Hitting “Send sign-in email” repeatedly during development burns through that quota quickly. **Wait** for the window to reset (often up to an hour), or connect **custom SMTP** under **Project Settings → Authentication** so you control deliverability and limits. See [Auth rate limits](https://supabase.com/docs/guides/auth/rate-limits).

## LLM gateway (`llm-gateway/`)

Run on the machine that can reach LM Studio (e.g. Mac Mini):

```bash
cd llm-gateway
cp .env.example .env
npm install
npm run dev
```

Set `LLM_GATEWAY_URL` in Vercel to `https://<your-gateway-host>/chat` and `LLM_GATEWAY_SECRET` to the same value as `GATEWAY_SECRET` on the gateway.

## Scripts

- `npm run dev` — Next.js dev server
- `npm run build` — production build
