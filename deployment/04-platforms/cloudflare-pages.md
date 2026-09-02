# Cloudflare Pages (Frontend)

> **Model:** Static hosting on Cloudflare's global edge. **Cost:** very generous free
> tier. **Cold start:** none. **Best free-tier choice for an always-on demo.**

## Build settings

| Setting          | Value                                 |
| ---------------- | ------------------------------------- |
| Build command    | `pnpm build`                          |
| Output directory | `dist`                                |
| Package manager  | pnpm (detected from `pnpm-lock.yaml`) |

## Deploy

1. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** → `my-school-FE`.
2. Env var: `VITE_API_BASE_URL=https://<be-domain>/api/v1`.
3. Deploy → note `https://<project>.pages.dev`.
4. Set backend `CORS_ORIGIN` to the Pages URL and redeploy the backend.

## SPA fallback (required)

Add `public/_redirects` (Vite copies it into `dist/`):

```
/*    /index.html   200
```

## Env change workflow

Change `VITE_API_BASE_URL` → **Retry deployment** (rebuild).

## Custom domain

Add a custom domain in the Pages project → Cloudflare manages DNS + TLS (trivial if the
domain is already on Cloudflare). Update backend `CORS_ORIGIN`.

## Pros / Cons

| Pros                        | Cons                       |
| --------------------------- | -------------------------- |
| Huge free tier, global edge | Needs `_redirects` for SPA |
| Unlimited requests          | Build-time env             |
| Tight DNS/TLS integration   | Backend hosted elsewhere   |

## Cost

- Free tier: **$0**, hard to outgrow for a demo.
