# 05 · CI/CD (Frontend)

The frontend is static, so CI/CD is mostly "build and publish". Start with the host's
Git integration; add GitHub Actions only when you need a custom build or a non-Git host.

---

## Level 0 — Host Git integration (recommended)

Vercel, Netlify, Cloudflare Pages, and Azure Static Web Apps deploy automatically:

| Event          | Result                     |
| -------------- | -------------------------- |
| Push to `main` | Production deploy          |
| Open PR        | Preview/deploy-preview URL |

No YAML needed. Set `VITE_API_BASE_URL` in the host's env. This is the simplest and
recommended path for the demo.

---

## Level 1 — GitHub Actions CI (lint + build gate)

`.github/workflows/fe-ci.yml`:

```yaml
name: FE CI
on:
    pull_request:
    push:
        branches: [main]

jobs:
    build:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: pnpm/action-setup@v4
              with:
                  version: 9
            - uses: actions/setup-node@v4
              with:
                  node-version: 22
                  cache: pnpm
            - run: pnpm install --frozen-lockfile
            - run: pnpm lint
            - run: pnpm build
              env:
                  VITE_API_BASE_URL: ${{ vars.VITE_API_BASE_URL }}
```

> **Note:** Use an Actions **variable** (`vars.*`) for `VITE_API_BASE_URL` — it's public
> config, not a secret.

---

## Level 2 — GitHub Actions deploy (non-Git hosts)

Only needed for S3+CloudFront or when you don't use the host's Git integration.

### S3 + CloudFront

```yaml
deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v4
          with: { version: 9 }
        - uses: actions/setup-node@v4
          with: { node-version: 22, cache: pnpm }
        - run: pnpm install --frozen-lockfile
        - run: pnpm build
          env:
              VITE_API_BASE_URL: ${{ vars.VITE_API_BASE_URL }}
        - uses: aws-actions/configure-aws-credentials@v4
          with:
              aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
              aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
              aws-region: us-east-1
        - run: aws s3 sync dist/ s3://my-school-fe --delete
        - run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} --paths "/*"
```

### Cloudflare Pages (direct upload via Wrangler)

```yaml
- run: pnpm build
  env:
      VITE_API_BASE_URL: ${{ vars.VITE_API_BASE_URL }}
- uses: cloudflare/wrangler-action@v3
  with:
      apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      command: pages deploy dist --project-name=my-school-fe
```

---

## Environments per branch

Point different branches at different APIs by setting `VITE_API_BASE_URL` per Actions
environment or per host environment (Production vs Preview):

| Branch     | API                                                      |
| ---------- | -------------------------------------------------------- |
| `main`     | Production API                                           |
| PR/preview | Staging API (whose `CORS_ORIGIN` allows preview origins) |

---

## Required secrets/variables summary

| Name                                             | Type     | Used by                 |
| ------------------------------------------------ | -------- | ----------------------- |
| `VITE_API_BASE_URL`                              | variable | Build                   |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`    | secret   | S3 deploy               |
| `CF_DISTRIBUTION_ID`                             | secret   | CloudFront invalidation |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | secret   | Wrangler deploy         |

Continue to [Chapter 06 · Checklist & Troubleshooting](06-checklist-troubleshooting.md).
