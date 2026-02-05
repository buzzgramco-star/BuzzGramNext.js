import { Suspense } from 'react';
import { headers } from 'next/headers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us | BuzzGram - Supporting Home-Based & Instagram Businesses',
  description: 'Learn about BuzzGram\'s mission to connect customers with home-based and Instagram businesses across North America. Discover why we\'re building the first platform dedicated to small businesses that traditional platforms overlook.',
};

export default async function AboutPage() {
  // Get detected city from middleware
  const headersList = await headers();
  const detectedCity = headersList.get('x-detected-city') || 'toronto';
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
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              We're Building the Platform Small Businesses Deserve
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              BuzzGram exists because businesses deserve a platform that actually understands them.
            </p>
          </div>

          {/* The Problem Section */}
          <div className="mb-16">
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Our Mission
            </h2>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-8 border-2 border-orange-300 dark:border-orange-700">
              <p className="text-xl text-gray-900 dark:text-white font-medium text-center">
                "Make every business discoverable, no matter where they work from."
              </p>
            </div>
          </div>

          {/* How We're Different Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              How We're Different
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-16 h-16 flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Built for Home-Based Businesses
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We don't require a storefront or years of history. If you're talented and serve customers, you belong here.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-16 h-16 flex-shrink-0 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
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
                <div className="w-16 h-16 flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Save Time Finding the Perfect Business
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    No more endless scrolling through Instagram or asking friends for recommendations. Browse, compare, and request quotes from multiple businesses all in one place.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-16 h-16 flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Website Needed for Business Owners
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Growing your business shouldn't require expensive websites or tech skills. Create your profile, link your Instagram, and start receiving quote requests—all from one platform.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-16 h-16 flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Centralized Quote Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Stop managing endless DMs across Instagram, Facebook, and WhatsApp. All quote requests come to your dashboard where you can respond on your schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* By The Numbers Section */}
          <div className="mb-16">
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              What We Believe In
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Everyone Deserves Visibility
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Whether you work from a salon or your spare bedroom, if you're talented, customers should be able to find you.
                </p>
              </div>

              <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex-shrink-0 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Transparency First
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  No hidden fees, no bait-and-switch. What you see is what you get. Always.
                </p>
              </div>

              <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex-shrink-0 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Supporting Small Businesses
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Big platforms prioritize big businesses. We prioritize small businesses building their dreams one customer at a time.
                </p>
              </div>

              <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Community Over Competition
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  We're not here to compete with businesses. We're here to amplify them.
                </p>
              </div>
            </div>
          </div>

          {/* Vision Section */}
          <div className="mb-16">
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
                When customers think "I need a talented local business," we want them to think BuzzGram first.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Whether you're looking for talented businesses or you are one, BuzzGram is built for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/city/${detectedCity}`}
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
