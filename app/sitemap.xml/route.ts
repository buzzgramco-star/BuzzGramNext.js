import { NextResponse } from 'next/server';

const BASE_URL = 'https://buzz-gram-next-js.vercel.app';

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
      url: `${BASE_URL}/city/36`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9,
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

  // Toronto business pages (ONLY Toronto - city ID 36)
  const businessPages = businesses.map((business: any) => ({
    url: `${BASE_URL}/business/${business.id}`,
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
