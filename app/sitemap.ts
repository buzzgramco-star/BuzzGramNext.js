import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use environment variable if available, otherwise fallback to production domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://buzzgram.co'
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-f30d.up.railway.app/api'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/business-signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/quote`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // City pages - hardcoded since we know them
  const cities = [
    'toronto',
    'vancouver',
    'calgary',
    'montreal',
    'ottawa',
    'new-york-city',
    'los-angeles',
    'chicago',
    'miami',
    'phoenix',
  ]

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${baseUrl}/city/${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Categories and subcategories for each city
  const categories = ['beauty', 'food', 'events']
  const subcategoriesMap: Record<string, string[]> = {
    beauty: ['nails', 'lashes', 'makeup', 'hair'],
    food: ['bakery', 'catering', 'private-chef'],
    events: ['event-decor', 'event-planning', 'photography'],
  }

  const cityCategories: MetadataRoute.Sitemap = []

  cities.forEach((city) => {
    categories.forEach((category) => {
      // Add category pages only (removed subcategories for focused indexing)
      cityCategories.push({
        url: `${baseUrl}/city/${city}/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })
  })

  // Business pages removed from sitemap for focused indexing strategy
  // Google will discover them through internal links from category pages
  // This prevents overwhelming Google with 1000+ pages on a new site

  console.log('[Sitemap] Generated priority sitemap with', staticPages.length + cityPages.length + cityCategories.length, 'pages')

  return [...staticPages, ...cityPages, ...cityCategories]
}
