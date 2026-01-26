import { Metadata } from 'next';
import Script from 'next/script';

type Props = {
  params: Promise<{ category: string }>;
  children: React.ReactNode;
};

const API_BASE = 'https://backend-production-f30d.up.railway.app/api';

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
  const cityResponse = await fetch(`${API_BASE}/cities/by-slug/montreal`, {
    next: { revalidate: 300 },
  });
  const cityData = await cityResponse.json();
  const city = cityData.success ? cityData.data : null;
  const cityName = city?.name || 'Montreal';
  const cityId = city?.id || 37;
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
      url: `https://buzz-gram-next-js.vercel.app/city/montreal/${categorySlug}`,
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
      canonical: `https://buzz-gram-next-js.vercel.app/city/montreal/${categorySlug}`,
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
  const cityResponse = await fetch(`${API_BASE}/cities/by-slug/montreal`, {
    next: { revalidate: 300 },
  });
  const cityData = await cityResponse.json();
  const city = cityData.success ? cityData.data : null;
  const cityName = city?.name || 'Montreal';
  const cityId = city?.id || 37;
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
    '@id': `https://buzz-gram-next-js.vercel.app/city/montreal/${categorySlug}`,
    name: `${categoryName} in ${cityName}`,
    description: `Discover verified ${categoryName.toLowerCase()} businesses in ${cityName}`,
    url: `https://buzz-gram-next-js.vercel.app/city/montreal/${categorySlug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: businessCount,
      itemListElement: businesses.slice(0, 20).map((business: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'LocalBusiness',
          '@id': `https://buzz-gram-next-js.vercel.app/business/${business.id}`,
          name: business.name,
          description: business.description || `${business.name} - ${categoryName} in ${cityName}`,
          url: `https://buzz-gram-next-js.vercel.app/business/${business.id}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: cityName,
            addressRegion: 'QC',
            addressCountry: 'CA',
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
        item: 'https://buzz-gram-next-js.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: cityName,
        item: 'https://buzz-gram-next-js.vercel.app/city/montreal',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `https://buzz-gram-next-js.vercel.app/city/montreal/${categorySlug}`,
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
