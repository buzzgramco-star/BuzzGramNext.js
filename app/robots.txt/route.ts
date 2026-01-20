import { NextResponse } from 'next/server';

export async function GET() {
  const robotsTxt = `# BuzzGram - Toronto Local Business Directory
# Optimized for search engines and AI crawlers

# Allow all search engines
User-agent: *
Allow: /

# Specifically allow AI crawlers (for AEO)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

# Disallow private pages
Disallow: /dashboard
Disallow: /settings
Disallow: /profile
Disallow: /favorites
Disallow: /admin
Disallow: /business-dashboard
Disallow: /login
Disallow: /register
Disallow: /verify-email

# Sitemap location
Sitemap: https://buzz-gram-next-js.vercel.app/sitemap.xml

# Crawl-delay for politeness
Crawl-delay: 1
`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
