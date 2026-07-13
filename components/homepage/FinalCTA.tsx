'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FinalCTA() {
  // Server-rendered href defaults to Toronto; after mount, respect the city the
  // user already picked in the AI chat (persisted under 'buzzgram-city')
  const [citySlug, setCitySlug] = useState('toronto');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('buzzgram-city');
      if (saved) setCitySlug(saved);
    } catch { /* silent */ }
  }, []);

  return (
    <div className="bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Simple Message */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
          Stop scrolling Instagram.<br className="hidden sm:block" /> Start asking BuzzGram.
        </h2>
        <p className="text-lg sm:text-xl text-orange-100 max-w-2xl mx-auto mb-10">
          The nail tech your friends swear by. The baker who sells out every week. The photographer everyone loves. They&apos;re all on BuzzGram and it&apos;s free.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={`/city/${citySlug}`}
            className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 min-w-[200px]"
          >
            Start Discovering
          </Link>
          <Link
            href="/for-businesses"
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 min-w-[200px]"
          >
            List Your Business Free
          </Link>
        </div>
      </div>
    </div>
  );
}
