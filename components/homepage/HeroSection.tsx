'use client';

import Link from 'next/link';
import AIChatSearch from '@/components/AIChatSearch';

interface HeroSectionProps {
  detectedCity: string;
}

export default function HeroSection({ detectedCity }: HeroSectionProps) {
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

        {/* AI Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <AIChatSearch />
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
