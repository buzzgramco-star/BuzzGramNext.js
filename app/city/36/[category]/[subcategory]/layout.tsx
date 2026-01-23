import { Metadata } from 'next';
import Script from 'next/script';

type Props = {
  params: Promise<{ category: string; subcategory: string }>;
  children: React.ReactNode;
};

// Subcategory configurations with IDs and parent categories
const SUBCATEGORY_CONFIG: Record<string, Record<string, { id: number; name: string; categoryId: number; categoryName: string }>> = {
  beauty: {
    nails: { id: 1, name: 'Nail Salons', categoryId: 1, categoryName: 'Beauty Services' },
    lashes: { id: 2, name: 'Lash Extensions', categoryId: 1, categoryName: 'Beauty Services' },
    makeup: { id: 3, name: 'Makeup Artists', categoryId: 1, categoryName: 'Beauty Services' },
    hair: { id: 4, name: 'Hair Salons', categoryId: 1, categoryName: 'Beauty Services' },
  },
  food: {
    bakery: { id: 5, name: 'Bakery', categoryId: 2, categoryName: 'Food Services' },
    catering: { id: 6, name: 'Catering Services', categoryId: 2, categoryName: 'Food Services' },
    chefs: { id: 7, name: 'Private Chefs', categoryId: 2, categoryName: 'Food Services' },
  },
  events: {
    planning: { id: 8, name: 'Event Planning', categoryId: 3, categoryName: 'Event Services' },
    decor: { id: 9, name: 'Event Decor', categoryId: 3, categoryName: 'Event Services' },
    photography: { id: 10, name: 'Wedding Photography', categoryId: 3, categoryName: 'Event Services' },
  },
};

// Server-side metadata generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;

  // Validate category and subcategory
  const subcategoryConfig = SUBCATEGORY_CONFIG[categorySlug]?.[subcategorySlug];
  if (!subcategoryConfig) {
    return {
      title: 'Subcategory Not Found | BuzzGram',
    };
  }

  const cityName = 'Toronto';
  const subcategoryName = subcategoryConfig.name;
  const categoryName = subcategoryConfig.categoryName;

  // Fetch subcategory businesses
  const businessResponse = await fetch(
    `https://backend-production-f30d.up.railway.app/api/businesses?cityId=36&categoryId=${subcategoryConfig.categoryId}&subcategoryId=${subcategoryConfig.id}`,
    { next: { revalidate: 300 } }
  );
  const businessData = await businessResponse.json();
  const businessCount = businessData.success ? businessData.data.length : 0;

  const title = `${subcategoryName} in ${cityName} | Find Top-Rated ${subcategoryName} | BuzzGram`;
  const description = `Discover verified ${subcategoryName.toLowerCase()} in ${cityName}. Browse portfolios, read reviews, and request quotes instantly from top-rated ${subcategoryName.toLowerCase()} on BuzzGram.`;

  const keywords = [
    `${subcategoryName} ${cityName}`,
    `${subcategoryName.toLowerCase()} near me`,
    `best ${subcategoryName.toLowerCase()} ${cityName}`,
    `${cityName} ${subcategoryName.toLowerCase()}`,
    `top rated ${subcategoryName.toLowerCase()} ${cityName}`,
    `verified ${subcategoryName.toLowerCase()} ${cityName}`,
    `${subcategoryName.toLowerCase()} ${cityName} reviews`,
    `${subcategoryName.toLowerCase()} ${cityName} prices`,
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://buzz-gram-next-js.vercel.app/city/36/${categorySlug}/${subcategorySlug}`,
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
      canonical: `https://buzz-gram-next-js.vercel.app/city/36/${categorySlug}/${subcategorySlug}`,
    },
  };
}

