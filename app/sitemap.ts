import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use environment variable if available, otherwise fallback to production domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://buzzgram.co'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
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

  // Categories for each city
  const categories = ['beauty', 'food', 'events']
  const cityCategories: MetadataRoute.Sitemap = []

  cities.forEach((city) => {
    categories.forEach((category) => {
      cityCategories.push({
        url: `${baseUrl}/city/${city}/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })
  })

  return [...staticPages, ...cityPages, ...cityCategories]
}
