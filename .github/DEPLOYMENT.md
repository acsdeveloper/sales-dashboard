# GitHub Pages Deployment Guide

This document explains how to deploy the Spend Overview Dashboard to GitHub Pages.

## Prerequisites

- GitHub repository with this code
- GitHub Pages enabled in repository settings

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: Select **GitHub Actions**
   - (The old "Deploy from a branch" method is not used)

### 2. Configure Repository Settings

If your repository is not at the root of your GitHub account (e.g., `username.github.io`), you'll need to set the base path.

#### For Project Pages (e.g., `username.github.io/repository-name`)

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository variable**
3. Name: `NEXT_PUBLIC_BASE_PATH`
4. Value: `/your-repository-name` (e.g., `/code`)
5. Click **Add variable**

#### For User/Organization Pages (e.g., `username.github.io`)

No additional configuration needed. The base path defaults to empty.

### 3. Trigger Deployment

The deployment workflow automatically runs on:
- Push to `main` or `master` branch
- Manual trigger via workflow dispatch

#### Automatic Deployment
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

#### Manual Deployment
1. Go to **Actions** tab in your repository
2. Select "Deploy Next.js to GitHub Pages"
3. Click **Run workflow**
4. Select branch and click **Run workflow**

### 4. Access Your Deployed Site

After successful deployment (typically 2-5 minutes):
- **User/Org Pages**: `https://username.github.io`
- **Project Pages**: `https://username.github.io/repository-name`

## Workflow Details

The deployment workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) performs:

1. **Checkout**: Clones the repository
2. **Setup Node.js**: Installs Node.js 20 with npm caching
3. **Setup Pages**: Configures GitHub Pages
4. **Install Dependencies**: Runs `npm ci`
5. **Build**: Generates static export with `npm run build`
6. **Upload Artifact**: Uploads the `./out` directory
7. **Deploy**: Deploys to GitHub Pages

## Configuration Files

### next.config.mjs

```javascript
const nextConfig = {
  output: 'export',                               // Enable static export
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '', // Dynamic base path
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,                            // Required for static export
  },
}
```

### Key Settings:
- **output: 'export'**: Generates static HTML/CSS/JS files
- **basePath**: Supports repository-specific paths
- **images.unoptimized**: Disables Next.js image optimization (required for static export)

## Troubleshooting

### Deployment Fails at Build Step

**Error**: `TypeError: fetch failed` or API errors during build

**Solution**: This is expected since GitHub Actions can't access your Google Sheets API during build. The app is client-side and will fetch data after deployment.

### Build Output Directory Not Found

**Error**: `tar: out: Cannot open: No such file or directory`

**Cause**: The `out` directory was not created during the build process.

**Solution**:
1. Verify `next.config.mjs` has `output: 'export'` configured
2. Check the build logs in the Actions tab for any errors
3. Ensure all dependencies are properly installed
4. The verification step in the workflow will help identify the issue
5. If the build succeeds locally but fails in CI, check for environment-specific issues

### 404 Error After Deployment

**Cause**: Incorrect base path configuration

**Solution**:
1. Verify `NEXT_PUBLIC_BASE_PATH` matches your repository name
2. Check that it starts with `/` (e.g., `/code`, not `code`)
3. For user pages (`username.github.io`), remove the variable

### Blank Page After Deployment

**Cause**: Assets not loading due to path issues

**Solution**:
1. Open browser DevTools (F12) → Console
2. Check for 404 errors on CSS/JS files
3. Verify base path settings
4. Clear cache and hard reload (Ctrl+Shift+R)

### Workflow Permission Errors

**Error**: `Error: Resource not accessible by integration`

**Solution**:
1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

### API CORS Errors in Production

**Cause**: Google Apps Script CORS restrictions

**Solution**: See [API Documentation](../api/README.md) for CORS configuration

## Advanced Configuration

### Custom Domain

1. Add a `CNAME` file to the `public/` directory:
   ```bash
   echo "yourdomain.com" > public/CNAME
   ```

2. Configure DNS:
   - Add a CNAME record pointing to `username.github.io`
   - Or add A records to GitHub's IPs

3. Update repository settings:
   - Go to **Settings** → **Pages**
   - Enter custom domain
   - Check **Enforce HTTPS**

### Environment Variables for Production

Create `.env.production` (not committed to git):
```bash
NEXT_PUBLIC_API_URL=your_google_script_url
NEXT_PUBLIC_BASE_PATH=/your-repo-name
```

Update `app/page.tsx` to use environment variable:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'fallback_url'
```

### Caching Strategy

The workflow uses npm caching to speed up builds:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

To clear cache:
1. Go to **Actions** → **Caches**
2. Delete old caches
3. Re-run workflow

## Monitoring Deployments

### View Deployment Status
1. **Actions Tab**: See real-time workflow progress
2. **Environments**: View deployment history under **Settings** → **Environments** → **github-pages**

### Deployment History
- All deployments are tracked under the **Deployments** section in the repository

### Rollback
If a deployment fails:
1. Go to **Actions**
2. Find the last successful workflow run
3. Click **Re-run all jobs**

Or revert the commit:
```bash
git revert HEAD
git push origin main
```

## Performance Optimization

### Build Time
Current build generates:
- Static HTML for all routes
- Optimized JavaScript bundles
- CSS files
- Public assets

Average build time: 1-2 minutes

### Bundle Size
To analyze bundle size:
```bash
npm run build
```

Check `.next/analyze` for bundle reports.

## Security Considerations

1. **API Keys**: Never commit API keys to the repository
2. **Environment Variables**: Use GitHub Secrets for sensitive data
3. **Public Repository**: All code is visible; keep credentials out of source code

## Additional Resources

- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Support

For deployment issues:
1. Check the **Actions** tab for error logs
2. Review this troubleshooting guide
3. Open an issue in the repository
