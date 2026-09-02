# 06 · Post-Deploy Checklist & Troubleshooting

## Post-deploy checklist

### Loads & routing

- [ ] FE loads over **HTTPS**.
- [ ] Hard refresh on a deep route (e.g. `/students/123`) works → SPA fallback OK.
- [ ] Static assets (JS/CSS) load without 404s.

### API wiring

- [ ] Network tab shows requests to the **production** API (`https://<be>/api/v1`).
- [ ] `VITE_API_BASE_URL` includes `/api/v1` and has no trailing slash.
- [ ] Login works from the deployed FE.
- [ ] An authenticated read (e.g. list students) returns data.

### CORS

- [ ] No CORS errors in the console.
- [ ] Backend `CORS_ORIGIN` equals this FE's origin (exact, no trailing slash).

### Config hygiene

- [ ] No secrets in the bundle (only public `VITE_*` values).
- [ ] After any API URL change, the FE was **redeployed** (build-time env).

### Domain

- [ ] Custom domain mapped + TLS valid (if used).
- [ ] Backend `CORS_ORIGIN` and this `VITE_API_BASE_URL` updated to custom domains.

---

## Troubleshooting

### Blank page after deploy

| Cause              | Fix                                                                |
| ------------------ | ------------------------------------------------------------------ |
| Wrong output dir   | Publish `dist`.                                                    |
| Base path mismatch | Default Vite `base` is `/`; only change if hosted under a subpath. |
| JS 404s            | Re-check build output and host publish directory.                  |

### 404 on refresh / deep link

| Cause           | Fix                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| No SPA fallback | Add `_redirects` / `vercel.json` / `staticwebapp.config.json` / CloudFront error routing (see [Chapter 01](01-prerequisites.md)). |

### API calls fail / go to localhost

| Cause                                  | Fix                                             |
| -------------------------------------- | ----------------------------------------------- |
| `VITE_API_BASE_URL` unset at build     | Set it in the host env and **redeploy**.        |
| Changed the value but nothing happened | Vite inlines at build → redeploy.               |
| Missing `/api/v1`                      | The backend serves under `/api/v1`; include it. |

### CORS errors

| Cause                               | Fix                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| Backend `CORS_ORIGIN` wrong/missing | Set to this FE origin; redeploy backend (see `my-school-BE/deployment/13-troubleshooting.md`). |
| Trailing slash mismatch             | Remove it.                                                                                     |

### Mixed content blocked

| Cause                    | Fix                                                                   |
| ------------------------ | --------------------------------------------------------------------- |
| Backend served over HTTP | Serve the API over HTTPS; browsers block HTTP calls from HTTPS pages. |

### Slow first request

| Cause                             | Fix                                                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Backend cold start (free BE host) | This is a **backend** concern — use an always-on BE (Fly.io) or a keep-alive ping. See `my-school-BE/deployment/06-free-tier.md`. |

---

## Debugging workflow

1. Open DevTools → **Network**: are calls going to the right host over HTTPS?
2. **Console**: CORS vs 4xx/5xx vs mixed-content tells you which side to fix.
3. If the request reaches the API and returns an error, debug on the **backend**
   (`my-school-BE/deployment/13-troubleshooting.md`).
4. If routing breaks only on refresh, it's the **SPA fallback**.

Back to [README](README.md).
