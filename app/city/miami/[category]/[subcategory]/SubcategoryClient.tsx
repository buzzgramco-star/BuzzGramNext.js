"use client";

import { useState } from 'react';
import Link from 'next/link';
import type { Business } from '@/types';
import BusinessCard from '@/components/BusinessCard';
import PromotionalBanner from '@/components/PromotionalBanner';
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { subcategoryContent } from '@/lib/seoContent';

type Props = {
  businesses: Business[];
  subcategoryName: string;
  categoryName: string;
  citySlug: string;
  categorySlug: string;
  subcategorySlug: string;
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

export default function SubcategoryClient({ businesses, subcategoryName, categoryName, citySlug, categorySlug, subcategorySlug }: Props) {
  const [showAll, setShowAll] = useState(false);

  // Pagination logic
  const initialLimit = typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 20;
  const displayedBusinesses = showAll ? businesses : businesses.slice(0, initialLimit);
  const hasMoreToShow = businesses.length > initialLimit;

  const cityName = CITY_NAMES[citySlug] || 'Miami';
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: cityName, href: `/city/${citySlug}` },
    { label: categoryName, href: `/city/${citySlug}/${categorySlug}` },
    { label: subcategoryName },
  ];

  const subContent = subcategoryContent[subcategorySlug];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
      {/* Promotional Banner */}
      <div className="w-full md:max-w-7xl md:mx-auto px-2 md:px-6 lg:px-8 pt-0 sm:pt-8">
        <PromotionalBanner />
      </div>

      {/* Breadcrumbs & SEO Content */}
      <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-4">
        <Breadcrumbs items={breadcrumbItems} />
        {subContent && (
          <div className="mb-6 hidden">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {subContent.description}
            </p>
            {subContent.benefits && subContent.benefits.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Why Choose Local {subcategoryName}?
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subContent.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <svg className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="w-full md:max-w-7xl md:mx-auto px-2 md:px-6 lg:px-8 py-10 flex-grow">
        {businesses.length > 0 ? (
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
              href={`/city/miami/${categorySlug}`}
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
  );
}