export default async function SubcategoryLayout({ params, children }: Props) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;

  // Validate category and subcategory
  const subcategoryConfig = SUBCATEGORY_CONFIG[categorySlug]?.[subcategorySlug];
  if (!subcategoryConfig) {
    return <>{children}</>;
  }

  const cityName = 'Toronto';
  const subcategoryName = subcategoryConfig.name;
  const categoryName = subcategoryConfig.categoryName;

  // Fetch subcategory businesses
  const businessResponse = await fetch(
    `https://backend-production-f30d.up.railway.app/api/businesses?cityId=36&categoryId=${subcategoryConfig.categoryId}&subcategoryId=${subcategoryConfig.id}`,
    { next: { revalidate: 300 } }
  );
  const businessData = await businessResponse.json();
  const businesses = businessData.success ? businessData.data : [];
  const businessCount = businesses.length;

  // CollectionPage Schema
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `https://buzz-gram-next-js.vercel.app/city/36/${categorySlug}/${subcategorySlug}`,
    name: `${subcategoryName} in ${cityName}`,
    description: `Discover verified ${subcategoryName.toLowerCase()} in ${cityName}`,
    url: `https://buzz-gram-next-js.vercel.app/city/36/${categorySlug}/${subcategorySlug}`,
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
          description: business.description || `${business.name} - ${subcategoryName} in ${cityName}`,
          url: `https://buzz-gram-next-js.vercel.app/business/${business.id}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: cityName,
            addressRegion: 'ON',
            addressCountry: 'CA',
          },
        },
      })),
    },
  };

  // FAQPage Schema with subcategory-specific questions
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What are the best ${subcategoryName.toLowerCase()} in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${cityName} features verified ${subcategoryName.toLowerCase()} on BuzzGram. All businesses are verified with active Instagram profiles, authentic reviews, and instant quote request functionality. Browse portfolios to find the perfect match for your needs.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I find ${subcategoryName.toLowerCase()} near me in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `BuzzGram makes it easy to discover ${subcategoryName.toLowerCase()} in ${cityName}. Browse verified businesses, view Instagram portfolios with real work examples, read customer reviews, and submit quote requests directly to businesses that match your requirements.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I request quotes from ${subcategoryName.toLowerCase()} on BuzzGram?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! BuzzGram allows you to submit instant quote requests to ${subcategoryName.toLowerCase()} in ${cityName}. Share your requirements, budget, and availability, and receive responses directly from interested businesses. It's completely free for customers.`,
        },
      },
      {
        '@type': 'Question',
        name: `Are ${subcategoryName.toLowerCase()} on BuzzGram verified?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `All ${subcategoryName.toLowerCase()} listed on BuzzGram are verified and actively serving ${cityName}. Each business has an active Instagram presence, verified contact information, and authentic customer reviews for your confidence and safety.`,
        },
      },
      {
        '@type': 'Question',
        name: `How can I view portfolios of ${subcategoryName.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Every ${subcategoryName.toLowerCase()} business on BuzzGram includes an Instagram link where you can view their latest work, customer photos, before-and-after transformations, and portfolio. This helps you make informed decisions by seeing real examples of their services.`,
        },
      },
      {
        '@type': 'Question',
        name: `What should I look for when choosing ${subcategoryName.toLowerCase()} in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `When choosing ${subcategoryName.toLowerCase()} in ${cityName}, review their Instagram portfolio for work quality, read customer reviews for service experience, check their specializations match your needs, and compare quotes from multiple businesses to find the best fit for your budget.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is it free to use BuzzGram for finding ${subcategoryName.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! BuzzGram is completely free for customers. Browse unlimited ${subcategoryName.toLowerCase()} in ${cityName}, view Instagram profiles, read reviews, submit quote requests, and connect with businesses at no cost. We're committed to making local business discovery accessible.`,
        },
      },
      {
        '@type': 'Question',
        name: `How quickly will I get responses from ${subcategoryName.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Response times vary by business, but most ${subcategoryName.toLowerCase()} on BuzzGram respond within 24-48 hours. You'll receive responses directly via email and can compare quotes from multiple businesses to choose the best option for your needs.`,
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
        item: 'https://buzz-gram-next-js.vercel.app/city/36',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `https://buzz-gram-next-js.vercel.app/city/36/${categorySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: subcategoryName,
        item: `https://buzz-gram-next-js.vercel.app/city/36/${categorySlug}/${subcategorySlug}`,
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
        id="subcategory-structured-data"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />
      {children}
    </>
  );
}
