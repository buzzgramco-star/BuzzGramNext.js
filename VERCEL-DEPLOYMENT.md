# Vercel Deployment Guide - Next.js Migration

## Deployment Strategy: Separate Vercel Project (Zero Downtime)

We'll deploy the Next.js app to a **NEW** Vercel project with a staging URL, test thoroughly, then switch the production domain once confident.

---

## Why a New GitHub Repo?

**Recommended Approach: NEW GitHub Repository**

### Benefits:
1. **Clean separation** - Old Vite app stays untouched as backup
2. **Independent CI/CD** - Separate deployment pipelines
3. **Easy rollback** - Keep old deployment running during transition
4. **Clear history** - New repo starts fresh with Next.js codebase
5. **Zero downtime** - Old site stays live while testing new one

### Alternative: Same Repo, Different Branch
- Push Next.js to new branch (e.g., `nextjs-migration`)
- Deploy that branch to separate Vercel project
- Less clean separation but works if preferred

---

## Step-by-Step Deployment

### Step 1: Create New GitHub Repository

```bash
# On GitHub.com
# 1. Go to github.com/new
# 2. Create repo: "buzzgram-nextjs" (or your preferred name)
# 3. Make it private or public (your choice)
# 4. Don't initialize with README (we have code already)
```

### Step 2: Initialize Git in Next.js App

```bash
cd /Users/Mustafa/frontend-nextjs

# Initialize git
git init

# Create .gitignore (should already exist from Next.js setup)
# Verify it includes:
# - node_modules/
# - .next/
# - .env*.local
# - *.log

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Next.js 16 migration from Vite

- Migrated all 19 pages from Vite to Next.js 16 App Router
- Added Google OAuth and Cloudinary integration
- Implemented cookie-based authentication (SSR-compatible)
- Added dark mode with Tailwind CSS 4
- All routes tested and building successfully"

# Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/buzzgram-nextjs.git

# Push to GitHub
git push -u origin main
```

### Step 3: Create New Vercel Project

**Via Vercel Dashboard:**

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your new GitHub repo (`buzzgram-nextjs`)
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Environment Variables** - Add these in Vercel dashboard:

```env
# Production Backend
NEXT_PUBLIC_API_URL=https://backend-production-f30d.up.railway.app/api

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=598803655760-2c6at9j8hgcj3lbvo13gse7vi3amro28.apps.googleusercontent.com

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dsfwjxtoi
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=buzzgram_reviews

# Environment
NEXT_PUBLIC_ENV=production

# SEO (all cities in production)
NEXT_PUBLIC_SEO_CITIES=true
```

6. Click "Deploy"

**Via Vercel CLI (Alternative):**

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login
vercel login

# Deploy (from /Users/Mustafa/frontend-nextjs)
vercel

# Follow prompts:
# - Setup and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? buzzgram-nextjs (or your choice)
# - Directory? ./ (default)
# - Override settings? No

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://backend-production-f30d.up.railway.app/api

vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID production
# Enter: 598803655760-2c6at9j8hgcj3lbvo13gse7vi3amro28.apps.googleusercontent.com

# Repeat for other env vars...

# Deploy to production
vercel --prod
```

### Step 4: Test on Vercel Staging URL

Your new deployment will be at: `https://buzzgram-nextjs.vercel.app` (or similar)

**Testing Checklist:**

- [ ] Homepage loads
- [ ] City pages load with businesses
- [ ] Login works (email/password)
- [ ] Google OAuth works
- [ ] Register new user works
- [ ] Email verification works
- [ ] User dashboard loads
- [ ] Business owner dashboard loads (for approved owners)
- [ ] Admin dashboard loads (for admins)
- [ ] Dark mode toggle works
- [ ] All API calls work with production backend
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Blog pages work
- [ ] Quote request form works

### Step 5: Update Backend CORS for New URL

**On Railway Backend:**

Add new Vercel URL to CORS whitelist:

```bash
# In Railway dashboard, add environment variable:
FRONTEND_URL=https://buzzgram-nextjs.vercel.app

# Or if backend supports multiple URLs, add to list
```

