# Quick Start - GitHub Pages Deployment

This is a quick reference guide for deploying your Next.js app to GitHub Pages.

## Prerequisites Checklist

- [ ] GitHub repository created
- [ ] Code pushed to `main` or `master` branch
- [ ] GitHub Pages enabled in repository settings

## One-Time Setup (5 minutes)

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select `GitHub Actions`

### Step 2: Set Base Path (Only for Project Pages)

**Skip this if your repo is `username.github.io`**

For repositories like `username.github.io/my-project`:

1. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Click **New repository variable**
3. Name: `NEXT_PUBLIC_BASE_PATH`
4. Value: `/your-repository-name` (e.g., `/code`)
5. Click **Add variable**

### Step 3: Set Workflow Permissions

1. Go to **Settings** → **Actions** → **General**
2. Scroll to "Workflow permissions"
3. Select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

## Deploy Your App

### Option 1: Automatic Deployment (Disabled by Default)

To enable automatic deployment on every push, update `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:
```

Then push to trigger deployment:
```bash
git add .
git commit -m "Enable auto-deployment"
git push origin main
```

### Option 2: Manual Deployment (Current Setting)

1. Go to **Actions** tab in your repository
2. Click **Deploy Next.js to GitHub Pages**
3. Click **Run workflow** button
4. Select branch (usually `main`)
5. Click **Run workflow**

## Monitor Deployment

1. Go to **Actions** tab
2. Click on the running workflow
3. Watch the build progress
4. Deployment typically takes 2-5 minutes

## Access Your Site

After successful deployment:

- **User/Org Pages**: `https://username.github.io`
- **Project Pages**: `https://username.github.io/repository-name`

## Common Issues & Quick Fixes

### ❌ Build Fails - "out directory not found"

**Fix**: Check that `next.config.mjs` has:
```javascript
output: 'export'
```

### ❌ 404 Error on Deployment

**Fix**:
1. Check base path variable matches repository name
2. Clear browser cache (Ctrl+Shift+R)

### ❌ Permission Error

**Fix**: Enable "Read and write permissions" in Settings → Actions → General

### ❌ Assets Not Loading

**Fix**:
1. Verify base path configuration
2. Check browser console for 404 errors
3. Clear cache and reload

## Local Testing Before Deploy

Test the production build locally:

```bash
# Build
npm run build

# Check if out directory was created
ls out

# Serve locally (optional - requires serve package)
npx serve out
```

## Updating Your Site

1. Make changes to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update site"
   git push origin main
   ```
3. If auto-deploy is enabled, it will deploy automatically
4. Otherwise, trigger manually from Actions tab

## Rollback to Previous Version

If deployment breaks:

1. Go to **Actions** tab
2. Find the last successful workflow run
3. Click **Re-run all jobs**

Or revert the commit:
```bash
git revert HEAD
git push origin main
```

## Files Overview

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | Deployment automation |
| `next.config.mjs` | Next.js configuration with `output: 'export'` |
| `public/.nojekyll` | Ensures GitHub Pages serves all files |
| `.github/DEPLOYMENT.md` | Detailed deployment guide |

## Environment Variables (Optional)

To use environment variables in production:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add variables with `NEXT_PUBLIC_` prefix
3. Access in code: `process.env.NEXT_PUBLIC_YOUR_VAR`

## Need More Help?

- **Detailed Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Setup**: See [../api/README.md](../api/README.md)
- **Project Docs**: See [../README.md](../README.md)

## Verification Checklist

After deployment, verify:

- [ ] Site loads at the correct URL
- [ ] All pages are accessible
- [ ] Images and assets load correctly
- [ ] API calls work (Google Sheets data loads)
- [ ] No console errors in browser DevTools
- [ ] Mobile responsive design works

## Performance Tips

- Static export creates optimized HTML/CSS/JS
- No server-side rendering means fast page loads
- GitHub Pages uses CDN for global distribution
- Average build time: 1-2 minutes
- Average deployment time: 30 seconds

## Troubleshooting Commands

Run these locally to diagnose issues:

```bash
# Check for outdated packages
npm outdated

# Verify build works
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Lint code
npm run lint

# View build output
ls -la out
```

## Quick Links

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Next.js Static Export Docs](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Ready to deploy?** Follow the steps above and your site will be live in minutes!
