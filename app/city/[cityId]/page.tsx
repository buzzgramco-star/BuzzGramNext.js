"use client";

import { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getBusinesses, getCategories, getCities, getSubcategories } from '@/lib/api';
import BusinessCard from '@/components/BusinessCard';
import CategoryFilter from '@/components/CategoryFilter';
import SubcategoryFilter from '@/components/SubcategoryFilter';
import LoadingSpinner from '@/components/LoadingSpinner';
import PromotionalBanner from '@/components/PromotionalBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CityPage() {
  const params = useParams<{ cityId: string }>();
  const cityId = params?.cityId;
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Get search term from URL params
  const searchTerm = searchParams?.get('search') || '';

  const { data: city } = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
    select: (cities) => cities.find((c) => c.id === Number(cityId)),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories'],
    queryFn: getSubcategories,
  });

  const { data: businesses, isLoading: businessesLoading, error } = useQuery({
    queryKey: ['businesses', cityId],
    queryFn: () => getBusinesses({ cityId: Number(cityId) }),
    enabled: !!cityId,
  });

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory(null);
  }, [selectedCategory]);

  // Reset showAll when filters change
  useEffect(() => {
    setShowAll(false);
  }, [selectedCategory, selectedSubcategory, searchTerm]);

  // Filter subcategories based on selected category
  const filteredSubcategories = useMemo(() => {
    if (!subcategories || !selectedCategory) return [];
    return subcategories.filter((subcategory) => subcategory.categoryId === selectedCategory);
  }, [subcategories, selectedCategory]);

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return [];

    return businesses.filter((business) => {
      const matchesCategory = !selectedCategory || business.categoryId === selectedCategory;
      const matchesSubcategory = !selectedSubcategory || business.subcategoryId === selectedSubcategory;
      const matchesSearch =
        !searchTerm ||
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (business.description && business.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesSubcategory && matchesSearch;
    });
  }, [businesses, selectedCategory, selectedSubcategory, searchTerm]);

  // Determine how many businesses to show initially
  const shouldShowLoadMore = !selectedSubcategory && !searchTerm;
  const initialLimit = typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 20;
  const displayedBusinesses = shouldShowLoadMore && !showAll
    ? filteredBusinesses.slice(0, initialLimit)
    : filteredBusinesses;
  const hasMoreToShow = shouldShowLoadMore && filteredBusinesses.length > initialLimit;

  if (businessesLoading || categoriesLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Businesses
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {error instanceof Error ? error.message : 'An error occurred'}
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

      {/* SEO Content Section - ONLY FOR TORONTO */}
      {cityId === '36' && city && (
        <div className="w-full md:max-w-7xl md:mx-auto px-2 md:px-6 lg:px-8 py-6">
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/10 dark:to-pink-900/10 rounded-xl p-6 border border-orange-100 dark:border-orange-900/30">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {selectedCategory
                ? `${categories?.find(c => c.id === selectedCategory)?.name} in ${city.name}`
                : `Discover Local Businesses in ${city.name}`
              }
            </h1>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {selectedCategory
                ? `Find verified ${categories?.find(c => c.id === selectedCategory)?.name.toLowerCase()} businesses in ${city.name}. Browse ${filteredBusinesses.length} local businesses, read authentic reviews, and connect instantly with top-rated services.`
                : `Welcome to ${city.name}'s premier local business directory. Discover ${filteredBusinesses.length} verified businesses across beauty, food, and events. Connect with trusted local services, compare options, and book instantly.`
              }
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
        <div className="w-full md:max-w-7xl md:mx-auto px-2 md:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6">
            {/* Search Bar - Mobile Only */}
            <div className="relative md:hidden">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams?.toString() || '');
                  if (e.target.value) {
                    newParams.set('search', e.target.value);
                  } else {
                    newParams.delete('search');
                  }
                  window.history.replaceState({}, '', `?${newParams.toString()}`);
                }}
                className="w-full px-4 py-3 pl-11 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Pills */}
            {categories && (
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}

            {/* Subcategory Pills */}
            {selectedCategory && filteredSubcategories.length > 0 && (
              <SubcategoryFilter
                subcategories={filteredSubcategories}
                selectedSubcategory={selectedSubcategory}
                onSelectSubcategory={setSelectedSubcategory}
              />
            )}
          </div>
        </div>
      </div>

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
              {searchTerm || selectedCategory || selectedSubcategory
                ? 'Try adjusting your search or filters'
                : 'No businesses are available in this city yet'}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
    </>
  );
}
