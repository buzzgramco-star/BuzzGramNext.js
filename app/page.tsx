import { Suspense } from 'react';
import { getCities, getCategories, getSubcategories } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/homepage/HeroSection';
import HowItWorks from '@/components/homepage/HowItWorks';
import CategoryShowcase from '@/components/homepage/CategoryShowcase';
import CitiesGridMatrix from '@/components/homepage/CitiesGridMatrix';
import WhyBuzzGram from '@/components/homepage/WhyBuzzGram';
import FinalCTA from '@/components/homepage/FinalCTA';

// Server Component - SSR for SEO
export default async function HomePage() {
  try {
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
          {/* Hero Section - Split columns with OneQuote */}
          <HeroSection />

          {/* How It Works - Visual steps */}
          <HowItWorks />

          {/* Category Showcase - 3 cards with subcategories */}
          {categories && categories.length > 0 && subcategories && (
            <CategoryShowcase categories={categories} subcategories={subcategories} />
          )}

          {/* Cities Grid - Booksy style matrix */}
          {cities && cities.length > 0 && categories && subcategories && (
            <CitiesGridMatrix
              cities={cities}
              categories={categories}
              subcategories={subcategories}
            />
          )}

          {/* Why BuzzGram - Benefits */}
          <WhyBuzzGram />

          {/* Final CTA - Big call to action */}
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
