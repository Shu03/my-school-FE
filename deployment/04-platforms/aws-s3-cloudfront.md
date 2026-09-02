# AWS S3 + CloudFront (Frontend)

> **Model:** Static files in an S3 bucket, served globally via CloudFront CDN with TLS.
> **Cost:** pennies at low traffic (pay-per-use). **Cold start:** none.
> **Simpler alternative:** AWS Amplify Hosting (Git-connected, handles build + SPA
> rewrites automatically).

## Prerequisites

- AWS CLI configured (`aws configure`).
- Backend deployed over HTTPS; `VITE_API_BASE_URL` known.

## 1. Build

```bash
VITE_API_BASE_URL=https://<be-domain>/api/v1 pnpm build
```

## 2. Upload to S3

```bash
aws s3 mb s3://my-school-fe
aws s3 sync dist/ s3://my-school-fe --delete
```

## 3. CloudFront distribution

- Origin: the S3 bucket (use **Origin Access Control**, keep the bucket private).
- Default root object: `index.html`.
- **SPA fallback:** add custom error responses:
    - 403 → response page `/index.html`, HTTP 200
    - 404 → response page `/index.html`, HTTP 200
- Attach an ACM certificate for your custom domain (in `us-east-1`).

## 4. Cache invalidation on each deploy

```bash
aws s3 sync dist/ s3://my-school-fe --delete
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

## Env change workflow

`VITE_API_BASE_URL` is baked at `pnpm build` → rebuild + re-sync + invalidate.

## Custom domain

Route 53 (or any DNS) A/ALIAS → CloudFront. ACM cert in `us-east-1`. Update backend
`CORS_ORIGIN`.

## Pros / Cons

| Pros                              | Cons                                   |
| --------------------------------- | -------------------------------------- |
| Cheap, infinitely scalable, fast  | Most manual of the FE options          |
| Full control over caching/headers | Must wire SPA fallback + invalidations |
| Fits AWS orgs                     | Consider Amplify for simplicity        |

## Cost

- Low-traffic demo: typically **cents/month** (S3 storage + CloudFront requests).

## Simpler: AWS Amplify Hosting

Connect the repo in the Amplify console; it detects Vite, runs `pnpm build`, publishes
`dist/`, and adds SPA rewrites automatically. Set `VITE_API_BASE_URL` in Amplify env.
Recommended over raw S3+CloudFront unless you need fine-grained control.
