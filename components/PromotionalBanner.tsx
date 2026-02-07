"use client";

import { useRouter } from 'next/navigation';

export default function PromotionalBanner() {
  const router = useRouter();

  return (
    <>
      {/* Desktop Version - Hidden on mobile */}
      <div className="hidden md:block w-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl overflow-hidden shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Left side: Text content */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                Get Quotes from Multiple Providers
              </h2>
              <p className="text-base text-white/90 mb-4 max-w-2xl">
                Find Beauty, Food & Events specialists all in one place. No need to contact each business separately.
              </p>
              <button
                onClick={() => router.push('/quote')}
                className="px-5 py-2.5 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-md"
              >
                Explore OneQuote →
              </button>
            </div>

            {/* Right side: Optional emoji/icon */}
            <div className="hidden lg:block text-8xl ml-8">
              🎯
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version - Visible only on mobile */}
      <div className="block md:hidden w-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg overflow-hidden shadow-lg mb-6">
        <div className="px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            {/* Headline */}
            <div className="flex-1">
              <h3 className="text-base font-bold text-white leading-tight">
                Get quotes from multiple providers
              </h3>
            </div>

            {/* Button */}
            <button
              onClick={() => router.push('/quote')}
              className="px-4 py-2 bg-white/20 text-white font-medium text-sm rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm whitespace-nowrap"
            >
              OneQuote →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
