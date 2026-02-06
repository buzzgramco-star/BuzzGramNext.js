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
  const cityResponse = await fetch(`${API_BASE}/cities/by-slug/los-angeles`, {
    next: { revalidate: 300 },
  });
  const cityData = await cityResponse.json();
  const city = cityData.success ? cityData.data : null;
  const cityName = city?.name || 'Los Angeles';
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
      url: `${SITE_URL}/city/los-angeles/${categorySlug}`,
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
      canonical: `${SITE_URL}/city/los-angeles/${categorySlug}`,
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
  const cityResponse = await fetch(`${API_BASE}/cities/by-slug/los-angeles`, {
    next: { revalidate: 300 },
  });
  const cityData = await cityResponse.json();
  const city = cityData.success ? cityData.data : null;
  const cityName = city?.name || 'Los Angeles';
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
    '@id': `${SITE_URL}/city/los-angeles/${categorySlug}`,
    name: `${categoryName} in ${cityName}`,
    description: `Discover verified ${categoryName.toLowerCase()} businesses in ${cityName}`,
    url: `${SITE_URL}/city/los-angeles/${categorySlug}`,
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
            addressRegion: 'CA',
            addressCountry: 'US',
          },
        },
      })),
    },
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
        item: `${SITE_URL}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: cityName,
        item: `${SITE_URL}/city/los-angeles`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `${SITE_URL}/city/los-angeles/${categorySlug}`,
      },
    ],
  };

  // Combine schemas
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [collectionPageSchema, breadcrumbSchema],
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
