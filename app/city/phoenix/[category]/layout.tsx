import { Metadata } from 'next';
import Script from 'next/script';

type Props = {
  params: Promise<{ category: string }>;
  children: React.ReactNode;
};

const API_BASE = 'https://backend-production-f30d.up.railway.app/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buzzgram.co';

// Server-side metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;

  // Fetch categories from API
  const categoriesResponse = await fetch(`${API_BASE}/categories`, {
    next: { revalidate: 300 },
  });
  const categoriesData = await categoriesResponse.json();
  const category = categoriesData.success
    ? categoriesData.data.find((c: any) => c.slug === categorySlug)
    : null;

  if (!category) {
    return {
      title: 'Category Not Found | BuzzGram',
    };
  }

  // Fetch subcategories for this category
  const subcategoriesResponse = await fetch(`${API_BASE}/subcategories`, {
    next: { revalidate: 300 },
  });
  const subcategoriesData = await subcategoriesResponse.json();
  const categorySubcategories = subcategoriesData.success
    ? subcategoriesData.data.filter((s: any) => s.categoryId === category.id)
    : [];

  // Fetch city by slug
  const cityResponse = await fetch(`${API_BASE}/cities/by-slug/phoenix`, {
    next: { revalidate: 300 },
  });
  const cityData = await cityResponse.json();
  const city = cityData.success ? cityData.data : null;
  const cityName = city?.name || 'Phoenix';
  const cityId = city?.id || 31;
  const categoryName = category.name;

  // Fetch category businesses with REAL category ID from database
  const businessResponse = await fetch(
    `${API_BASE}/businesses?cityId=${cityId}&categoryId=${category.id}`,
    { next: { revalidate: 300 } }
  );
  const businessData = await businessResponse.json();
  const businessCount = businessData.success ? businessData.data.length : 0;

  // Generate subcategory names for metadata
  const subcategoryNames = categorySubcategories.map((s: any) => s.name);

  const title = `${categoryName} in ${cityName} | Find Top-Rated ${categoryName} | BuzzGram`;
  const description = `Discover verified ${categoryName.toLowerCase()} businesses in ${cityName}. ${subcategoryNames.join(', ')}. Browse portfolios, read reviews, and request quotes instantly on BuzzGram.`;

  const keywords = [
    `${categoryName} ${cityName}`,
    `${categoryName.toLowerCase()} near me`,
    `best ${categoryName.toLowerCase()} ${cityName}`,
    ...subcategoryNames.map((sub: string) => `${sub} ${cityName}`),
    ...subcategoryNames.map((sub: string) => `${sub.toLowerCase()} near me`),
    `${cityName} ${categorySlug}`,
    `verified ${categoryName} ${cityName}`,
    `top rated ${categoryName} ${cityName}`,
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/city/phoenix/${categorySlug}`,
      siteName: 'BuzzGram',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/city/phoenix/${categorySlug}`,
    },
  };
}

