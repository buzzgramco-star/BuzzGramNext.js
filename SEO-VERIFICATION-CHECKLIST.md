# Phase 1 SEO/AEO Verification Checklist

## Quick Tests (5 minutes)

### 1. Sitemap Test
- [ ] Open: https://buzz-gram-next-js.vercel.app/sitemap.xml
- [ ] See XML structure (not HTML page)
- [ ] Contains `/business/` URLs

### 2. Robots.txt Test
- [ ] Open: https://buzz-gram-next-js.vercel.app/robots.txt
- [ ] See "GPTBot" listed
- [ ] See "Sitemap:" line at bottom

### 3. Homepage Schema Test
- [ ] Go to: https://buzz-gram-next-js.vercel.app
- [ ] Right-click → View Page Source
- [ ] Search for: "Organization"
- [ ] Search for: "knowsAbout"
- [ ] Should find both in JSON-LD scripts

### 4. Toronto City Page Schema Test
- [ ] Go to: https://buzz-gram-next-js.vercel.app/city/36
- [ ] Right-click → View Page Source
- [ ] Search for: "FAQPage"
- [ ] Search for: "What are the best"
- [ ] Should see 12 FAQ questions in JSON

### 5. Business Page Schema Test
- [ ] Go to: https://buzz-gram-next-js.vercel.app/business/3493
- [ ] Right-click → View Page Source
- [ ] Search for: "LocalBusiness"
- [ ] Search for: "addressLocality"
- [ ] Should see "Toronto" as location

### 6. Meta Tags Test
- [ ] On city page, right-click → Inspect
- [ ] In Elements tab, search for: `<link rel="canonical"`
- [ ] Should show: `href="https://buzz-gram-next-js.vercel.app/city/36"`

---

## Google Tools Tests (10 minutes)

### 7. Rich Results Test (Official Google Tool)
- [ ] Go to: https://search.google.com/test/rich-results
- [ ] Enter: https://buzz-gram-next-js.vercel.app/city/36
- [ ] Click "Test URL"
- [ ] Wait 10-30 seconds
- [ ] Should see: "Page is eligible for rich results"
- [ ] Should detect: FAQPage, ItemList, BreadcrumbList

### 8. Schema Validator Test
- [ ] Go to: https://validator.schema.org/
- [ ] Select "Fetch URL" tab
- [ ] Enter: https://buzz-gram-next-js.vercel.app/city/36
- [ ] Click "Run Test"
- [ ] Should show: 0 Errors

---

## What Each Test Proves

| Test | What It Verifies |
|------|------------------|
| Sitemap | Google can discover all Toronto business pages |
| Robots.txt | AI crawlers are explicitly allowed |
| Homepage Schema | BuzzGram is recognized as a Toronto organization |
| City Page Schema | FAQ questions appear in search/AI results |
| Business Schema | Individual businesses get rich snippets (stars, location) |
| Meta Tags | Social media previews work, canonical URLs set |
| Rich Results Test | Google confirms structured data is valid |
| Schema Validator | No syntax errors in JSON-LD |

---

## Expected Timeline

- **Immediate (now):** All schema visible in page source
- **1-3 days:** Google Search Console detects sitemap
- **1-2 weeks:** Rich results appear in Google search
- **2-4 weeks:** AI Overviews may start citing your FAQs
- **1-2 months:** Rankings improve for Toronto keywords

---

## Troubleshooting

**If you don't see JSON-LD in page source:**
- Clear browser cache and hard refresh (Cmd+Shift+R)
- Try in incognito/private window
- Verify deployment completed on Vercel

**If Rich Results Test shows errors:**
- Take screenshot and share with me
- Most common: missing required fields (we included all)

**If sitemap shows 404:**
- Check URL exactly: `/sitemap.xml` (not `/sitemap`)
- Verify Vercel deployment succeeded

---

## Quick Verification Command

Run this to test all endpoints:

```bash
# Test sitemap exists
curl -I https://buzz-gram-next-js.vercel.app/sitemap.xml | grep "200"

# Test robots.txt exists
curl -I https://buzz-gram-next-js.vercel.app/robots.txt | grep "200"

# Test city page loads
curl -I https://buzz-gram-next-js.vercel.app/city/36 | grep "200"
```

All three should return "HTTP/2 200" or "HTTP/1.1 200"
