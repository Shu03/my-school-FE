# Vercel (Frontend)

> **Model:** Git-connected static/edge hosting, auto-detects Vite. **Cost:** Hobby free.
> **Cold start:** none. **Recommended default for the demo.**

## Build settings

| Setting          | Value                                       |
| ---------------- | ------------------------------------------- |
| Framework preset | Vite (auto)                                 |
| Install          | `pnpm install` (auto from `pnpm-lock.yaml`) |
| Build            | `pnpm build`                                |
| Output           | `dist`                                      |

## Deploy

1. Vercel → **Add New → Project** → import `my-school-FE`.
2. Add env var (Production + Preview): `VITE_API_BASE_URL=https://<be-domain>/api/v1`.
3. Deploy → note `https://<project>.vercel.app`.
4. Set backend `CORS_ORIGIN` to the Vercel URL and redeploy the backend.

## SPA fallback

Automatic. Optionally explicit via `vercel.json`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

## Preview deploys

Every PR gets a preview URL. Point previews at a **staging API** whose `CORS_ORIGIN`
allows preview origins (production origins won't match the random preview URLs).

## Custom domain

Add `app.example.com` → set DNS (CNAME) → automatic TLS. Update backend `CORS_ORIGIN` to
the custom domain.

## Env change workflow

Change `VITE_API_BASE_URL` → **Redeploy** (Vite inlines at build).

## Pros / Cons

| Pros                          | Cons                                       |
| ----------------------------- | ------------------------------------------ |
| Zero-config Vite, instant CDN | Build-time env (rebuild to change API URL) |
| Free PR previews              | Backend hosted elsewhere                   |
| Automatic TLS + domains       | Hobby fair-use limits                      |

## Cost

- Hobby: **$0**. Pro ~$20/mo for teams/commercial.
