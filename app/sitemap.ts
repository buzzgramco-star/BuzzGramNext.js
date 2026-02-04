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

  // Fetch all businesses dynamically
  let businessPages: MetadataRoute.Sitemap = []

  try {
    console.log('[Sitemap] Fetching businesses from API...')
    const response = await fetch(`${apiBaseUrl}/businesses`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()

    if (data.success && Array.isArray(data.data)) {
      console.log(`[Sitemap] Found ${data.data.length} businesses`)

      businessPages = data.data.map((business: any) => ({
        url: `${baseUrl}/business/${business.slug}`,
        lastModified: business.updatedAt ? new Date(business.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    } else {
      console.warn('[Sitemap] Invalid API response format')
    }
  } catch (error) {
    console.error('[Sitemap] Failed to fetch businesses:', error)
    console.warn('[Sitemap] Continuing with basic sitemap (no business pages)')
    // Fallback: Return sitemap without business pages (no breaking)
  }

  return [...staticPages, ...cityPages, ...cityCategories, ...businessPages]
}
