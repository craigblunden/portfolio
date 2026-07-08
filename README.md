# portfolio

## Local setup

### Portfolio UI

Create `todo/.env.local`:

```sh
NEXT_PUBLIC_API_URL=http://localhost:5189/api
# Optional when it is the same as NEXT_PUBLIC_API_URL:
API_URL=http://localhost:5189/api
```

- `NEXT_PUBLIC_API_URL` is the public API base URL used by existing dashboard data fetches. Next.js server route handlers also fall back to this value.
- `API_URL` is server-only and optional when it is the same as `NEXT_PUBLIC_API_URL`. Set it when the UI server should call a different internal/private API URL than the one exposed to browser code.
- If the API runs on a different local port, update these values.

### API

Configure Google OAuth for local development with user secrets or environment variables:

```sh
dotnet user-secrets init --project api/api/api.csproj
dotnet user-secrets set "Auth:Google:ClientId" "<your-google-client-id>" --project api/api/api.csproj
dotnet user-secrets set "Auth:Google:ClientSecret" "<your-google-client-secret>" --project api/api/api.csproj
dotnet user-secrets set "Auth:AdminEmail" "<your-email>" --project api/api/api.csproj
```

- Get `Auth:Google:ClientId` and `Auth:Google:ClientSecret` from Google Cloud Console > APIs & Services > Credentials > OAuth client ID.
- Use an OAuth client of type `Web application`.
- Add this local authorized redirect URI in Google Cloud Console:

```text
http://localhost:3000/api/auth/callback
```

## Deployment

### Portfolio UI

- Builds the Next.js app from `todo/` in GitHub Actions when files under `todo/**` change.
- Deploys to Azure Web App after `pnpm install` and `pnpm build` complete.
- `NEXT_PUBLIC_API_URL` is stored as a GitHub repository secret and injected during the build.
- Optionally set `API_URL` as an Azure App Service application setting for the UI if the Next.js proxy route handlers should call a different server-only API URL. If omitted, they use `NEXT_PUBLIC_API_URL`.
- Local development uses `todo/.env.local`.

### API

- Builds and publishes the ASP.NET Core app from `api/api/` when files under `api/**` change.
- Deploys the published artifact to Azure Web App from GitHub Actions.
- The workflow currently does not inject app-specific runtime environment variables.
- Store API runtime settings in the Azure Portal under the API Web App:
  Settings > Environment variables > App settings.
  Add these app settings:
  - `Auth__Google__ClientId`: Google OAuth web client ID.
  - `Auth__Google__ClientSecret`: Google OAuth web client secret.
  - `Auth__AdminEmail`: the allowed admin account.
- Add this production authorized redirect URI in Google Cloud Console:

```text
https://<ui-app>.azurewebsites.net/api/auth/callback
```

The browser signs in through the UI origin. Next.js proxies `/api/auth/*` to the ASP.NET Core API, so Google redirect URIs should use the UI host, not the API host.
