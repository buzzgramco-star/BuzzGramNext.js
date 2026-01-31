# BuzzGram Frontend - Deployment Guide

Complete guide for deploying the BuzzGram frontend to Vercel.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Post-Deployment](#post-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- Vercel account (sign up at https://vercel.com)
- GitHub account (for automatic deployments)
- Cloudinary account (for image uploads)
- Google Cloud Console (for OAuth)

### Required Services
- Backend API running on Railway
- PostgreSQL database accessible

### Local Testing
Before deploying, ensure the project builds successfully locally:

```bash
cd frontend-nextjs
npm install
npm run build
npm start
```

Visit http://localhost:3000 and verify:
- ✅ All pages load without errors
- ✅ Dark mode toggle works
- ✅ API calls succeed
- ✅ SSR pages render correctly
- ✅ Metadata appears in page source

---

## Environment Variables

### Production Environment Variables

Set these in Vercel dashboard before deploying:

#### Required Variables

**NEXT_PUBLIC_API_URL**
```
https://backend-production-f30d.up.railway.app
```
- Backend API base URL
- **CRITICAL**: Must match Railway backend URL exactly
- No trailing slash

**NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME**
```
your_cloudinary_cloud_name
```
- Get from Cloudinary Dashboard → Settings → Account
- Used for image uploads in business dashboard

**NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET**
```
your_cloudinary_upload_preset
```
- Create in Cloudinary Dashboard → Settings → Upload → Upload Presets
- Set to "Unsigned" for client-side uploads
- Configure upload folder and transformations

**NEXT_PUBLIC_GOOGLE_CLIENT_ID**
```
your_google_client_id.apps.googleusercontent.com
```
- Get from Google Cloud Console → Credentials → OAuth 2.0 Client IDs
- Configure authorized JavaScript origins:
  - `https://buzzgram-frontend.vercel.app`
  - `https://buzz-gram-next-js.vercel.app`
- Configure authorized redirect URIs:
  - `https://buzzgram-frontend.vercel.app`
  - `https://buzz-gram-next-js.vercel.app`

### How to Set Environment Variables in Vercel

#### Method 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project (e.g., `buzzgram-frontend`)
3. Click "Settings" tab
4. Click "Environment Variables" in sidebar
5. Add each variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://backend-production-f30d.up.railway.app`
   - **Environments**: Check all (Production, Preview, Development)
6. Click "Save"
7. Repeat for all variables

#### Method 2: Vercel CLI

```bash
vercel env add NEXT_PUBLIC_API_URL
# Paste value when prompted
# Select environments: Production, Preview, Development

vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
vercel env add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

#### Method 3: `.env` File (Local Development)

Create `.env.local` for local development only:

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

**⚠️ NEVER commit `.env.local` to Git!**

---

## Vercel Deployment

### Initial Deployment

#### Step 1: Connect GitHub Repository

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Click "Import"

#### Step 2: Configure Project

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `./` (if monorepo, set to `frontend-nextjs`)

**Build Command**:
```bash
npm run build
```

**Output Directory**: `.next` (default)

**Install Command**:
```bash
npm install
```

**Node.js Version**: 18.x or higher

#### Step 3: Set Environment Variables

Add all production environment variables (see above section)

#### Step 4: Deploy

Click "Deploy" button

Vercel will:
1. Install dependencies (`npm install`)
2. Run build (`npm run build`)
3. Deploy to production URL
4. Assign domain (e.g., `buzzgram-frontend.vercel.app`)

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

**Production Deployments** (from `main` branch)
```bash
git checkout main
git pull origin develop  # Merge develop into main
git push origin main
```
- Triggers production deployment
- Deploys to `https://buzzgram-frontend.vercel.app`
- Runs all build checks
- Updates DNS automatically

**Preview Deployments** (from any branch)
```bash
git checkout feature/new-feature
git push origin feature/new-feature
```
- Creates preview deployment
- Gets unique URL: `buzzgram-frontend-git-feature-new-feature.vercel.app`
- Perfect for testing before merging

**Pull Request Deployments**
- Automatically deploys for each PR
- Comment appears in GitHub PR with preview URL
- Updates on each commit to PR

### Manual Deployment via CLI

#### Install Vercel CLI

```bash
npm install -g vercel
```

#### Login to Vercel

```bash
vercel login
```

#### Deploy to Production

```bash
cd frontend-nextjs
vercel --prod
```

#### Deploy to Preview

```bash
vercel
```

---

## Post-Deployment

### Verification Checklist

After deployment completes, verify the following:

#### 1. Homepage Loads
```bash
curl https://buzzgram-frontend.vercel.app
```
✅ Should return HTML without errors

#### 2. API Connection
- Visit https://buzzgram-frontend.vercel.app
- Open browser DevTools → Network tab
- Check API requests to backend
- ✅ Should see requests to `https://backend-production-f30d.up.railway.app`
- ✅ No CORS errors

#### 3. SSR Pages Render
Visit each city page and view source:
- https://buzzgram-frontend.vercel.app/city/toronto
- https://buzzgram-frontend.vercel.app/city/vancouver
- https://buzzgram-frontend.vercel.app/city/phoenix

✅ Verify:
- Meta tags include correct city name (not "Toronto" for all cities!)
- JSON-LD structured data appears in `<script>` tags
- CollectionPage, FAQPage, BreadcrumbList schemas present

#### 4. Test SEO/Structured Data

**Google Rich Results Test**
1. Go to https://search.google.com/test/rich-results
2. Enter URL: `https://buzzgram-frontend.vercel.app/city/toronto/beauty/nails`
3. Click "Test URL"
4. ✅ Should detect CollectionPage, FAQPage, BreadcrumbList schemas

**Manual Page Source Check**
```bash
curl https://buzzgram-frontend.vercel.app/city/vancouver/beauty/nails | grep "Vancouver"
```
✅ Should find "Vancouver" in metadata (not "Toronto")

#### 5. Authentication Works
- Test Google OAuth login
- Test email/password registration
- Test JWT token persistence

#### 6. Dark Mode Works
- Toggle theme in header
- Refresh page
- ✅ Theme should persist

#### 7. Mobile Responsiveness
Test on mobile device or Chrome DevTools:
- ✅ Mobile menu works
- ✅ Cards stack vertically
- ✅ Images load properly
- ✅ Forms are usable

#### 8. Performance Check

**Vercel Analytics**
- Go to Vercel Dashboard → Project → Analytics
- Check Core Web Vitals:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

**Lighthouse Score**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run Lighthouse
lighthouse https://buzzgram-frontend.vercel.app --view
```
Target scores:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

### Custom Domain Setup

#### 1. Add Domain in Vercel

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Click "Add Domain"
3. Enter domain: `buzzgram.com`
4. Click "Add"

#### 2. Configure DNS

Add these records in your DNS provider (e.g., Cloudflare, GoDaddy):

**For root domain (`buzzgram.com`)**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain (`www.buzzgram.com`)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### 3. Verify Domain

- Wait for DNS propagation (up to 24 hours)
- Vercel will automatically issue SSL certificate
- Test: https://buzzgram.com

#### 4. Update Environment Variables

Update Google OAuth authorized origins and redirect URIs to include:
- `https://buzzgram.com`
- `https://www.buzzgram.com`

Update backend CORS configuration to allow:
- `https://buzzgram.com`

---

## Rollback Procedures

### Quick Rollback via Vercel Dashboard

1. Go to Vercel Dashboard → Project → Deployments
2. Find the last working deployment
3. Click "..." menu → "Promote to Production"
4. Confirm rollback

⏱️ Rollback completes in ~30 seconds

### Rollback via Git

```bash
# Find last working commit
git log --oneline

# Revert to specific commit
git revert <commit-hash>
git push origin main
```

Vercel will automatically deploy the reverted version.

### Rollback via Vercel CLI

```bash
# List recent deployments
vercel ls

# Promote specific deployment to production
vercel promote <deployment-url>
```

### Emergency Rollback

If deployment is broken and causing issues:

1. **Immediately pause deployments**:
   - Vercel Dashboard → Settings → Git → Pause Git integration

2. **Rollback to last working version**:
   - Deployments tab → Find working version → Promote

3. **Fix issue locally**:
   ```bash
   git checkout -b hotfix/deployment-issue
   # Fix the issue
   npm run build  # Verify build works
   git commit -m "fix: deployment issue"
   git push origin hotfix/deployment-issue
   ```

4. **Create PR and test preview deployment**:
   - Open PR on GitHub
   - Vercel creates preview deployment
   - Test preview thoroughly

5. **Resume Git integration and merge**:
   - Vercel Dashboard → Settings → Git → Resume
   - Merge PR to main

---

## Troubleshooting

### Build Fails

**Error**: `Type error: ...`

**Solution**:
```bash
# Test build locally
npm run build

# Fix TypeScript errors
# Ensure all types are properly imported
```

**Error**: `Module not found: Can't resolve '@/components/...'`

**Solution**:
- Check `tsconfig.json` has correct path aliases
- Verify file exists and path is correct
- Check for typos in import statements

### Environment Variables Not Working

**Symptoms**:
- API calls fail with 404
- Images don't upload
- Google OAuth doesn't work

**Solution**:
1. Verify environment variables in Vercel Dashboard → Settings → Environment Variables
2. Ensure variable names start with `NEXT_PUBLIC_`
3. Redeploy after adding/changing variables:
   ```bash
   vercel --prod --force
   ```

### CORS Errors

**Error**: `Access to fetch at 'https://backend-production-f30d.up.railway.app/api/...' has been blocked by CORS policy`

**Solution**:
1. Check backend CORS configuration includes frontend URL
2. Verify `FRONTEND_URL` in Railway environment variables:
   ```
   FRONTEND_URL=https://buzzgram-frontend.vercel.app
   ```
3. Restart backend server on Railway

### SSR Pages Not Rendering

**Symptoms**:
- Pages show blank or loading state
- Metadata missing in page source

**Solution**:
1. Check server-side fetch calls don't fail
2. Verify API_URL is correct
3. Check for errors in Vercel logs:
   ```bash
   vercel logs https://buzzgram-frontend.vercel.app
   ```

### Images Not Loading

**Symptoms**:
- Business images show broken
- Cloudinary uploads fail

**Solution**:
1. Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is correct
2. Check upload preset is "unsigned" in Cloudinary
3. Add Cloudinary domain to `next.config.js`:
   ```javascript
   images: {
     domains: ['res.cloudinary.com'],
   }
   ```

### Performance Issues

**Symptoms**:
- Slow page loads
- Poor Lighthouse scores

**Solutions**:
1. Enable Vercel Edge Caching:
   - Add `revalidate` to fetch calls
2. Optimize images:
   - Use Next.js `<Image>` component
   - Set appropriate sizes
3. Enable Vercel Analytics to identify bottlenecks
4. Consider upgrading Vercel plan for better performance

---

## Continuous Deployment Workflow

### Recommended Git Flow

```
main (production)
  ↑
develop (staging)
  ↑
feature/xxx (preview deployments)
```

### Development Cycle

1. **Create feature branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature
   ```

2. **Develop and test locally**:
   ```bash
   npm run dev
   npm run build  # Test build
   ```

3. **Push and create PR**:
   ```bash
   git push origin feature/new-feature
   # Create PR on GitHub
   # Vercel creates preview deployment
   ```

4. **Review preview deployment**:
   - Check preview URL in GitHub PR comment
   - Test all functionality
   - Request code review

5. **Merge to develop**:
   ```bash
   # After PR approval
   git checkout develop
   git merge feature/new-feature
   git push origin develop
   ```

6. **Test on develop deployment**:
   - Verify changes on develop preview
   - Run full QA

7. **Promote to production**:
   ```bash
   git checkout main
   git merge develop
   git push origin main
   # Automatic production deployment
   ```

---

## Monitoring & Logs

### Vercel Logs

**Real-time logs**:
```bash
vercel logs https://buzzgram-frontend.vercel.app --follow
```

**Logs for specific deployment**:
```bash
vercel logs <deployment-url>
```

**Logs in Dashboard**:
- Vercel Dashboard → Project → Logs
- Filter by time range, status, or search term

### Vercel Analytics

- Real-time traffic monitoring
- Core Web Vitals tracking
- Top pages by traffic
- Referrer sources

Access at: Vercel Dashboard → Project → Analytics

### Error Tracking

Consider integrating error tracking:
- Sentry (https://sentry.io)
- LogRocket (https://logrocket.com)

---

## Best Practices

1. **Always test locally before deploying**:
   ```bash
   npm run build && npm start
   ```

2. **Use preview deployments for testing**:
   - Never merge untested code to main
   - Test preview URLs thoroughly

3. **Keep environment variables in sync**:
   - Update Vercel when backend URLs change
   - Document all required variables

4. **Monitor deployments**:
   - Check Vercel dashboard after each deployment
   - Set up notifications for failed builds

5. **Use semantic versioning**:
   - Tag releases: `git tag v1.0.0`
   - Keep changelog updated

6. **Regular dependency updates**:
   ```bash
   npm outdated
   npm update
   ```

---

## Additional Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel CLI Reference**: https://vercel.com/docs/cli
- **Edge Functions**: https://vercel.com/docs/concepts/functions/edge-functions

---

## Support

For deployment issues:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review Vercel logs
3. Contact development team

---

**Production URL**: https://buzzgram-frontend.vercel.app
**Backend API**: https://backend-production-f30d.up.railway.app
