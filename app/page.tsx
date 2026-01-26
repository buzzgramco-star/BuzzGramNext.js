import { Suspense } from 'react';
import { getCities } from '@/lib/api';
import CityGrid from '@/components/CityGrid';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Server Component - SSR for SEO
export default async function HomePage() {
  try {
    const cities = await getCities();

    return (
      <>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
          {/* Hero Section */}
          <div className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-card dark:to-dark-bg border-b border-gray-200 dark:border-dark-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                Discover Local Businesses
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Explore amazing businesses across cities. From beauty salons to restaurants, find your next favorite spot.
              </p>
            </div>
          </div>

          {/* Cities Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Browse by City
            </h2>

            {cities && cities.length > 0 ? (
              <CityGrid cities={cities} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300">No cities available</p>
              </div>
            )}
          </div>

          <Footer />
        </div>
      </>
    );
  } catch (error) {
    console.error('[HomePage] Error fetching cities:', error);
    return (
      <>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Cities
            </h2>
            <p className="text-red-600 dark:text-red-300">
              An error occurred while loading the cities. Please try again later.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
}
