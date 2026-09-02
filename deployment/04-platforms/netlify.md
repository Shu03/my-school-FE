# Netlify (Frontend)

> **Model:** Git-connected static hosting + edge CDN. **Cost:** Starter free.
> **Cold start:** none.

## Build settings

| Setting           | Value        |
| ----------------- | ------------ |
| Build command     | `pnpm build` |
| Publish directory | `dist`       |

## Deploy

1. Netlify → **Add new site → Import from Git** → `my-school-FE`.
2. Env var: `VITE_API_BASE_URL=https://<be-domain>/api/v1`.
3. Deploy → note `https://<site>.netlify.app`.
4. Set backend `CORS_ORIGIN` to the Netlify URL and redeploy the backend.

## SPA fallback (required)

`public/_redirects`:

```
/*    /index.html   200
```

or `netlify.toml` (repo root):

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Env change workflow

Change `VITE_API_BASE_URL` → **Trigger deploy** (rebuild).

## Custom domain

Add domain in Netlify → update DNS → automatic Let's Encrypt TLS. Update backend
`CORS_ORIGIN`.

## Pros / Cons

| Pros                       | Cons                        |
| -------------------------- | --------------------------- |
| Simple, generous free tier | Needs explicit SPA redirect |
| Deploy previews per PR     | Build-time env              |
| `netlify.toml` IaC         | Backend elsewhere           |

## Cost

- Starter: **$0** for a demo (fair-use bandwidth/minutes).
