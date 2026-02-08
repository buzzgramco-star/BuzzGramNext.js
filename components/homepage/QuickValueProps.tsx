'use client';

import { useRouter } from 'next/navigation';

export default function QuickValueProps() {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-dark-bg py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          OneQuote: Get Multiple Quotes with a Single Request
        </h2>

        {/* Value Proposition */}
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4 leading-relaxed">
          Stop wasting time reaching out to dozens of businesses individually. With OneQuote, describe your needs once and receive competitive quotes from multiple qualified providers.
        </p>

        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Whether you need beauty services, catering, or event planning, connect with the right businesses and compare offers effortlessly.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => router.push('/quote')}
          className="inline-block px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Request Your Free Quote
        </button>
      </div>
    </div>
  );
}
