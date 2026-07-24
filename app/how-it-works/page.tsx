import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'How It Works | BuzzGram',
  description: 'How BuzzGram connects you with home-based and Instagram businesses, powered by AI search.',
};

const CUSTOMER_STEPS = [
  {
    title: 'Ask or browse',
    text: 'Describe what you need to our AI, or browse by city and category — whichever is faster for you.',
  },
  {
    title: 'See real work and pricing',
    text: 'Every listing links straight to Instagram, with services and prices up front.',
  },
  {
    title: 'Request quotes',
    text: 'Send one request, get quotes from multiple businesses, and pick the best fit.',
  },
];

const OWNER_STEPS = [
  {
    title: 'List free in minutes',
    text: 'Add your services and Instagram link. No credit card, ever.',
  },
  {
    title: 'Get discovered',
    text: 'Show up in local search and in AI recommendations across your city.',
  },
  {
    title: 'Win clients',
    text: 'Quote requests land in your dashboard. Respond and turn them into bookings.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>

      <div className="min-h-screen bg-white dark:bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How BuzzGram Works
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Finding home-based and Instagram businesses, made simple.
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              For Customers
            </h2>
            <div className="space-y-6">
              {CUSTOMER_STEPS.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-lg">{s.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/city/toronto"
                className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
              >
                Start Browsing Businesses →
              </Link>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              For Business Owners
            </h2>
            <div className="space-y-6">
              {OWNER_STEPS.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-lg">{s.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/business-signup"
                className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
              >
                List Your Business FREE →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