**Or update backend code:**
```typescript
// backend/src/middleware/cors.ts
const allowedOrigins = [
  'https://buzzgram-frontend.vercel.app', // Old Vite app
  'https://buzzgram-nextjs.vercel.app',   // New Next.js app
  'http://localhost:3000',
  'http://localhost:5173',
];
```

### Step 6: Switch Production Domain (Final Step)

**Once testing is complete and you're confident:**

1. **In Vercel Dashboard:**
   - Go to new Next.js project settings
   - Navigate to "Domains"
   - Add custom domain: `buzzgram-frontend.vercel.app`
   - Vercel will show conflict with old project

2. **Remove Domain from Old Project:**
   - Go to old Vite project in Vercel
   - Settings → Domains
   - Remove `buzzgram-frontend.vercel.app`
   - Domain will be freed up

3. **Add Domain to New Project:**
   - Go back to Next.js project
   - Add domain: `buzzgram-frontend.vercel.app`
   - DNS will automatically update (takes 1-2 minutes)

4. **Custom Domain (if you have one):**
   - If you own `buzzgram.com` or similar
   - Remove from old project
   - Add to new project
   - Update DNS records if needed

### Step 7: Update Backend CORS (Final)

```bash
# Update FRONTEND_URL to point to production domain
FRONTEND_URL=https://buzzgram-frontend.vercel.app
```

Remove staging URL if no longer needed.

---

## Rollback Plan

If issues occur after switching domain:

1. **Quick Rollback (1 minute):**
   - Remove domain from Next.js project
   - Re-add domain to old Vite project
   - Old site is back live

2. **Keep Old Deployment:**
   - Don't delete old Vite Vercel project
   - Keep it as backup for 1-2 weeks
   - Can switch back instantly if needed

---

## Environment Variables Summary

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SEO_CITIES=36
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_GOOGLE_CLIENT_ID=598803655760-2c6at9j8hgcj3lbvo13gse7vi3amro28.apps.googleusercontent.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dsfwjxtoi
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=buzzgram_reviews
```

### Production (Vercel Dashboard)
```env
NEXT_PUBLIC_API_URL=https://backend-production-f30d.up.railway.app/api
NEXT_PUBLIC_SEO_CITIES=true
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_GOOGLE_CLIENT_ID=598803655760-2c6at9j8hgcj3lbvo13gse7vi3amro28.apps.googleusercontent.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dsfwjxtoi
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=buzzgram_reviews
```

---

## Post-Deployment Monitoring

### First 24 Hours:
- Monitor Vercel Analytics for errors
- Check Vercel Logs for runtime errors
- Monitor backend Railway logs for API issues
- Check user reports/feedback
- Monitor Google Analytics (if configured)

### Performance Checks:
- Lighthouse scores (should be 90+)
- Core Web Vitals
- API response times
- Database query performance

---

## Current URLs Reference

### Old Vite App:
- Production: `https://buzzgram-frontend.vercel.app`
- GitHub: (your current repo)

### New Next.js App:
- Staging: `https://buzzgram-nextjs.vercel.app` (after deployment)
- Production: Will use same URL after domain switch
- GitHub: New repo to be created

### Backend:
- Production: `https://backend-production-f30d.up.railway.app`
- GitHub: (your backend repo)

---

## Timeline Estimate

- **Create GitHub repo**: 5 minutes
- **Push code**: 2 minutes
- **Create Vercel project**: 5 minutes
- **Configure env vars**: 5 minutes
- **First deployment**: 2-3 minutes (build time)
- **Testing on staging**: 30-60 minutes (thorough)
- **Update backend CORS**: 2 minutes
- **Switch domain**: 5 minutes
- **Verify production**: 15 minutes

**Total**: ~2-3 hours for complete deployment

---

## Next Step

Run this command to prepare for deployment:

```bash
cd /Users/Mustafa/frontend-nextjs
git status

# If not initialized yet, follow Step 2 above
```

Then let me know when you're ready and I'll guide you through creating the GitHub repo and Vercel deployment!
