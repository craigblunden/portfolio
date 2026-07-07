# portfolio

## Deployment

### Portfolio UI

- Builds the Next.js app from `todo/` in GitHub Actions when files under `todo/**` change.
- Deploys to Azure Web App after `pnpm install` and `pnpm build` complete.
- `NEXT_PUBLIC_API_URL` is stored as a GitHub repository secret and injected during the build.
- Local development uses `todo/.env`.

### API

- Builds and publishes the ASP.NET Core app from `api/api/` when files under `api/**` change.
- Deploys the published artifact to Azure Web App from GitHub Actions.
- The workflow currently does not inject app-specific runtime environment variables.
- Any future API runtime settings should be stored in Azure App Service settings or added as GitHub secrets if they are needed in CI.
