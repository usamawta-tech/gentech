# GenTech — Architecture

A production-grade, mobile-first marketplace. Generic by design; the first vertical is
**mobile phones (Pakistan)**. Built with Next.js 16 (App Router, React 19), TypeScript,
Tailwind v4, shadcn/ui, Prisma + Neon Postgres, and Better Auth.

## The dependency rule

Code dependencies point **inward only**. Outer layers may import inner layers; never the
reverse.

```
┌─────────────────────────────────────────────┐
│  app/          App Router · Route Handlers    │  edge — thin, framework-coupled
│  components/   shared UI primitives            │  presentation
│  features/*    vertical slices (UI + actions)  │  presentation + orchestration
├─────────────────────────────────────────────┤
│  services/     business logic (pure TS)        │  domain
│  repositories/ data access (Prisma ONLY here)  │  data boundary
├─────────────────────────────────────────────┤
│  lib/          db, auth, env, cross-cutting    │  infrastructure
└─────────────────────────────────────────────┘
```

**Hard rule:** `@/lib/prisma` is imported **only** inside `repositories/`. Services depend
on repository interfaces, not Prisma. This keeps Redis/Elasticsearch swaps painless and
makes the domain layer unit-testable without a database.

## Folder map

| Path          | Responsibility                                                        |
| ------------- | --------------------------------------------------------------------- |
| `app/`        | Routes, layouts, Route Handlers (`app/api/v1/...`). Thin glue only.   |
| `components/` | Reusable, presentation-only UI. `ui/` = shadcn primitives.            |
| `features/`   | Vertical slices. Each owns `components/ actions/ services/ schemas/`. |
| `services/`   | Cross-feature domain services (notifications, geo, search).           |
| `lib/`        | Infra singletons + cross-cutting (`env`, `prisma`, `auth`, `utils`).  |
| `hooks/`      | Reusable React hooks.                                                 |
| `types/`      | Global shared types.                                                  |
| `utils/`      | Pure, dependency-free helpers.                                        |
| `prisma/`     | `schema.prisma`, migrations, `seed.ts`.                               |

## A feature slice (e.g. `features/auth`)

```
features/auth/
  components/   # feature UI (SignInForm, SignUpForm, ...)
  actions/      # "use server" actions — validate + call services
  services/     # business logic, framework-agnostic
  schemas/      # Zod schemas (shared by client + server)
```

## Request lifecycle (example: create listing)

`Route Handler / Server Action` → validate input (Zod) → assert auth/role →
`ListingService.create()` (business rules) → `ListingRepository.create()` (Prisma) →
revalidate cache tags → return a typed DTO (never a raw Prisma entity).

## Conventions

- **Validation everywhere** with Zod; schemas are shared between client and server.
- **Money is `Decimal`**, never `Float`. Geo uses PostGIS.
- **Soft deletes + audit fields** (`createdAt`, `updatedAt`, `deletedAt`) on core tables.
- **Cursor pagination**, never `OFFSET`, on feeds and search.
- Public env via `NEXT_PUBLIC_*`; everything validated in `lib/env.ts`.
