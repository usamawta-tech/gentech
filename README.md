# GenTech Marketplace

A production-grade, mobile-first marketplace platform. Generic by design — the first
vertical is **mobile phones (Pakistan)**.

**Stack:** Next.js 16 (App Router, React 19) · TypeScript (strict) · Tailwind v4 ·
shadcn/ui (Base UI) · Framer Motion · Prisma 7 + Neon PostgreSQL · Better Auth ·
Cloudinary · Google Maps · FCM (later phases).

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the layering and conventions.

---

## Prerequisites

- **Node.js** ≥ 20.11 (24.x recommended)
- **pnpm** ≥ 10 — `npm install -g pnpm`
- A **Neon** PostgreSQL database (free tier is fine)

## 1. Install

```bash
pnpm install
```

## 2. Configure environment

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Minimum required to run auth locally:

| Variable             | Where to get it                                             |
| -------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`       | Neon dashboard → Connection Details → **Pooled** connection |
| `DIRECT_URL`         | Neon dashboard → **Direct** connection (used by migrations) |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32`                                   |

Optional (features degrade gracefully until set):

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google sign-in
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` — Facebook sign-in
- `RESEND_API_KEY` / `EMAIL_FROM` — real verification & reset emails
  (without these, email links are printed to the server console)

OAuth redirect URIs (add in each provider's console):

- Google: `http://localhost:3000/api/auth/callback/google`
- Facebook: `http://localhost:3000/api/auth/callback/facebook`

## 3. Create the database schema

```bash
pnpm db:migrate      # creates tables in Neon + generates the client
```

## 4. Run

```bash
pnpm dev             # http://localhost:3000
```

---

## Scripts

| Script            | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `pnpm dev`        | Start the dev server (Turbopack)               |
| `pnpm build`      | Production build                               |
| `pnpm start`      | Run the production build                       |
| `pnpm typecheck`  | `tsc --noEmit`                                 |
| `pnpm lint`       | ESLint                                         |
| `pnpm format`     | Prettier write                                 |
| `pnpm db:migrate` | Create/apply a dev migration + generate client |
| `pnpm db:push`    | Push schema without a migration (prototyping)  |
| `pnpm db:studio`  | Open Prisma Studio                             |
| `pnpm db:seed`    | Run the seed script                            |

> Tip: to run a build without a populated `.env` (CI), prefix with
> `SKIP_ENV_VALIDATION=1`.

## Promoting a user to admin

Roles are not self-assignable. After signing up, promote yourself via Prisma Studio
(`pnpm db:studio` → `user` → set `role` = `ADMIN`) or SQL:

```sql
UPDATE "user" SET role = 'ADMIN' WHERE email = 'you@example.com';
```
