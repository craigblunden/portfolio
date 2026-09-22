# craigblunden.dev

A live resume and engineering journal, built as a Next.js front end over an
ASP.NET Core API. The public site is a portfolio; the authenticated half is a
small admin app I use to keep the goals and work log on it current.

**Live:** [craigblunden.dev](https://craigblunden.dev)

| | |
|---|---|
| **Front end** | Next.js 16 (App Router, RSC), React 19, TypeScript, Tailwind 4, shadcn/ui |
| **API** | ASP.NET Core 10, EF Core, SQLite |
| **Auth** | Google OAuth, cookie session, single-admin allowlist |
| **CI/CD** | GitHub Actions → Azure App Service, OIDC federated credentials |
| **Tests** | Vitest (front end), xUnit (API, incl. in-memory SQLite integration tests) |

## Architecture

The UI and API deploy independently but share one origin in the browser. Next.js
route handlers proxy `/api/backend/*` and `/api/auth/*` through to ASP.NET Core:

```
browser ──▶ Next.js (craigblunden.dev)
              │  RSC pages render server-side, calling the API directly
              │
              └─▶ /api/backend/*  ──proxy──▶  ASP.NET Core ──▶ EF Core ──▶ SQLite
                  /api/auth/*                  (Azure App Service)
```

**Why proxy instead of calling the API from the browser?** A cookie session needs
the cookie to be first-party. Proxying keeps every browser-visible request on
`craigblunden.dev`, so the session cookie stays `SameSite` and same-origin, the
API's hostname is never exposed to client code, and there is no CORS preflight on
the hot path. The trade-off is one extra hop on writes — acceptable, since reads
are served by React Server Components that call the API directly and never go
through the proxy at all.

**Content vs. data.** Blog posts are markdown committed to `todo/content/blog/`
and rendered at build time; goals and the work log live in SQLite and are edited
through the admin UI. Posts can reference a goal by slug, which is why slugs are
treated as a stable public contract and generated deterministically.

## Security notes

The admin surface is a single-user allowlist, and the decisions worth calling out:

- **Every request re-checks the claim.** `OnValidatePrincipal` compares the
  cookie's email against the configured admin on each request rather than
  trusting the cookie's existence, so revoking access does not wait 14 days for
  expiry.
- **Config is fail-fast.** Missing OAuth settings throw at startup with an
  actionable message, instead of surfacing as an opaque error on the first
  sign-in attempt.
- **No raw HTML from markdown.** The remark/rehype pipeline runs without
  `allowDangerousHtml`, so post content cannot inject markup. JSON-LD is escaped
  so no field can close the `<script>` tag early.
- **Paging is bounded.** Anonymous list endpoints clamp `offset`/`limit`, so a
  hand-edited query string cannot trigger an unbounded read.
- **Return URLs are reduced to a path**, rejecting protocol-relative and
  backslash forms that would otherwise resolve to another origin.
- Security headers (CSP, HSTS, `frame-ancestors`, Referrer-Policy) are set in
  `todo/next.config.ts`.

No secrets are committed. Local development uses .NET user secrets and
`.env.local`; production reads Azure App Settings, and deploys authenticate to
Azure with OIDC rather than a stored publish profile.

## Local setup

Requires .NET 10, Node 24, and pnpm (via corepack).

```sh
# API — http://localhost:5189
dotnet user-secrets init --project api/api/api.csproj
dotnet user-secrets set "Auth:Google:ClientId"     "<client-id>"     --project api/api/api.csproj
dotnet user-secrets set "Auth:Google:ClientSecret" "<client-secret>" --project api/api/api.csproj
dotnet user-secrets set "Auth:AdminEmail"          "<your-email>"    --project api/api/api.csproj
cd api/api && dotnet run

# Front end — http://localhost:3000
cd todo && corepack enable && pnpm install && pnpm dev
```

Create `todo/.env.local` (see `todo/.env.dist`):

```sh
NEXT_PUBLIC_API_URL=http://localhost:5189/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# API_URL — optional; set only when the Next.js server should reach the API on a
# different internal address than browser-facing code uses.
```

Google OAuth credentials come from Google Cloud Console → APIs & Services →
Credentials, as a **Web application** client. Add the local redirect URI:

```text
http://localhost:3000/api/auth/callback
```

Redirect URIs use the **UI** host, not the API host — the browser signs in
through the UI origin and Next.js proxies the callback onward.

### Commands

```sh
cd todo   && pnpm dev | pnpm build | pnpm lint | pnpm typecheck | pnpm test
cd api    && dotnet build | dotnet test
cd api/api && dotnet ef migrations add <Name> | dotnet ef database update
```

## Deployment

Two GitHub Actions workflows, each triggered by changes under its own path, both
deploying to Azure App Service via OIDC.

| | UI | API |
|---|---|---|
| Path filter | `todo/**` | `api/**` |
| Build | `pnpm build` → standalone output | `dotnet publish` |
| Runtime config | `NEXT_PUBLIC_API_URL` at build time | App Settings: `Auth__Google__ClientId`, `Auth__Google__ClientSecret`, `Auth__AdminEmail` |

Migrations apply on startup, so a deploy that changes the schema needs no
separate step. DNS is on Cloudflare.
