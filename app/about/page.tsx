import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | BuzzGram - Supporting Home-Based & Instagram Businesses',
  description: 'Learn about BuzzGram\'s mission to connect customers with talented home-based and Instagram entrepreneurs across North America. Discover why we\'re building the first platform dedicated to small businesses that traditional platforms overlook.',
};

export default function AboutPage() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About BuzzGram',
    description: 'Learn about BuzzGram\'s mission to connect customers with home-based and Instagram businesses.',
    mainEntity: {
      '@type': 'Organization',
      name: 'BuzzGram',
      url: 'https://buzzgram.co',
      foundingDate: '2024',
      description: 'The first platform to connect customers with home-based and Instagram businesses across 10 major cities in North America.',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />

      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>

      <div className="min-h-screen bg-white dark:bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="text-6xl mb-6">💼✨</div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              We're Building the Platform Small Businesses Deserve
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              BuzzGram exists because talented entrepreneurs deserve a platform that actually understands them.
            </p>
          </div>

          {/* The Problem Section */}
          <div className="mb-16">
            <div className="text-5xl mb-4 text-center">🚫</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              The Problem We're Solving
            </h2>
            <div className="bg-gray-50 dark:bg-dark-card rounded-2xl p-8 border border-gray-200 dark:border-dark-border">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                Traditional platforms like Yelp, Google, and others focus on established businesses with storefronts. But what about the talented nail artist working from home? The baker creating custom cakes from their kitchen? The event decorator building their business through Instagram?
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                These entrepreneurs are <span className="font-semibold text-orange-600 dark:text-orange-400">invisible</span> on traditional platforms. Customers struggle to find them. They struggle to get discovered. Everyone loses.
              </p>
            </div>
          </div>

          {/* Our Mission Section */}
          <div className="mb-16">
            <div className="text-5xl mb-4 text-center">🎯</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Our Mission
            </h2>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-8 border-2 border-orange-300 dark:border-orange-700">
              <p className="text-xl text-gray-900 dark:text-white font-medium text-center">
                "Make every talented entrepreneur discoverable, no matter where they work from."
              </p>
            </div>
          </div>

          {/* How We're Different Section */}
          <div className="mb-16">
            <div className="text-5xl mb-4 text-center">⚡</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              How We're Different
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="text-4xl">🏠</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Built for Home-Based Businesses
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We don't require a storefront, business license, or years of history. If you're talented and serve customers, you belong here.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-4xl">📸</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Instagram-First Approach
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your Instagram is your portfolio. We showcase it front and center so customers see your actual work, not just reviews.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-4xl">🤝</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Direct Connection, No Middleman
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We connect customers directly with business owners. No booking fees, no commissions, no taking a cut of your hard work.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-4xl">💯</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Actually Free Forever
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Other platforms say "free" then charge you later. We mean it. List your business, get discovered, connect with customers—all 100% free.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* By The Numbers Section */}
          <div className="mb-16">
            <div className="text-5xl mb-4 text-center">📊</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Our Growing Community
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  1,000+
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Talented Businesses
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  10
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Major Cities
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  3
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Service Categories
                </p>
              </div>
            </div>
          </div>

          {/* Our Values Section */}
          <div className="mb-16">
            <div className="text-5xl mb-4 text-center">❤️</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              What We Believe In
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  🌟 Everyone Deserves Visibility
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Whether you work from a salon or your spare bedroom, if you're talented, customers should be able to find you.
                </p>
              </div>

              <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  🔍 Transparency First
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  No hidden fees, no bait-and-switch. What you see is what you get. Always.
                </p>
              </div>

              <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  💪 Supporting Small Businesses
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Big platforms prioritize big businesses. We prioritize entrepreneurs building their dreams one customer at a time.
                </p>
              </div>

              <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  🚀 Community Over Competition
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We're not here to compete with entrepreneurs. We're here to amplify them.
                </p>
              </div>
            </div>
          </div>

          {/* Vision Section */}
          <div className="mb-16">
            <div className="text-5xl mb-4 text-center">🌍</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Where We're Going
            </h2>
            <div className="bg-gray-50 dark:bg-dark-card rounded-2xl p-8 border border-gray-200 dark:border-dark-border">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                We're starting with <span className="font-semibold">10 cities</span> and <span className="font-semibold">1,000+ businesses</span>. But this is just the beginning.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                Our vision is to become the go-to platform for <span className="font-semibold text-orange-600 dark:text-orange-400">every home-based and Instagram business</span> across North America—and eventually, the world.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                When customers think "I need a talented local entrepreneur," we want them to think BuzzGram first.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 rounded-2xl p-12">
            <div className="text-5xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Whether you're looking for talented entrepreneurs or you are one, BuzzGram is built for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/city/toronto"
                className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Find Businesses
              </Link>
              <Link
                href="/business-signup"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                List Your Business FREE
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
