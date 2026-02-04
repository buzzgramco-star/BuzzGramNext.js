import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'How It Works | BuzzGram',
  description: 'Learn how BuzzGram connects customers with home-based and Instagram businesses',
};

export default function HowItWorksPage() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>

      <div className="min-h-screen bg-white dark:bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How BuzzGram Works
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Connecting customers with home-based and Instagram businesses
            </p>
          </div>

          {/* For Customers Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              For Customers
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                    Browse businesses by city and category
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Search through 998+ verified home-based and Instagram businesses across 10 major cities. Filter by beauty, food, or event services.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                    View portfolios and read reviews
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Every business profile includes their Instagram link so you can see their work, style, and customer results before contacting them.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                    Request quotes from multiple businesses
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Submit one quote request and get responses from multiple businesses. Compare offers and choose the best fit for your needs.
                  </p>
                </div>
              </div>
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

          {/* For Business Owners Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              For Business Owners
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                    List your business for FREE
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create your business profile in 5 minutes. Add your services, connect your Instagram, and start appearing in local searches. No credit card required, ever.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                    Get discovered by local customers
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Appear in search results when customers in your area are looking for services you offer. Your Instagram portfolio helps showcase your work.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                    Receive quote requests and win clients
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get notified when customers submit quote requests. Respond with your best offer and turn leads into paying clients.
                  </p>
                </div>
              </div>
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

          {/* Why BuzzGram Section */}
          <div className="bg-gray-50 dark:bg-dark-card rounded-xl p-8 border border-gray-200 dark:border-dark-border">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Why Choose BuzzGram?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  For Customers
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    Home-based & Instagram businesses all in one place
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    View portfolios before booking
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    Request quotes from multiple businesses at once
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    100% free to use
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  For Business Owners
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    100% FREE listing forever
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    Perfect for side hustles and home-based businesses
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    Turn Instagram followers into paying customers
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    Receive quote requests from ready-to-buy customers
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
