import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buzzgram.co';

export async function GET() {
  // Fetch Toronto businesses to generate dynamic URLs
  const response = await fetch('https://backend-production-f30d.up.railway.app/api/businesses?cityId=36', {
    cache: 'no-store',
  });

  const data = await response.json();
  const businesses = data.success ? data.data : [];

  // Static pages
  const staticPages = [
    {
      url: BASE_URL,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/city/toronto`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9,
    },
    // Toronto category pages (Phase 2 SEO)
    {
      url: `${BASE_URL}/city/toronto/beauty`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/city/toronto/food`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/city/toronto/events`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.85,
    },
    // Toronto subcategory pages (Phase 3 SEO)
    // Beauty subcategories
    {
      url: `${BASE_URL}/city/toronto/beauty/nails`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/city/toronto/beauty/lashes`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/city/toronto/beauty/makeup`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/city/toronto/beauty/hair`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.82,
    },
    // Food subcategories
    {
      url: `${BASE_URL}/city/toronto/food/bakery`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/city/toronto/food/catering`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/city/toronto/food/chef`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.82,
    },
    // Event subcategories
    {
      url: `${BASE_URL}/city/toronto/events/planning`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/city/toronto/events/decor`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/city/toronto/events/photography`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.82,
    },
    {
      url: `${BASE_URL}/blog`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/quotelanding`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.6,
    },
  ];

  // Toronto business pages (ONLY Toronto - city ID 36) - Use slug URLs
  const businessPages = businesses.map((business: any) => ({
    url: `${BASE_URL}/business/${business.slug}`,
    lastmod: business.updatedAt || new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.8,
  }));

  const allPages = [...staticPages, ...businessPages];

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
