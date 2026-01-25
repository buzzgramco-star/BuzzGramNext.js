import Script from 'next/script';

export function HomepageStructuredData() {
  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BuzzGram',
    url: 'https://buzz-gram-next-js.vercel.app',
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
    url: 'https://buzz-gram-next-js.vercel.app',
    description: 'Discover verified local businesses in Toronto',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://buzz-gram-next-js.vercel.app/city/toronto?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // Combine schemas
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema, websiteSchema],
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
