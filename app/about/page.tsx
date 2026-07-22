import { Suspense } from 'react';
import { headers } from 'next/headers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us | BuzzGram',
  description: 'BuzzGram connects customers with home-based and Instagram businesses across North America, the ones traditional platforms overlook.',
};

const DIFFERENTIATORS = [
  {
    color: 'green',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    title: 'Built for home-based businesses',
    text: 'No storefront or years of history required. If you serve customers well, you belong here.',
  },
  {
    color: 'pink',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Instagram is your portfolio',
    text: 'We put it front and center, so customers see your actual work, not just star ratings.',
  },
  {
    color: 'blue',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'AI search, launching soon',
    text: 'Describe what you need and get matched to real local businesses. No keyword guessing.',
  },
  {
    color: 'purple',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Community, not competition',
    text: "We don't compete with businesses. We're here to get them found, free.",
  },
];

const COLOR_CLASSES: Record<string, string> = {
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
};

export default async function AboutPage() {
  const headersList = await headers();
  const detectedCity = headersList.get('x-detected-city') || 'toronto';
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About BuzzGram',
    description: 'BuzzGram connects customers with home-based and Instagram businesses.',
    mainEntity: {
      '@type': 'Organization',
      name: 'BuzzGram',
      url: 'https://buzzgram.co',
      foundingDate: '2024',
      description: 'A platform connecting customers with home-based and Instagram businesses across 10 major cities in North America.',
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
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              The platform small businesses deserve
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The best local talent is home-based and Instagram-only. Google and Yelp weren't built to find them. BuzzGram is.
            </p>
          </div>

          {/* Problem */}
          <div className="mb-16">
            <div className="bg-gray-50 dark:bg-dark-card rounded-2xl p-8 border border-gray-200 dark:border-dark-border">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                The talented nail artist working from home. The baker making custom cakes in their kitchen. The event decorator building a following on Instagram. They're <span className="font-semibold text-orange-600 dark:text-orange-400">invisible</span> on traditional platforms, and customers can't find what they can't see.
              </p>
            </div>
          </div>

          {/* Mission */}
          <div className="mb-16">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-8 border-2 border-orange-300 dark:border-orange-700">
              <p className="text-xl text-gray-900 dark:text-white font-medium text-center">
                "Make every business discoverable, no matter where they work from."
              </p>
            </div>
          </div>

          {/* Differentiators */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              What Makes Us Different
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {DIFFERENTIATORS.map((d, i) => (
                <div key={i} className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border flex gap-4">
                  <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center ${COLOR_CLASSES[d.color]}`}>
                    {d.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{d.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{d.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By The Numbers */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Our Growing Community
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">1,000+</div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Talented Businesses</p>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">10</div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Major Cities</p>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">3</div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Service Categories</p>
              </div>
            </div>
          </div>

          {/* CTA */}
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
