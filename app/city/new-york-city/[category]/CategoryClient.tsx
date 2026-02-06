"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Business, Subcategory } from '@/types';
import BusinessCard from '@/components/BusinessCard';
import SubcategoryFilter from '@/components/SubcategoryFilter';
import PromotionalBanner from '@/components/PromotionalBanner';
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { categoryContent } from '@/lib/seoContent';

type Props = {
  citySlug: string;
  categorySlug: string;
  categoryName: string;
  businesses: Business[];
  subcategories: Subcategory[];
  categoryId: number;
};

const CITY_NAMES: Record<string, string> = {
  'toronto': 'Toronto',
  'vancouver': 'Vancouver',
  'calgary': 'Calgary',
  'montreal': 'Montreal',
  'ottawa': 'Ottawa',
  'new-york-city': 'New York City',
  'los-angeles': 'Los Angeles',
  'chicago': 'Chicago',
  'miami': 'Miami',
  'phoenix': 'Phoenix',
};

export default function CategoryClient({ citySlug, categorySlug, categoryName, businesses, subcategories, categoryId }: Props) {
  const router = useRouter();
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Navigate to subcategory page instead of filtering
  const handleSubcategorySelect = (subcategoryId: number | null) => {
    if (subcategoryId === null) {
      // "All" clicked - stay on category page (reload)
      router.push(`/city/${citySlug}/${categorySlug}`);
    } else {
      // Find subcategory slug
      const subcategory = subcategories.find(s => s.id === subcategoryId);
      if (subcategory) {
        router.push(`/city/${citySlug}/${categorySlug}/${subcategory.slug}`);
      }
    }
  };

  // Reset showAll when subcategory filter changes
  useEffect(() => {
    setShowAll(false);
  }, [selectedSubcategory]);

  // Filter subcategories for this category
  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((sub) => sub.categoryId === categoryId);
  }, [subcategories, categoryId]);

  // Filter businesses by subcategory
  const filteredBusinesses = useMemo(() => {
    if (!selectedSubcategory) return businesses;
    return businesses.filter((business) => business.subcategoryId === selectedSubcategory);
  }, [businesses, selectedSubcategory]);

  // Pagination logic
  const initialLimit = typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 20;
  const displayedBusinesses = !selectedSubcategory && !showAll
    ? filteredBusinesses.slice(0, initialLimit)
    : filteredBusinesses;
  const hasMoreToShow = !selectedSubcategory && filteredBusinesses.length > initialLimit;

  const cityName = CITY_NAMES[citySlug] || 'New York City';
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: cityName, href: `/city/${citySlug}` },
    { label: categoryName },
  ];

  const catContent = categoryContent[categorySlug];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
      {/* Promotional Banner */}
      <div className="w-full md:max-w-7xl md:mx-auto px-2 md:px-6 lg:px-8 pt-0 sm:pt-8">
        <PromotionalBanner />
      </div>

      {/* Breadcrumbs & SEO Content */}
      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-4">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {categoryName} in {cityName}
        </h1>

        {catContent && (
          <div className="mb-6 hidden">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {catContent.description}
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              {catContent.content}
            </p>
          </div>
        )}
      </div>


      {/* Filters */}
      {filteredSubcategories.length > 0 && (
        <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
          <div className="w-full md:max-w-7xl md:mx-auto px-2 md:px-6 lg:px-8 py-6 sm:py-8">
            <SubcategoryFilter
              subcategories={filteredSubcategories}
              selectedSubcategory={selectedSubcategory}
              onSelectSubcategory={handleSubcategorySelect}
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
  );
}
