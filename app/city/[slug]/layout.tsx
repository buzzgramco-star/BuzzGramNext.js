import { Metadata } from 'next';
import Script from 'next/script';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

// City to Province mapping
const CITY_PROVINCE_MAP: Record<string, string> = {
  'toronto': 'ON',
  'vancouver': 'BC',
  'calgary': 'AB',
  'montreal': 'QC',
  'ottawa': 'ON',
};

// Server-side metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Fetch city data by slug server-side with caching for performance
  const cityResponse = await fetch(`https://backend-production-f30d.up.railway.app/api/cities/by-slug/${slug}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
  const cityData = await cityResponse.json();
  const city = cityData.success ? cityData.data : null;
  const cityName = city?.name || slug.charAt(0).toUpperCase() + slug.slice(1);
  const cityId = city?.id;

  const businessResponse = await fetch(
    `https://backend-production-f30d.up.railway.app/api/businesses?cityId=${cityId}`,
    { next: { revalidate: 300 } } // Cache for 5 minutes
  );
  const businessData = await businessResponse.json();
  const businessCount = businessData.success ? businessData.data.length : 0;

  const title = `Local Businesses in ${cityName} | Beauty, Food & Events | BuzzGram`;
  const description = `Discover verified local businesses in ${cityName}. Browse beauty services (nails, lashes, makeup, hair), food services (bakery, catering, chefs), and event services (decor, planning, photography). Connect instantly with top-rated ${cityName} businesses on BuzzGram.`;

  return {
    title,
    description,
    keywords: [
      `${cityName} businesses`,
      `local businesses ${cityName}`,
      `nail salons ${cityName}`,
      `lash extensions ${cityName}`,
      `makeup artists ${cityName}`,
      `hair salons ${cityName}`,
      `bakery ${cityName}`,
      `catering ${cityName}`,
      `private chef ${cityName}`,
      `event planners ${cityName}`,
      `event decorators ${cityName}`,
      `wedding photographers ${cityName}`,
      `beauty services ${cityName}`,
      `food services ${cityName}`,
      `event services ${cityName}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://buzz-gram-next-js.vercel.app/city/${slug}`,
      siteName: 'BuzzGram',
      locale: 'en_CA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://buzz-gram-next-js.vercel.app/city/${slug}`,
    },
  };
}

export default async function CityLayout({ params, children }: Props) {
  const { slug } = await params;

  // Fetch city data by slug server-side for structured data
  const cityResponse = await fetch(`https://backend-production-f30d.up.railway.app/api/cities/by-slug/${slug}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
  const cityData = await cityResponse.json();
  const city = cityData.success ? cityData.data : null;
  const cityId = city?.id;

  const businessResponse = await fetch(
    `https://backend-production-f30d.up.railway.app/api/businesses?cityId=${cityId}`,
    { next: { revalidate: 300 } } // Cache for 5 minutes
  );
  const businessData = await businessResponse.json();
  const businesses = businessData.success ? businessData.data : [];

  const cityName = city?.name || slug.charAt(0).toUpperCase() + slug.slice(1);
  const province = CITY_PROVINCE_MAP[slug] || 'ON';
  const businessCount = businesses.length;

  // Generate ItemList Schema
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Local Businesses in ${cityName}`,
    description: `Discover verified local businesses in ${cityName} across beauty, food, and events services.`,
    numberOfItems: businessCount,
    itemListElement: businesses.slice(0, 20).map((business: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        '@id': `https://buzz-gram-next-js.vercel.app/business/${business.slug}`,
        name: business.name,
        description: business.description || `${business.name} - a local business in ${cityName}`,
        url: `https://buzz-gram-next-js.vercel.app/business/${business.slug}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: cityName,
          addressRegion: province,
          addressCountry: 'CA',
        },
      },
    })),
  };

  // Generate FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What are the best local businesses in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${cityName} features ${businessCount} verified local businesses on BuzzGram. Top-rated options include businesses specializing in beauty services (nails, lashes, makeup, hair), food services (bakery, catering, private chefs), and event services (decor, planning, photography). Browse verified listings to compare services and connect instantly through quote requests.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I find verified businesses in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `BuzzGram makes it easy to discover verified businesses in ${cityName}. Filter by category and subcategory, view business Instagram profiles, read descriptions, and submit quote requests directly. All businesses are verified and actively serving the ${cityName} area.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I contact businesses directly through BuzzGram?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! BuzzGram allows you to connect with ${cityName} businesses through instant quote requests. Submit your service needs, and businesses respond directly. You can also visit their Instagram profiles to see their latest work and portfolio.`,
        },
      },
      {
        '@type': 'Question',
        name: `What types of services are available in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${cityName} offers diverse services including beauty services (nails, lashes, makeup, hair), food services (bakery, catering, private chefs), and event services (decor, planning, photography). BuzzGram features businesses across all service levels and specialties.`,
        },
      },
      {
        '@type': 'Question',
        name: `How can I view portfolios of businesses in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Every business on BuzzGram includes an Instagram link where you can view their latest work, customer photos, and portfolio. This helps you make informed decisions by seeing real examples of their services before contacting them.`,
        },
      },
      {
        '@type': 'Question',
        name: `Are businesses on BuzzGram verified and trustworthy?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `All businesses listed on BuzzGram are verified and actively serving ${cityName}. We ensure each business is legitimate with an active Instagram presence and genuine service offerings. Connect with confidence knowing businesses are vetted.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I request quotes from businesses in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Requesting quotes is simple on BuzzGram. Browse businesses in ${cityName}, select the business that matches your needs, and click the quote request button. Fill in your service requirements and receive responses directly from interested businesses.`,
        },
      },
      {
        '@type': 'Question',
        name: `What makes BuzzGram different for finding businesses in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `BuzzGram specializes in connecting ${cityName} residents with local businesses. Unlike general directories, we focus on verified businesses with active Instagram presence, direct quote request functionality, and category-specific filtering for beauty, food, and events services.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I browse businesses by specialty in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! BuzzGram allows you to filter businesses by specific subcategories. Whether you're looking for nail services, lash extensions, makeup artists, bakeries, catering, event planners, or photographers in ${cityName}, our category filters help you find exactly what you need.`,
        },
      },
      {
        '@type': 'Question',
        name: `How many businesses are listed in ${cityName} on BuzzGram?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `BuzzGram currently features ${businessCount} verified businesses serving ${cityName}. Our directory is continuously growing with new verified businesses joining regularly. Each listing includes Instagram links and direct quote request capabilities.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is BuzzGram free to use for finding businesses in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! BuzzGram is completely free for customers. Browse unlimited businesses in ${cityName}, view Instagram profiles, submit quote requests, and connect with businesses at no cost. We're committed to making local business discovery accessible to everyone.`,
        },
      },
      {
        '@type': 'Question',
        name: `What information is included in business listings on BuzzGram?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Each business listing includes the business name, category and specialty, service description, Instagram handle with direct profile link, and quote request functionality. This gives you everything needed to evaluate and contact ${cityName} businesses.`,
        },
      },
    ],
  };

  // Generate Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://buzz-gram-next-js.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: cityName,
        item: `https://buzz-gram-next-js.vercel.app/city/${slug}`,
      },
    ],
  };

  // Combine all schemas
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [itemListSchema, faqSchema, breadcrumbSchema],
  };

  return (
    <>
      {/* Server-rendered JSON-LD structured data */}
      <Script
        id="city-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />
      {children}
    </>
  );
}
