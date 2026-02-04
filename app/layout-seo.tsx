import Script from 'next/script';

export function HomepageStructuredData() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buzzgram.co';

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BuzzGram',
    url: SITE_URL,
    description:
      "Toronto's premier local business directory connecting customers with verified beauty, food, and event services.",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Toronto',
      addressRegion: 'ON',
      addressCountry: 'CA',
    },
    areaServed: {
      '@type': 'City',
      name: 'Toronto',
      '@id': 'https://en.wikipedia.org/wiki/Toronto',
    },
    knowsAbout: [
      'Beauty Services',
      'Nail Salons',
      'Lash Extensions',
      'Makeup Artists',
      'Hair Salons',
      'Food Services',
      'Bakeries',
      'Catering Services',
      'Private Chefs',
      'Event Services',
      'Event Planning',
      'Event Decor',
      'Wedding Photography',
      'Local Business Directory',
      'Toronto Businesses',
    ],
  };

  // WebSite Schema with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BuzzGram',
    url: SITE_URL,
    description: 'Discover verified local businesses in Toronto',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/city/toronto?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // FAQ Schema - Platform-focused for entrepreneurs
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I list my home-based business on BuzzGram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Listing your home-based business on BuzzGram is simple and free. Sign up, create your business profile, connect your Instagram account, and start receiving quote requests from local customers across 10 major cities in the USA and Canada. BuzzGram specializes in promoting home-based and Instagram businesses in beauty, food, and events categories.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is BuzzGram good for side hustles and Instagram businesses?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! BuzzGram is designed specifically for home-based and Instagram businesses. Whether you run a nail salon from home, bake custom cakes, or offer event planning services, BuzzGram connects you with customers actively searching for your services. Many successful side hustles use BuzzGram to grow their client base and turn followers into paying customers.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of businesses can list on BuzzGram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BuzzGram focuses on home-based and Instagram businesses in three main categories: Beauty (nails, lashes, makeup, hair), Food (bakery, catering, private chefs), and Events (planning, decor, photography). If you offer these services from home or primarily through Instagram, BuzzGram is the perfect platform to get discovered by local customers.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does BuzzGram help me get more clients?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BuzzGram helps you get clients through instant quote requests. When customers search for services in your area, your business appears in search results. They can view your Instagram portfolio and submit quote requests directly to you. This eliminates the challenge of finding clients and converts local searchers into paying customers. Many businesses get their first quote requests within days of listing.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need a physical storefront to list on BuzzGram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No! BuzzGram is designed for home-based and Instagram businesses. You do not need a physical storefront. Whether you work from home, travel to clients, or operate entirely through social media, BuzzGram helps you reach local customers who are ready to book your services.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much does it cost to list my business on BuzzGram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Listing your business on BuzzGram is completely free. Create your profile, connect your Instagram, and start receiving quote requests at no cost. BuzzGram believes in supporting home-based and Instagram entrepreneurs by providing a platform to grow without upfront fees.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which cities does BuzzGram serve?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'BuzzGram serves 10 major cities: Toronto, Vancouver, Calgary, Montreal, Ottawa (Canada), and Los Angeles, New York City, Chicago, Miami, Phoenix (USA). Businesses can list in any of these cities and connect with local customers actively searching for beauty, food, and event services.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I integrate my Instagram with BuzzGram?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Instagram integration is a core feature of BuzzGram. Your Instagram handle and profile link are prominently displayed on your business page, making it easy for customers to view your portfolio and see your work. This is perfect for Instagram-based businesses that want to convert followers into paying clients.',
        },
      },
    ],
  };

  // Combine schemas
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema, websiteSchema, faqSchema],
  };

  return (
    <Script
      id="homepage-structured-data"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
    />
  );
}
