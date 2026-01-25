'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getBusinesses } from '@/lib/api';
import BusinessCard from '@/components/BusinessCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import PromotionalBanner from '@/components/PromotionalBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

// Subcategory configuration matching layout.tsx
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

export default function SubcategoryPage() {
  const params = useParams<{ category: string; subcategory: string }>();
  const categorySlug = params?.category;
  const subcategorySlug = params?.subcategory;

  const subcategoryConfig = categorySlug && subcategorySlug ? SUBCATEGORY_CONFIG[categorySlug]?.[subcategorySlug] : null;
  const [showAll, setShowAll] = useState(false);

  const { data: businesses, isLoading, error } = useQuery({
    queryKey: ['businesses', 36, subcategoryConfig?.categoryId, subcategoryConfig?.id],
    queryFn: () => getBusinesses({
      cityId: 36,
      categoryId: subcategoryConfig!.categoryId,
      subcategoryId: subcategoryConfig!.id
    }),
    enabled: !!subcategoryConfig,
  });

  // Pagination logic
  const initialLimit = typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 20;
  const displayedBusinesses = showAll || !businesses
    ? businesses || []
    : businesses.slice(0, initialLimit);
  const hasMoreToShow = businesses && businesses.length > initialLimit;

  if (isLoading) return <LoadingSpinner />;

  if (error || !subcategoryConfig) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            {!subcategoryConfig ? 'Subcategory Not Found' : 'Error Loading Businesses'}
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {!subcategoryConfig
              ? 'The subcategory you are looking for does not exist.'
              : error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  const subcategoryName = subcategoryConfig.name;
  const categoryName = subcategoryConfig.categoryName;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
        {/* Promotional Banner */}
        <div className="w-full md:max-w-7xl md:mx-auto px-2 md:px-6 lg:px-8 pt-0 sm:pt-8">
          <PromotionalBanner />
        </div>

        {/* Hero Section */}
        <div className="w-full md:max-w-7xl md:mx-auto px-2 md:px-6 lg:px-8 py-6">
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/10 dark:to-pink-900/10 rounded-xl p-6 border border-orange-100 dark:border-orange-900/30">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <Link href="/city/36" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                Toronto
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link
                href={`/city/toronto/${categorySlug}`}
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {categoryName}
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 dark:text-white font-medium">{subcategoryName}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {subcategoryName} in Toronto
            </h1>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Discover verified {subcategoryName.toLowerCase()} in Toronto. Browse portfolios, read authentic reviews, and connect instantly with top-rated professionals.
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="w-full md:max-w-7xl md:mx-auto px-2 md:px-6 lg:px-8 py-10 flex-grow">
          {businesses && businesses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
                {displayedBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMoreToShow && !showAll && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="px-8 py-3 bg-white dark:bg-dark-card border-2 border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No businesses found
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 mb-6">
                No {subcategoryName.toLowerCase()} are available yet. Check back soon!
              </p>
              <Link
                href={`/city/toronto/${categorySlug}`}
                className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Browse All {categoryName}
              </Link>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
