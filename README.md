# TrustCheck

TrustCheck is a lightweight web app that evaluates written content for credibility signals and helps users identify unsupported claims, weak sourcing, and what to verify before relying on it.

## Tech Stack

- Next.js (App Router)
- React
- TypeScript

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+

## Local Setup

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

Open:

- http://localhost:3000

## Production Mode

Build:

```bash
npm run build
```

Start:

```bash
npm run start
```

Open:

- http://localhost:3000

## Environment Variables

No environment variables are required for V1.

Optional:

- `NEXT_TELEMETRY_DISABLED=1` to disable Next.js telemetry in local/CI environments.

## Deploy to Vercel (Simple)

### Option A: Vercel Dashboard (Recommended)

1. Push this project to GitHub/GitLab/Bitbucket.
2. Go to [https://vercel.com/new](https://vercel.com/new).
3. Import the repository.
4. Framework preset should auto-detect as **Next.js**.
5. Leave environment variables empty for V1.
6. Click **Deploy**.

After deploy:

- Vercel will provide a production URL.
- Future pushes to your default branch will auto-deploy.

### Option B: Vercel CLI

Install CLI:

```bash
npm i -g vercel
```

Deploy:

```bash
vercel
```

For production deploy:

```bash
vercel --prod
```

## Notes

- URL extraction supports public text-based webpages.
- Social video URLs are intentionally not supported in V1.
- If URL extraction fails, users can paste text manually and analyze it.
