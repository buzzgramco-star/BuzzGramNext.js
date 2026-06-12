'use client';

import Link from 'next/link';
import AIChatSearch from '@/components/AIChatSearch';

interface HeroSectionProps {
  detectedCity: string;
}

export default function HeroSection({ detectedCity }: HeroSectionProps) {
  return (
    <div className="relative bg-white dark:bg-dark-bg overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100 dark:bg-orange-900/10 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-orange-50 dark:bg-orange-900/5 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16">

        {/* Eyebrow */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-xs font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            AI-Powered Business Discovery
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight leading-tight">
          Tell us what you need.{' '}
          <span className="text-orange-600 dark:text-orange-500">We know who does it.</span>
        </h1>

        {/* Subtext */}
        <p className="text-center text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          BuzzGram connects you with the best home-based and Instagram businesses in your city — nail techs, bakers, photographers, event planners and more. Just describe what you need.
        </p>

        {/* AI Chat — the hero */}
        <div className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
          <AIChatSearch />
        </div>

        {/* Social proof strip */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-400 dark:text-gray-500 mb-8">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            10 cities
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span>Beauty · Food · Events</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span>Home-based &amp; Instagram businesses</span>
        </div>

        {/* Business owner link */}
        <div className="text-center">
          <Link
            href="/business-signup"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium"
          >
            Are you a business owner? List your business FREE →
          </Link>
        </div>

      </div>
    </div>
  );
}
