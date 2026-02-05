'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { City, Category, Subcategory } from '@/types';

interface CitiesGridMatrixProps {
  cities: City[];
  categories: Category[];
  subcategories: Subcategory[];
}

export default function CitiesGridMatrix({ cities, categories, subcategories }: CitiesGridMatrixProps) {
  // Track expanded categories per city: { cityId: { categoryId: boolean } }
  const [expandedCategories, setExpandedCategories] = useState<Record<number, Record<number, boolean>>>({});

  // Toggle category expansion
  const toggleCategory = (cityId: number, categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cityId]: {
        ...(prev[cityId] || {}),
        [categoryId]: !(prev[cityId]?.[categoryId] || false)
      }
    }));
  };

  // Check if category is expanded
  const isCategoryExpanded = (cityId: number, categoryId: number) => {
    return expandedCategories[cityId]?.[categoryId] || false;
  };

  // Get subcategories for a specific category
  const getSubcategoriesForCategory = (categoryId: number) => {
    return subcategories.filter(sub => sub.categoryId === categoryId).slice(0, 4); // Show first 4
  };

  return (
    <div className="bg-white dark:bg-dark-bg py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Available in 10 Major Cities
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse businesses by city and category across the USA and Canada
          </p>
        </div>

        {/* Cities Matrix */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cities.map((city) => (
            <div
              key={city.id}
              className="bg-gray-50 dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border hover:shadow-lg transition-shadow"
            >
              {/* City Name */}
              <div className="mb-4">
                <Link
                  href={`/city/${city.slug}`}
                  className="text-2xl font-bold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="text-orange-600 dark:text-orange-400">📍</span>
                  {city.name}
                  <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                {categories.map((category) => {
                  const categorySubcategories = getSubcategoriesForCategory(category.id);
                  const isExpanded = isCategoryExpanded(city.id, category.id);

                  return (
                    <div key={category.id} className="border-l-2 border-orange-200 dark:border-orange-800 pl-4">
                      {/* Category Header - Clickable to toggle */}
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/city/${city.slug}/${category.slug}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {category.name}
                        </Link>
                        <button
                          onClick={() => toggleCategory(city.id, category.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <svg
                            className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Subcategories - Collapsible */}
                      {categorySubcategories.length > 0 && isExpanded && (
                        <div className="flex flex-wrap gap-2 mt-2 animate-fadeIn">
                          {categorySubcategories.map((subcategory) => (
                            <Link
                              key={subcategory.id}
                              href={`/city/${city.slug}/${category.slug}/${subcategory.slug}`}
                              className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* View All Link */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
                <Link
                  href={`/city/${city.slug}`}
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium text-sm inline-flex items-center gap-1 group"
                >
                  View all businesses in {city.name}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
