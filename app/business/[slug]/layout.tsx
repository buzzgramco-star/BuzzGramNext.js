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

  if (!business) {
    return {
      title: 'Business Not Found | BuzzGram',
    };
  }

  const cityName = business.city?.name || '';
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

  // FAQ Schema - Customer-focused
  const categoryName = business.category?.name || 'service';
  const subcategoryName = business.subcategory?.name || '';

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What services does ${business.name} offer?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: business.description
            ? `${business.name} offers ${business.description}${subcategoryName ? ` They specialize in ${subcategoryName.toLowerCase()} services in ${cityName}.` : ''} You can view their portfolio on Instagram ${business.instagramHandle ? `@${business.instagramHandle}` : ''} and request a quote directly through BuzzGram.`
            : `${business.name} is a ${categoryName.toLowerCase()} business${subcategoryName ? ` specializing in ${subcategoryName.toLowerCase()}` : ''} serving ${cityName}. Connect with them through BuzzGram to learn more about their services and request a personalized quote.`,
        },
      },
      {
        '@type': 'Question',
        name: `How can I contact ${business.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can contact ${business.name} through BuzzGram by submitting a quote request on their profile page. ${business.instagramHandle ? `You can also reach them on Instagram @${business.instagramHandle}.` : ''} BuzzGram makes it easy to connect with local ${categoryName.toLowerCase()} businesses and get responses directly from service providers.`,
        },
      },
      {
        '@type': 'Question',
        name: `Does ${business.name} serve ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, ${business.name} is a verified ${categoryName.toLowerCase()} business serving ${cityName} and surrounding areas. They are listed on BuzzGram's local business directory and available for quote requests from ${cityName} residents.`,
        },
      },
      {
        '@type': 'Question',
        name: `What makes ${business.name} a good choice for ${subcategoryName || categoryName} services?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${business.name} is a verified local business on BuzzGram${subcategoryName ? ` specializing in ${subcategoryName.toLowerCase()}` : ''} in ${cityName}. ${business.instagramHandle ? `They showcase their work on Instagram @${business.instagramHandle} where you can see their portfolio and customer results.` : ''} As a home-based and Instagram business, they offer personalized service and direct communication with clients.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I request a quote from ${business.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Requesting a quote from ${business.name} is simple on BuzzGram. Visit their business profile, click the quote request button, fill in your service needs and availability, and ${business.name} will respond directly. BuzzGram connects you instantly with local ${categoryName.toLowerCase()} businesses in ${cityName}.`,
        },
      },
    ],
  };

  // Combine schemas
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [localBusinessSchema, breadcrumbSchema, faqSchema],
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
