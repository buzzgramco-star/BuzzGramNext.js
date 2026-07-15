import { Suspense } from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { getCities, getCategories, getSubcategories } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/homepage/HeroSection';
import QuickValueProps from '@/components/homepage/QuickValueProps';
import CategoryShowcase from '@/components/homepage/CategoryShowcase';
import CitiesGridMatrix from '@/components/homepage/CitiesGridMatrix';
import FAQ from '@/components/homepage/FAQ';
import FinalCTA from '@/components/homepage/FinalCTA';

// Force dynamic rendering for IP-based city detection
export const dynamic = 'force-dynamic';

// Homepage-only pause ahead of launch (Jul 2026). Every other route (city
// pages, business pages, /for-businesses, /business-signup, login,
// dashboards) is completely unaffected — only this file's content changes.
// Flip back to false to restore the full homepage instantly, no other
// changes needed.
const COMING_SOON = true;

export const metadata: Metadata = COMING_SOON ? {
  title: 'BuzzGram — Launching Soon',
  description: 'BuzzGram is putting the finishing touches on an AI that helps you find the best home-based and Instagram-only businesses in your city. Launching soon.',
} : {};

function ComingSoonPage() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>
      <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-xl text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-xs font-semibold tracking-wide uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Launching soon
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight leading-tight">
              Something&apos;s cooking.
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              We&apos;re putting the finishing touches on BuzzGram — an AI that helps you find the
              best home-based and Instagram-only businesses in your city. Check back soon.
            </p>
            <Link
              href="/for-businesses"
              className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Are you a business owner? List free before we launch →
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

// Server Component - SSR for SEO
export default async function HomePage() {
  if (COMING_SOON) return <ComingSoonPage />;

  try {
    // Get detected city from middleware
    const headersList = await headers();
    const detectedCity = headersList.get('x-detected-city') || 'toronto';

    // Fetch all data in parallel
    const [cities, categories, subcategories] = await Promise.all([
      getCities(),
      getCategories(),
      getSubcategories(),
    ]);

    // Schema.org Organization structured data for SEO/AEO
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'BuzzGram',
      url: 'https://buzzgram.co',
      logo: 'https://buzzgram.co/icon',
      description: 'The first platform to connect customers with home-based and Instagram businesses across multiple cities in North America.',
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
      serviceType: [
        'Beauty Services',
        'Food Services',
        'Event Services',
      ],
      sameAs: [
        'https://www.instagram.com/buzzgram',
      ],
    };

    // Schema.org WebSite structured data for sitelinks search box
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

    return (
      <>
        {/* Structured Data for SEO/AEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>

        <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
          {/* Hero Section - Search + Category buttons */}
          <HeroSection detectedCity={detectedCity} />

          {/* Category Showcase - 3 cards with subcategories */}
          {categories && categories.length > 0 && subcategories && (
            <CategoryShowcase
              categories={categories}
              subcategories={subcategories}
              detectedCity={detectedCity}
            />
          )}

          {/* OneQuote Value Proposition */}
          <QuickValueProps />

          {/* Cities Grid - Booksy style matrix */}
          <div id="cities-grid" className="scroll-mt-20">
            {cities && cities.length > 0 && categories && subcategories && (
              <CitiesGridMatrix
                cities={cities}
                categories={categories}
                subcategories={subcategories}
              />
            )}
          </div>

          {/* FAQ Section - SEO/AEO optimization */}
          <FAQ />

          {/* Final CTA - Simple call to action */}
          <FinalCTA />

          <Footer />
        </div>
      </>
    );
  } catch (error) {
    console.error('[HomePage] Error fetching data:', error);
    return (
      <>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Page
            </h2>
            <p className="text-red-600 dark:text-red-300">
              An error occurred while loading the homepage. Please try again later.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
}
