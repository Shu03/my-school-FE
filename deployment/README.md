# Deployment Guide — my-school (Frontend)

> Self-contained deployment handbook for the `my-school` **frontend** (React 19 + Vite
> 8 SPA). Separate from `docs/`, with its own format. The **backend/database/migrations**
> source of truth is `my-school-BE/deployment/`; this guide focuses on shipping the SPA
> and connecting it to the API.

## What the frontend is

| Property        | Value                                                         |
| --------------- | ------------------------------------------------------------- |
| Framework       | React 19 + Vite 8                                             |
| Router          | `react-router-dom` (client-side routing → needs SPA fallback) |
| State/data      | Zustand + TanStack Query                                      |
| Styling         | Tailwind CSS 4                                                |
| Build command   | `pnpm build` (`tsc -b && vite build`)                         |
| Build output    | `dist/` (static files)                                        |
| Runtime         | **None** — static files on a CDN/host                         |
| API config      | `VITE_API_BASE_URL` (build-time)                              |
| Package manager | **pnpm** (`pnpm-lock.yaml`)                                   |

The FE is a **static bundle**. There is no server to run — a CDN serves `index.html` +
hashed JS/CSS. It talks to the backend from the user's browser.

---

## Chapters

| #                                     | Chapter                        | Read when                  |
| ------------------------------------- | ------------------------------ | -------------------------- |
| [01](01-prerequisites.md)             | Prerequisites & SPA fallback   | Before any deploy          |
| [02](02-environment-variables.md)     | Env vars (build-time)          | Every environment          |
| [03](03-free-tier.md)                 | Free-tier deploy (recommended) | Demo/MVP                   |
| [04](04-platforms/)                   | Every FE host, step-by-step    | Choosing a host            |
| [05](05-cicd.md)                      | CI/CD                          | Automating deploys         |
| [06](06-checklist-troubleshooting.md) | Checklist + troubleshooting    | After deploy / when broken |

---

## Callout legend

> **Note:** context. **Warning:** skipping breaks the deploy. **Cost:** money. **Time:** effort.

---

## The two things unique to a Vite SPA

1. **Env is build-time.** `VITE_API_BASE_URL` is inlined into the bundle at build.
   Changing it requires a **rebuild/redeploy**, not a restart. Set it in the host's
   build environment.
2. **SPA fallback is required.** Client-side routes (React Router) must fall back to
   `index.html`, or refreshing a deep link returns 404. Each host configures this
   differently — see [Chapter 01](01-prerequisites.md).

---

## 60-second path

1. Deploy the **backend** first (see `my-school-BE/deployment/`), get its HTTPS URL.
2. Set `VITE_API_BASE_URL=https://<be>/api/v1` in your FE host.
3. Deploy the FE (Vercel / Cloudflare Pages / Netlify).
4. Set the backend's `CORS_ORIGIN` to the FE URL and redeploy the backend.

> **Warning:** Steps 2 and 4 are a pair. If either URL is wrong or has a trailing slash,
> the FE cannot call the API.
