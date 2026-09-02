# Azure Static Web Apps (Frontend)

> **Model:** Azure's Git-connected static host with a free tier and built-in SPA
> routing. **Cost:** Free tier for demos. **Cold start:** none.

## Deploy (CLI)

```bash
az staticwebapp create -g my-school -n my-school-fe \
  --source https://github.com/<you>/my-school-FE --branch main \
  --app-location "/" --output-location "dist" --login-with-github
```

This wires a GitHub Actions workflow that runs `pnpm build` and publishes `dist/`.

## Build settings

| Setting           | Value                                     |
| ----------------- | ----------------------------------------- |
| `app_location`    | `/`                                       |
| `output_location` | `dist`                                    |
| Build             | `pnpm build` (via the generated workflow) |

## Env var

Set `VITE_API_BASE_URL` in the generated workflow (build env) or in the SWA build
configuration. Remember it is build-time.

## SPA fallback (required)

`staticwebapp.config.json` (repo root):

```json
{
    "navigationFallback": {
        "rewrite": "/index.html",
        "exclude": ["/assets/*"]
    }
}
```

## Custom domain

Add in the SWA resource → validate DNS → automatic managed TLS. Update backend
`CORS_ORIGIN`.

## Pros / Cons

| Pros                               | Cons                                |
| ---------------------------------- | ----------------------------------- |
| Free tier, built-in SPA routing    | Azure-specific config               |
| GitHub Actions wired automatically | Env is build-time                   |
| Optional managed API integration   | Backend (ACA) configured separately |

## Cost

- Free tier: **$0** for a demo. Standard tier ~low $/mo for SLA/more features.
