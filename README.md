# Demire Portfolio

Vite + React portfolio with a shared visitor counter deployed on Vercel.

## Local setup

```bash
npm install
npm run dev
```

The site runs at `http://localhost:5173`. The visitor counter falls back to a browser-local count unless Redis environment variables are available.

## Deploying to Vercel

1. Import this repository/project into Vercel.
2. In the Vercel project, add the Upstash Redis integration:

   **Storage → Create Database → Upstash Redis**

   Link it to this Vercel project. The integration supplies the Redis environment variables automatically.
3. Redeploy.

The `/api/visitors` Vercel function uses `@upstash/redis` and `Redis.fromEnv()` to read those environment variables.

## Visitor behavior

- First visit from a browser: `POST /api/visitors` increments the shared Redis count.
- Later visits from that browser: `GET /api/visitors` reads the shared count.
- `localStorage` prevents the same browser from incrementing the count again after refreshes or future sessions.

This is a lightweight portfolio counter, not fraud-proof analytics. Clearing browser storage, using another browser/device, or deliberately calling the endpoint can create additional counts.


## Redis troubleshooting
If `/api/visitors` returns an error, this version includes temporary diagnostics showing `details`, `hasRedisUrl`, and `hasRedisToken`. These values do not expose the Redis credentials.
