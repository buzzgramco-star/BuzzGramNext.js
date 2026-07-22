import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/homepage/HeroSection';

import QuickValueProps from '@/components/homepage/QuickValueProps';
import BrowseCategories from '@/components/homepage/BrowseCategories';
import FinalCTA from '@/components/homepage/FinalCTA';

// Schema.org Organization structured data for SEO/AEO
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BuzzGram',
  url: 'https://buzzgram.co',
  logo: 'https://buzzgram.co/icon',
  description: 'The first AI-powered platform to connect customers with home-based and Instagram businesses across multiple cities in North America.',
  areaServed: [
    { '@type': 'City', name: 'Toronto', addressRegion: 'ON', addressCountry: 'CA' },
    { '@type': 'City', name: 'Vancouver', addressRegion: 'BC', addressCountry: 'CA' },
    { '@type': 'City', name: 'Montreal', addressRegion: 'QC', addressCountry: 'CA' },
    { '@type': 'City', name: 'Ottawa', addressRegion: 'ON', addressCountry: 'CA' },
    { '@type': 'City', name: 'Calgary', addressRegion: 'AB', addressCountry: 'CA' },
    { '@type': 'City', name: 'New York', addressRegion: 'NY', addressCountry: 'US' },
    { '@type': 'City', name: 'Chicago', addressRegion: 'IL', addressCountry: 'US' },
    { '@type': 'City', name: 'Los Angeles', addressRegion: 'CA', addressCountry: 'US' },
    { '@type': 'City', name: 'Miami', addressRegion: 'FL', addressCountry: 'US' },
    { '@type': 'City', name: 'Phoenix', addressRegion: 'AZ', addressCountry: 'US' },
  ],
  serviceType: ['Beauty Services', 'Food Services', 'Event Services'],
  sameAs: ['https://www.instagram.com/buzzgram'],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BuzzGram',
  url: 'https://buzzgram.co',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://buzzgram.co/city/toronto?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default async function HomePage() {
  return (
    <>
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />

      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>

      <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
        {/* 1. Hero — AI chat front and center: the problem and the solution, live */}
        <HeroSection />

        {/* 2. OneQuote slim banner */}
        <QuickValueProps />

        {/* 3. Browse by category */}
        <BrowseCategories />

        {/* 4. Final CTA */}
        <FinalCTA />

        <Footer />
      </div>
    </>
  );
}
