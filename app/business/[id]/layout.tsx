import { Metadata } from 'next';
import Script from 'next/script';

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

// Server-side metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const businessId = params.id;

  // Fetch business data server-side
  const businessResponse = await fetch(
    `https://backend-production-f30d.up.railway.app/api/businesses/${businessId}`,
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
      url: `https://buzz-gram-next-js.vercel.app/business/${businessId}`,
      type: 'business.business',
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
      canonical: `https://buzz-gram-next-js.vercel.app/business/${businessId}`,
    },
  };
}

export default async function BusinessLayout({ params, children }: Props) {
  const businessId = params.id;

  // Fetch business and reviews server-side
  const [businessResponse, reviewsResponse] = await Promise.all([
    fetch(`https://backend-production-f30d.up.railway.app/api/businesses/${businessId}`, {
      next: { revalidate: 300 },
    }),
    fetch(`https://backend-production-f30d.up.railway.app/api/reviews/business/${businessId}`, {
      next: { revalidate: 300 },
    }).catch(() => null), // Reviews might not exist
  ]);

  if (!businessResponse.ok) {
    return <>{children}</>;
  }

  const businessData = await businessResponse.json();
  const business = businessData.success ? businessData.data : null;

  if (!business || business.cityId !== 36) {
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
    '@id': `https://buzz-gram-next-js.vercel.app/business/${businessId}`,
    name: business.name,
    description:
      business.description || `${business.name} - ${business.category?.name} business in ${cityName}`,
    url: `https://buzz-gram-next-js.vercel.app/business/${businessId}`,
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
        item: 'https://buzz-gram-next-js.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: cityName,
        item: 'https://buzz-gram-next-js.vercel.app/city/36',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: business.name,
        item: `https://buzz-gram-next-js.vercel.app/business/${businessId}`,
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
