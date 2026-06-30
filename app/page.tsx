import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/homepage/HeroSection';
import HowItWorks from '@/components/homepage/HowItWorks';
import WhyBuzzGram from '@/components/homepage/WhyBuzzGram';
import QuickValueProps from '@/components/homepage/QuickValueProps';
import BrowseCategories from '@/components/homepage/BrowseCategories';
import FinalCTA from '@/components/homepage/FinalCTA';

// Force dynamic rendering for IP-based city detection
export const dynamic = 'force-dynamic';

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
        {/* 1. Hero — AI chat front and center */}
        <HeroSection detectedCity="toronto" />

        {/* 2. How it works — 3 steps */}
        <HowItWorks />

        {/* 3. Platform overview — what BuzzGram is */}
        <WhyBuzzGram />

        {/* 4. OneQuote slim banner */}
        <QuickValueProps />

        {/* 5. Browse by category */}
        <BrowseCategories />

        {/* 6. Final CTA */}
        <FinalCTA />

        <Footer />
      </div>
    </>
  );
}
