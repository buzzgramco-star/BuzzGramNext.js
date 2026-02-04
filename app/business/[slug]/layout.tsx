import { Metadata } from 'next';
import Script from 'next/script';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buzzgram.co';

// Server-side metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Fetch business data server-side
  const businessResponse = await fetch(
    `https://backend-production-f30d.up.railway.app/api/businesses/by-slug/${slug}`,
    { next: { revalidate: 300 } } // Cache for 5 minutes
  );

  if (!businessResponse.ok) {
    return {
      title: 'Business Not Found | BuzzGram',
    };
  }

  const businessData = await businessResponse.json();
  const business = businessData.success ? businessData.data : null;

  if (!business || business.cityId !== 36) {
    // Only SEO for Toronto businesses
    return {
      title: business ? `${business.name} | BuzzGram` : 'Business | BuzzGram',
    };
  }

  const cityName = business.city?.name || 'Toronto';
  const categoryName = business.category?.name || '';
  const subcategoryName = business.subcategory?.name || '';

  const title = subcategoryName
    ? `${business.name} - ${subcategoryName} in ${cityName} | BuzzGram`
    : categoryName
    ? `${business.name} - ${categoryName} in ${cityName} | BuzzGram`
    : `${business.name} - ${cityName} | BuzzGram`;

  const description = business.description
    ? `${business.description} Located in ${cityName}. ${subcategoryName ? `Specializing in ${subcategoryName.toLowerCase()}.` : ''} ${business.instagramHandle ? `Follow @${business.instagramHandle} on Instagram.` : ''} Request a quote instantly on BuzzGram.`
    : `${business.name} is a ${categoryName?.toLowerCase()} business in ${cityName}. ${subcategoryName ? `Specializing in ${subcategoryName.toLowerCase()}.` : ''} Connect and request quotes on BuzzGram.`;

  const keywords = [
    business.name,
    subcategoryName,
    categoryName,
    `${subcategoryName} ${cityName}`,
    `${categoryName} ${cityName}`,
    business.instagramHandle,
    'Toronto business',
    'local business Toronto',
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/business/${business.slug}`,
      type: 'website',
      locale: 'en_CA',
      images: business.imageUrl ? [business.imageUrl] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: business.imageUrl ? [business.imageUrl] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/business/${business.slug}`,
    },
  };
}

export default async function BusinessLayout({ params, children }: Props) {
  const { slug } = await params;

  // Fetch business first to get ID for reviews
  const businessResponse = await fetch(
    `https://backend-production-f30d.up.railway.app/api/businesses/by-slug/${slug}`,
    { next: { revalidate: 300 } }
  );

  if (!businessResponse.ok) {
    return <>{children}</>;
  }

  const businessData = await businessResponse.json();
  const business = businessData.success ? businessData.data : null;

  if (!business) {
    return <>{children}</>;
  }

  // Fetch reviews using business ID
  const reviewsResponse = await fetch(
    `https://backend-production-f30d.up.railway.app/api/reviews/business/${business.id}`,
    { next: { revalidate: 300 } }
  ).catch(() => null);

  if (business.cityId !== 36) {
    // Only add schemas for Toronto businesses
    return <>{children}</>;
  }

  const reviewsData = reviewsResponse ? await reviewsResponse.json() : null;
  const reviews = reviewsData?.success ? reviewsData.data : [];

  const cityName = business.city?.name || 'Toronto';

  // Calculate average rating
  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  // LocalBusiness Schema
  const localBusinessSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/business/${business.slug}`,
    name: business.name,
    description:
      business.description || `${business.name} - ${business.category?.name} business in ${cityName}`,
    url: `${SITE_URL}/business/${business.slug}`,
    image: business.imageUrl || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressRegion: 'ON',
      addressCountry: 'CA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      addressCountry: 'CA',
    },
    areaServed: {
      '@type': 'City',
      name: cityName,
    },
    sameAs: business.instagramUrl ? [business.instagramUrl] : undefined,
  };

  // Add aggregate rating if reviews exist
  if (avgRating && reviews.length > 0) {
    localBusinessSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating,
      reviewCount: reviews.length,
      bestRating: '5',
      worstRating: '1',
    };
  }

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: cityName,
        item: `${SITE_URL}/city/toronto`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: business.name,
        item: `${SITE_URL}/business/${business.slug}`,
      },
    ],
  };

  // Combine schemas
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [localBusinessSchema, breadcrumbSchema],
  };

  return (
    <>
      {/* Server-rendered JSON-LD structured data */}
      <Script
        id="business-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />
      {children}
    </>
  );
}
