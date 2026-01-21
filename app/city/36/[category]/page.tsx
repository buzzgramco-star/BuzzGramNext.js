'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getBusinesses, getCategories, getSubcategories } from '@/lib/api';
import BusinessCard from '@/components/BusinessCard';
import SubcategoryFilter from '@/components/SubcategoryFilter';
import LoadingSpinner from '@/components/LoadingSpinner';
import PromotionalBanner from '@/components/PromotionalBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Category slug to ID mapping
const CATEGORY_SLUGS: Record<string, number> = {
  beauty: 1,
  food: 2,
  events: 3,
};

const CATEGORY_NAMES: Record<string, string> = {
  beauty: 'Beauty Services',
  food: 'Food Services',
  events: 'Event Services',
};

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const categorySlug = params?.category;
  const categoryId = categorySlug ? CATEGORY_SLUGS[categorySlug] : null;
  const categoryName = categorySlug ? CATEGORY_NAMES[categorySlug] : null;

  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories'],
    queryFn: getSubcategories,
  });

  const { data: businesses, isLoading: businessesLoading, error } = useQuery({
    queryKey: ['businesses', 36, categoryId],
    queryFn: () => getBusinesses({ cityId: 36, categoryId: categoryId! }),
    enabled: !!categoryId,
  });

  // Reset showAll when subcategory filter changes
  useEffect(() => {
    setShowAll(false);
  }, [selectedSubcategory]);

  // Filter subcategories for this category
  const filteredSubcategories = useMemo(() => {
    if (!subcategories || !categoryId) return [];
    return subcategories.filter((sub) => sub.categoryId === categoryId);
  }, [subcategories, categoryId]);

  // Filter businesses by subcategory
  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];
    if (!selectedSubcategory) return businesses;
    return businesses.filter((business) => business.subcategoryId === selectedSubcategory);
  }, [businesses, selectedSubcategory]);

  // Pagination logic
  const initialLimit = typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 20;
  const displayedBusinesses = !selectedSubcategory && !showAll
    ? filteredBusinesses.slice(0, initialLimit)
    : filteredBusinesses;
  const hasMoreToShow = !selectedSubcategory && filteredBusinesses.length > initialLimit;

  if (businessesLoading) return <LoadingSpinner />;

  if (error || !categoryId || !categoryName) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            {!categoryId ? 'Category Not Found' : 'Error Loading Businesses'}
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {!categoryId
              ? 'The category you are looking for does not exist.'
              : error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {selectedSubcategory
                ? `${subcategories?.find((s) => s.id === selectedSubcategory)?.name} in Toronto`
                : `${categoryName} in Toronto`}
            </h1>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {selectedSubcategory
                ? `Find verified ${subcategories?.find((s) => s.id === selectedSubcategory)?.name.toLowerCase()} businesses in Toronto. Browse ${filteredBusinesses.length} local businesses, read authentic reviews, and connect instantly with top-rated services.`
                : `Welcome to Toronto's premier ${categoryName.toLowerCase()} directory. Discover ${filteredBusinesses.length} verified businesses. Connect with trusted local services, compare options, and book instantly.`}
            </p>
          </div>
        </div>

        {/* Filters */}
        {filteredSubcategories.length > 0 && (
          <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
            <div className="w-full md:max-w-7xl md:mx-auto px-2 md:px-6 lg:px-8 py-6 sm:py-8">
              <SubcategoryFilter
                subcategories={filteredSubcategories}
                selectedSubcategory={selectedSubcategory}
                onSelectSubcategory={setSelectedSubcategory}
              />
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="w-full md:max-w-7xl md:mx-auto px-2 md:px-6 lg:px-8 py-10 flex-grow">
          {filteredBusinesses.length > 0 ? (
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
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {selectedSubcategory
                  ? 'Try selecting a different subcategory'
                  : 'No businesses are available in this category yet'}
              </p>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
