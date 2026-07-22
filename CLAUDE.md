# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a portfolio application with two main components:

- **`todo/`** - Next.js 16 frontend (React 19, TypeScript, Tailwind CSS 4, shadcn/ui)
- **`api/`** - ASP.NET Core 10 backend with Entity Framework Core and SQLite

## Commands

### Frontend (todo/)

```sh
cd todo
pnpm install          # install dependencies
pnpm dev              # start dev server at http://localhost:3000
pnpm build            # production build
pnpm lint             # run ESLint
pnpm typecheck        # run TypeScript type checking
pnpm test             # run Vitest tests
pnpm test <file>      # run single test file
```

### Backend (api/)

```sh
cd api/api
dotnet run                        # start API at http://localhost:5189
dotnet build                      # build project
dotnet test                       # run tests (if test project exists)
dotnet ef migrations add <Name>   # create EF migration
dotnet ef database update         # apply migrations
```

## Architecture

### API Proxy Pattern

The Next.js frontend proxies API requests to the ASP.NET backend. Browser requests go to `/api/backend/...` and `/api/auth/...` routes in Next.js, which forward them to the ASP.NET API using `src/lib/api-proxy.ts`. This allows the UI and API to share the same origin for cookies while being deployed separately.

### Authentication Flow

1. Google OAuth is handled by the ASP.NET API with callback at `/api/auth/callback`
2. The frontend proxies auth requests through Next.js route handlers
3. Only a configured admin email (`Auth:AdminEmail`) can authenticate
4. Cookie-based session with 14-day sliding expiration

### Frontend Organization

- `src/app/` - Next.js App Router pages (admin, goals, resume)
- `src/features/` - Feature modules (admin, auth, dashboard, goals, resume, todos)
- `src/components/` - Shared UI components (shadcn/ui based)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities and API proxy logic

### Backend Organization

- `Controllers/` - API endpoints (AuthController, TodosController, GoalsController)
- `Services/` - Business logic layer
- `Repositories/` - Data access layer
- `Models/` - Entity models
- `DTOs/` - Data transfer objects
- `Data/` - EF Core DbContext

## Local Development Setup

### Frontend Environment

Create `todo/.env.local`:
```sh
NEXT_PUBLIC_API_URL=http://localhost:5189/api
```

### Backend Secrets

```sh
dotnet user-secrets set "Auth:Google:ClientId" "<client-id>" --project api/api/api.csproj
dotnet user-secrets set "Auth:Google:ClientSecret" "<client-secret>" --project api/api/api.csproj
dotnet user-secrets set "Auth:AdminEmail" "<email>" --project api/api/api.csproj
```

Google OAuth redirect URI for local development: `http://localhost:3000/api/auth/callback`
