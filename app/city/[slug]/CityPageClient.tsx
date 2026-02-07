"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { City, Category, Subcategory, Business } from '@/types';
import BusinessCard from '@/components/BusinessCard';
import CategoryFilter from '@/components/CategoryFilter';
import SubcategoryFilter from '@/components/SubcategoryFilter';
import PromotionalBanner from '@/components/PromotionalBanner';
import Breadcrumbs, { BreadcrumbItem } from '@/components/Breadcrumbs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cityContent } from '@/lib/seoContent';

type Props = {
  city: City;
  businesses: Business[];
  categories: Category[];
  subcategories: Subcategory[];
  searchTerm: string;
};

export default function CityPageClient({ city, businesses, categories, subcategories, searchTerm: initialSearchTerm }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // Navigate to category page instead of filtering
  const handleCategorySelect = (categoryId: number | null) => {
    if (categoryId === null) {
      // "All" clicked - go back to city page
      const search = searchParams?.get('search');
      router.push(`/city/${city.slug}${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    } else {
      // Find category slug
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        const search = searchParams?.get('search');
        router.push(`/city/${city.slug}/${category.slug}${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      }
    }
  };

  // Navigate to subcategory page instead of filtering
  const handleSubcategorySelect = (subcategoryId: number | null) => {
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return;

    if (subcategoryId === null) {
      // "All" in subcategory - go back to category page
      const search = searchParams?.get('search');
      router.push(`/city/${city.slug}/${category.slug}${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    } else {
      // Find subcategory slug
      const subcategory = subcategories.find(s => s.id === subcategoryId);
      if (subcategory) {
        const search = searchParams?.get('search');
        router.push(`/city/${city.slug}/${category.slug}/${subcategory.slug}${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      }
    }
  };

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

      // Find category and subcategory names for this business
      const businessCategory = categories.find(c => c.id === business.categoryId);
      const businessSubcategory = subcategories.find(s => s.id === business.subcategoryId);

      const matchesSearch =
        !searchTerm ||
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (business.description && business.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (businessCategory?.name && businessCategory.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (businessSubcategory?.name && businessSubcategory.name.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesSubcategory && matchesSearch;
    });
  }, [businesses, selectedCategory, selectedSubcategory, searchTerm, categories, subcategories]);

  // Determine how many businesses to show initially
  const shouldShowLoadMore = !selectedSubcategory && !searchTerm;
  const initialLimit = typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 20;
  const displayedBusinesses = shouldShowLoadMore && !showAll
    ? filteredBusinesses.slice(0, initialLimit)
    : filteredBusinesses;
  const hasMoreToShow = shouldShowLoadMore && filteredBusinesses.length > initialLimit;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    if (value) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: city.name },
  ];

  const citySeoContent = cityContent[city.slug];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
        {/* Promotional Banner */}
        <div className="w-full md:max-w-7xl md:mx-auto px-2 md:px-6 lg:px-8 pt-0 sm:pt-8">
          <PromotionalBanner />
        </div>

        {/* Breadcrumbs & SEO Content */}
        <div className="w-full md:max-w-7xl md:mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-4">
          <Breadcrumbs items={breadcrumbItems} />

          {citySeoContent && (
            <div className="mb-6 hidden">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {citySeoContent.description}
              </p>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {citySeoContent.content}
                </div>
              </div>
            </div>
          )}
        </div>

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
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-3 pl-11 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Category Pills */}
              {categories && (
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleCategorySelect}
                />
              )}

              {/* Subcategory Pills */}
              {selectedCategory && filteredSubcategories.length > 0 && (
                <SubcategoryFilter
                  subcategories={filteredSubcategories}
                  selectedSubcategory={selectedSubcategory}
                  onSelectSubcategory={handleSubcategorySelect}
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
