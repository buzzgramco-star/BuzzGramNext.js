import { Suspense } from 'react';
import { headers } from 'next/headers';
import { getCities, getCategories, getSubcategories } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/homepage/HeroSection';
import QuickValueProps from '@/components/homepage/QuickValueProps';
import CategoryShowcase from '@/components/homepage/CategoryShowcase';
import CitiesGridMatrix from '@/components/homepage/CitiesGridMatrix';
import FinalCTA from '@/components/homepage/FinalCTA';

// Force dynamic rendering for IP-based city detection
export const dynamic = 'force-dynamic';

// Server Component - SSR for SEO
export default async function HomePage() {
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

    return (
      <>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>

        <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
          {/* Hero Section - Search + Category buttons */}
          <HeroSection detectedCity={detectedCity} />

          {/* Quick Value Props - 4 short points */}
          <QuickValueProps />

          {/* Category Showcase - 3 cards with subcategories */}
          {categories && categories.length > 0 && subcategories && (
            <CategoryShowcase
              categories={categories}
              subcategories={subcategories}
              detectedCity={detectedCity}
            />
          )}

          {/* Cities Grid - Booksy style matrix */}
          {cities && cities.length > 0 && categories && subcategories && (
            <CitiesGridMatrix
              cities={cities}
              categories={categories}
              subcategories={subcategories}
            />
          )}

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
