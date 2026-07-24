import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/homepage/HeroSection';

import QuickValueProps from '@/components/homepage/QuickValueProps';
import BrowseCategories from '@/components/homepage/BrowseCategories';
import FinalCTA from '@/components/homepage/FinalCTA';
import AgentModePreview from '@/components/homepage/AgentModePreview';

// Internal-only concept preview (see AgentModePreview.tsx) — not a real
// feature yet, just a scripted look at a proposed "Agent Mode". Flip to
// false (or remove the import + section below) to pull it instantly.
const AGENT_MODE_PREVIEW_ENABLED = true;

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

        {/* 2b. Agent Mode — internal concept preview, not a real feature yet */}
        {AGENT_MODE_PREVIEW_ENABLED && (
          <div className="bg-gray-50 dark:bg-dark-card py-16 sm:py-20 border-t border-gray-100 dark:border-dark-border">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-xs font-semibold tracking-widest uppercase text-orange-600 dark:text-orange-500 mb-3">
                Concept Preview — Not Yet Available
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Agent Mode
              </h2>
              <p className="text-base text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
                An early look at where we're headed: an AI that asks the right questions, plans your event, and drafts vendor quotes for your approval.
              </p>
              <div className="text-left">
                <AgentModePreview />
              </div>
            </div>
          </div>
        )}

        {/* 3. Browse by category */}
        <BrowseCategories />

        {/* 4. Final CTA */}
        <FinalCTA />

        <Footer />
      </div>
    </>
  );
}
