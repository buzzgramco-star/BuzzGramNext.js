'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to Toronto with search query (default city)
      router.push(`/city/toronto?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-card dark:to-dark-bg border-b border-gray-200 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Main Headline */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Find Local Home-Based & Instagram Businesses
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Beauty, food, and event services across 10 major cities
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for nails, bakery, event planning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-4 pl-12 pr-32 text-lg border-2 border-gray-300 dark:border-dark-border rounded-xl bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 px-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-r-xl transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/city/toronto/beauty"
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-dark-card border-2 border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-semibold rounded-xl hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <span className="text-2xl">💅</span>
            Beauty Services
          </Link>
          <Link
            href="/city/toronto/food"
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-dark-card border-2 border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-semibold rounded-xl hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🍰</span>
            Food Services
          </Link>
          <Link
            href="/city/toronto/events"
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-dark-card border-2 border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-semibold rounded-xl hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🎉</span>
            Event Services
          </Link>
        </div>

        {/* Business Owner Link - Subtle */}
        <div className="text-center mt-8">
          <Link
            href="/business-signup"
            className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-sm font-medium"
          >
            Are you a business owner? List your business FREE →
          </Link>
        </div>
      </div>
    </div>
  );
}
