# 01 · Prerequisites & SPA Fallback

> **Warning:** The SPA fallback (A1) is **required** for any host that doesn't add it
> automatically. Without it, refreshing or deep-linking a client route returns 404.
> These files are documented here for a later implementation pass.

---

## A1. SPA fallback configuration

The app uses `react-router-dom` for client-side routing. The host must rewrite unknown
paths to `index.html` (HTTP 200) so the router can handle them.

Add the file that matches your host:

### Netlify / Cloudflare Pages — `public/_redirects`

```
/*    /index.html   200
```

> Placing it in `public/` makes Vite copy it into `dist/` on build.

### Vercel — `vercel.json` (repo root)

```json
{
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

> Vercel already handles SPA fallback for Vite; this makes it explicit.

### Netlify (alternative) — `netlify.toml` (repo root)

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Azure Static Web Apps — `staticwebapp.config.json` (repo root)

```json
{
    "navigationFallback": {
        "rewrite": "/index.html",
        "exclude": ["/assets/*"]
    }
}
```

### nginx / Caddy (VPS) — see `my-school-BE/deployment/07-platforms/vps-docker-compose.md`

```
try_files $uri /index.html;     # nginx
try_files {path} /index.html    # Caddy
```

### AWS S3 + CloudFront

Add a CloudFront custom error response: **403 and 404 → `/index.html` (200)**.

---

## A2. Confirm build settings

| Setting          | Value                                      |
| ---------------- | ------------------------------------------ |
| Install          | `pnpm install --frozen-lockfile`           |
| Build            | `pnpm build`                               |
| Output directory | `dist`                                     |
| Node version     | 22 (match BE runtime)                      |
| Package manager  | pnpm (host should detect `pnpm-lock.yaml`) |

Local verification before deploying:

```bash
# from my-school-FE
pnpm install --frozen-lockfile
VITE_API_BASE_URL=https://<be-domain>/api/v1 pnpm build
pnpm preview      # serves dist/ locally at http://localhost:4173
```

---

## A3. Backend must be reachable

Before the FE is useful:

- The backend is deployed over **HTTPS** (browsers block HTTP calls from HTTPS pages).
- The backend `CORS_ORIGIN` will be set to this FE's URL (see
  `my-school-BE/deployment/01-prerequisites.md`).

---

## Accounts & tooling checklist

| Requirement                                    | Why                        | Free?   |
| ---------------------------------------------- | -------------------------- | ------- |
| GitHub repo pushed                             | Source for host + CI       | Yes     |
| An FE host account (Vercel/Netlify/Cloudflare) | Serve the SPA              | Yes     |
| Deployed backend URL                           | `VITE_API_BASE_URL` target | —       |
| pnpm + Node 22 locally                         | Build/verify               | Yes     |
| Custom domain (optional)                       | Nice URL + stable CORS     | ~$10/yr |

> **Time:** ~15–20 min for the first FE deploy once the backend URL is known.

Continue to [Chapter 02 · Environment Variables](02-environment-variables.md).
