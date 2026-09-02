# 04 · Platforms — Index (Frontend)

Every static host for the SPA. Same shape per file: **overview → build settings → env →
SPA fallback → custom domain → pros/cons → cost**.

| Platform              | Free tier           | SPA fallback                | Cold start | File                                                 |
| --------------------- | ------------------- | --------------------------- | ---------- | ---------------------------------------------------- |
| Vercel                | Yes                 | Automatic                   | None       | [vercel.md](vercel.md)                               |
| Cloudflare Pages      | Yes (huge)          | `_redirects`                | None       | [cloudflare-pages.md](cloudflare-pages.md)           |
| Netlify               | Yes                 | `_redirects`/`netlify.toml` | None       | [netlify.md](netlify.md)                             |
| Azure Static Web Apps | Yes                 | `staticwebapp.config.json`  | None       | [azure-static-web-apps.md](azure-static-web-apps.md) |
| AWS S3 + CloudFront   | Pay-per-use (cheap) | CloudFront error routing    | None       | [aws-s3-cloudfront.md](aws-s3-cloudfront.md)         |

> **Note:** All FE hosts serve static files from a CDN, so there are **no cold starts**
> on the frontend. Latency concerns live entirely in the backend.

## Recommended pairings

| Scenario              | FE                           | BE (see BE guide)  |
| --------------------- | ---------------------------- | ------------------ |
| Free demo (simplest)  | Vercel                       | Render             |
| Free demo (always-on) | Cloudflare Pages             | Fly.io             |
| Enterprise AWS        | S3 + CloudFront (or Amplify) | ECS Fargate        |
| Enterprise Azure      | Static Web Apps              | Container Apps     |
| Full control          | Same VPS as BE (nginx/Caddy) | VPS Docker Compose |

Common settings for every host:

- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm build`
- Output: `dist`
- Env: `VITE_API_BASE_URL` (build-time)
