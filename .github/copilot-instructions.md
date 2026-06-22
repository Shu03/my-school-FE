# my-school-FE — Architecture & Conventions

> Authoritative guide for this repo. Follow these conventions for all new code and refactors.
> Stack: React + TypeScript + Vite, pnpm, Zustand (persist), React Router v6, React Hook Form + Zod,
> TanStack Query, shadcn/ui (radix-nova), React Compiler.

## Commands

- Build: `pnpm build` (`tsc -b && vite build`)
- Lint: `pnpm lint` (`eslint .`), autofix with `pnpm lint --fix`
- A green PR = build passes + lint passes. The only tolerated warning is the React Compiler
  `watch()` "incompatible library" warning in `ChangePasswordPage.tsx`.

## Folder structure (`src/`)

- `app/` — application bootstrap: `App.tsx`, `providers/` (e.g. `QueryProvider.tsx`),
  `router/` (`index.tsx`, `guards.tsx`, `lazy.tsx`, `NotFoundPage.tsx`), `styles/index.css`
- `constants/` — single global home for all constants, one file per domain
- `components/common/` — shared app components that are NOT shadcn primitives
- `components/ui/` — shadcn primitives. Do not hand-edit; eslint-ignored; uses the `@/` alias
- `config/` — runtime config (`env.ts`)
- `features/<feature>/` — feature-first modules, nested by concern:
  `api/` `components/` `hooks/` `pages/` `schemas/` `store/` `types/` and a public `index.ts` barrel
- `layouts/` — shared authenticated shell (`DashboardLayout`, `Sidebar`, `TopBar`)
- `lib/` — framework-agnostic utilities; `lib/api/` holds the HTTP client + token storage
- `types/` — cross-cutting shared types only (`api.ts`: `Role`, `ApiEnvelope`, `PaginatedResponse`)

There are intentionally no global `src/hooks/` or `src/stores/` folders yet — add them only when a
hook/store is genuinely shared across features. Feature-local hooks/stores live under the feature.

## Naming: dotted role suffixes

| Role           | Pattern           | Example                 |
| -------------- | ----------------- | ----------------------- |
| Component/page | `PascalCase.tsx`  | `LoginPage.tsx`         |
| Store          | `*.store.ts`      | `auth.store.ts`         |
| Schema         | `*.schema.ts`     | `login.schema.ts`       |
| API module     | `*.api.ts`        | `auth.api.ts`           |
| Types          | `*.types.ts`      | `auth.types.ts`         |
| Hook           | `useXxx.ts`       | `useAuthInitializer.ts` |
| Constants      | `*.constants.ts`  | `routes.constants.ts`   |
| Folders        | lowercase / kebab | —                       |

## Path aliases

Granular aliases (configured in `tsconfig.app.json`, `tsconfig.json`, `vite.config.ts`, and
`eslint.config.js` import/order pathGroups):

```
@app/*        → src/app/*
@features/*   → src/features/*
@components/* → src/components/*
@layouts      → src/layouts (barrel)   @layouts/* → src/layouts/*
@lib/*        → src/lib/*
@constants/*  → src/constants/*
@config/*     → src/config/*
@/*           → src/*   (reserved for shadcn: @/components/ui, @/lib/utils)
```

- **Do NOT create a `@types/*` alias.** TypeScript reserves the `@types/` prefix for DefinitelyTyped
  and will error `TS6137`. Import shared types via `@/types/...` (e.g. `@/types/api`).
- `eslint` `no-restricted-imports` blocks deep `@/app|@/features|@/layouts|@/constants|@/config`
  imports — use the dedicated alias instead. `@/components/ui`, `@/lib/utils`, and `@/types/*` stay
  on `@/`.

## Module boundaries & barrels

- A feature's public surface is its `index.ts` barrel. Outsiders import from `@features/<feature>`,
  never from deep internal paths.
- Barrels expose store / hooks / types ONLY — **never pages**. A static page export in a barrel would
  break router code-splitting.
- The router lazy-loads pages via deep dynamic `import("@features/<f>/pages/<Page>")`
  (see `app/router/lazy.tsx`) precisely to preserve code-splitting.
- Within a feature, prefer relative imports (`../store/auth.store`) over aliases.

## Constants

All magic values (routes, endpoints, storage keys, status codes, policy rules, branding, query
config) live in `src/constants/*.constants.ts`. Never inline these:

- `routes.constants.ts` → `ROUTES`
- `apiEndpoints.constants.ts` → `API_ENDPOINTS` (auth + users; `byId`/`activate`/`deactivate` builders)
- `storageKeys.constants.ts` → `STORAGE_KEYS` (access/refresh token, `auth-storage`)
- `httpStatus.constants.ts` → `HTTP_STATUS`
- `auth.constants.ts` → `PASSWORD_POLICY`, `MOBILE_NUMBER_PATTERN`, `AUTH_EVENTS`, `TOKEN_REFRESH_LEAD_MS`
- `query.constants.ts` → `QUERY_CONFIG`
- `app.constants.ts` → `APP_BRAND`

## HTTP layer

- `lib/api/client.ts` — default-exported `apiFetch` (envelope unwrap, 401 refresh queue) + `ApiError`.
- `lib/api/tokenStorage.ts` — `get/set/clearTokens` using `STORAGE_KEYS`.
- Feature API modules (`features/<f>/api/*.api.ts`) import `apiFetch` from `@lib/api/client` and
  reference `API_ENDPOINTS`.

## Code rules

- `verbatimModuleSyntax` is on → use `import type` for type-only imports.
- `@typescript-eslint/no-explicit-any` is an error — never use `any`. For union form types, narrow
  with `"field" in obj` type guards.
- React hooks must be called unconditionally; do post-hook redirects inside `useEffect`.
- Prevent route rendering during auth bootstrap (`isAuthInitializing`) to avoid flicker.
- Use `git mv` when relocating tracked files to preserve history.
- Do not create markdown docs to describe changes unless explicitly requested.