export default async function CategoryLayout({ params, children }: Props) {
  const { category: categorySlug } = await params;

  // Fetch categories from API
  const categoriesResponse = await fetch(`${API_BASE}/categories`, {
    next: { revalidate: 300 },
  });
  const categoriesData = await categoriesResponse.json();
  const category = categoriesData.success
    ? categoriesData.data.find((c: any) => c.slug === categorySlug)
    : null;

  if (!category) {
    return <>{children}</>;
  }

  // Fetch subcategories for this category
  const subcategoriesResponse = await fetch(`${API_BASE}/subcategories`, {
    next: { revalidate: 300 },
  });
  const subcategoriesData = await subcategoriesResponse.json();
  const categorySubcategories = subcategoriesData.success
    ? subcategoriesData.data.filter((s: any) => s.categoryId === category.id)
    : [];

  // Fetch city by slug
  const cityResponse = await fetch(`${API_BASE}/cities/by-slug/phoenix`, {
    next: { revalidate: 300 },
  });
  const cityData = await cityResponse.json();
  const city = cityData.success ? cityData.data : null;
  const cityName = city?.name || 'Phoenix';
  const cityId = city?.id || 31;
  const categoryName = category.name;

  // Fetch category businesses with REAL category ID from database
  const businessResponse = await fetch(
    `${API_BASE}/businesses?cityId=${cityId}&categoryId=${category.id}`,
    { next: { revalidate: 300 } }
  );
  const businessData = await businessResponse.json();
  const businesses = businessData.success ? businessData.data : [];
  const businessCount = businesses.length;

  // Generate subcategory names for FAQs
  const subcategoryNames = categorySubcategories.map((s: any) => s.name);

  // CollectionPage Schema
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/city/phoenix/${categorySlug}`,
    name: `${categoryName} in ${cityName}`,
    description: `Discover verified ${categoryName.toLowerCase()} businesses in ${cityName}`,
    url: `${SITE_URL}/city/phoenix/${categorySlug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: businessCount,
      itemListElement: businesses.slice(0, 20).map((business: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'LocalBusiness',
          '@id': `${SITE_URL}/business/${business.id}`,
          name: business.name,
          description: business.description || `${business.name} - ${categoryName} in ${cityName}`,
          url: `${SITE_URL}/business/${business.id}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: cityName,
            addressRegion: 'AZ',
            addressCountry: 'US',
          },
        },
      })),
    },
  };

  // FAQPage Schema with category-specific questions
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What are the best ${categoryName.toLowerCase()} in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${cityName} features verified ${categoryName.toLowerCase()} businesses on BuzzGram. Browse top-rated options including ${subcategoryNames.join(', ')}. All businesses are verified with active Instagram profiles and instant quote request functionality.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I find ${categoryName.toLowerCase()} near me in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `BuzzGram makes it easy to discover ${categoryName.toLowerCase()} in ${cityName}. Browse verified businesses, filter by subcategory (${subcategoryNames.join(', ')}), view Instagram portfolios, and submit quote requests directly.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I request quotes from ${categoryName.toLowerCase()} on BuzzGram?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! BuzzGram allows you to submit instant quote requests to ${categoryName.toLowerCase()} businesses in ${cityName}. Share your requirements, availability, and budget, and receive responses directly from interested businesses.`,
        },
      },
      {
        '@type': 'Question',
        name: `Are ${categoryName.toLowerCase()} businesses on BuzzGram verified?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `All ${categoryName.toLowerCase()} businesses listed on BuzzGram are verified and actively serving ${cityName}. Each business has an active Instagram presence and verified contact information for your safety and confidence.`,
        },
      },
      {
        '@type': 'Question',
        name: `What types of ${categoryName.toLowerCase()} are available in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${cityName} offers diverse ${categoryName.toLowerCase()} including ${subcategoryNames.join(', ')}. BuzzGram features businesses across all service levels, specialties, and price points to match your needs.`,
        },
      },
      {
        '@type': 'Question',
        name: `How can I view portfolios of ${categoryName.toLowerCase()} businesses?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Every ${categoryName.toLowerCase()} business on BuzzGram includes an Instagram link where you can view their latest work, customer photos, and portfolio. This helps you make informed decisions by seeing real examples before contacting them.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is it free to use BuzzGram for finding ${categoryName.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! BuzzGram is completely free for customers. Browse unlimited ${categoryName.toLowerCase()} businesses in ${cityName}, view Instagram profiles, submit quote requests, and connect with businesses at no cost.`,
        },
      },
      {
        '@type': 'Question',
        name: `How many ${categoryName.toLowerCase()} businesses are on BuzzGram?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `BuzzGram features a growing directory of verified ${categoryName.toLowerCase()} businesses serving ${cityName}. Our directory grows regularly with new verified businesses joining to serve the community.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I start a ${categoryName.toLowerCase()} business from home in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Starting a home-based ${categoryName.toLowerCase()} business in ${cityName} is easier than ever. Focus on building your skills${subcategoryNames.length > 0 ? ` in areas like ${subcategoryNames.slice(0, 3).join(', ')}` : ''}, create an Instagram portfolio showcasing your work, and list your business on BuzzGram to get discovered by local customers. BuzzGram helps home-based and Instagram businesses connect with clients actively searching for ${categoryName.toLowerCase()} services in ${cityName}.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is ${categoryName.toLowerCase()} a profitable side hustle in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! ${categoryName.toLowerCase()} is a popular and profitable side hustle in ${cityName}. Many successful home-based ${categoryName.toLowerCase()} businesses${subcategoryNames.length > 0 ? ` offering ${subcategoryNames.slice(0, 2).join(' and ')}` : ''} operate from home and use Instagram to showcase their work. Listing on BuzzGram gives you instant visibility to ${cityName} customers actively searching for ${categoryName.toLowerCase()} services, helping you grow your client base quickly.`,
        },
      },
      {
        '@type': 'Question',
        name: `Where can I list my ${categoryName.toLowerCase()} business to get more clients in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `BuzzGram is the leading platform for home-based and Instagram ${categoryName.toLowerCase()} businesses in ${cityName}. List your business for free, connect your Instagram profile, and start receiving quote requests from local customers. BuzzGram specializes in promoting home-based businesses${subcategoryNames.length > 0 ? ` like ${subcategoryNames.slice(0, 3).join(', ')}` : ''} to customers actively searching for services in ${cityName}.`,
        },
      },
      {
        '@type': 'Question',
        name: `How can I grow my Instagram ${categoryName.toLowerCase()} business in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Growing your Instagram ${categoryName.toLowerCase()} business starts with visibility. List your business on BuzzGram to reach ${cityName} customers who are ready to book services. BuzzGram integrates directly with your Instagram profile, making it easy for customers to see your portfolio and contact you. With instant quote request features, customers can reach you directly, helping you convert followers into paying clients.`,
        },
      },
      {
        '@type': 'Question',
        name: `What do I need to launch a ${categoryName.toLowerCase()} side hustle?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Launching a ${categoryName.toLowerCase()} side hustle requires three key things: skills in your chosen service${subcategoryNames.length > 0 ? ` (such as ${subcategoryNames.slice(0, 2).join(' or ')})` : ''}, an Instagram portfolio showcasing your work, and a platform to get discovered. BuzzGram provides that platform by connecting home-based ${categoryName.toLowerCase()} businesses with ${cityName} customers actively searching for services. Sign up, create your profile, and start receiving quote requests from local clients.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I get my first clients for my ${categoryName.toLowerCase()} business in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Getting your first clients is easy with BuzzGram. List your ${categoryName.toLowerCase()} business, showcase your Instagram portfolio, and start appearing in search results when ${cityName} customers look for${subcategoryNames.length > 0 ? ` ${subcategoryNames.slice(0, 2).join(' and ')}` : ` ${categoryName.toLowerCase()}`} services. BuzzGram's quote request system connects you directly with customers ready to book, eliminating the challenge of finding your first clients. Many home-based businesses get their first quote requests within days of listing.`,
        },
      },
    ],
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: '${SITE_URL}',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: cityName,
        item: '${SITE_URL}/city/phoenix',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `${SITE_URL}/city/phoenix/${categorySlug}`,
      },
    ],
  };

  // Combine schemas
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [collectionPageSchema, faqSchema, breadcrumbSchema],
  };

  return (
    <>
      {/* Server-rendered JSON-LD structured data */}
      <Script
        id="category-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />
      {children}
    </>
  );
}
