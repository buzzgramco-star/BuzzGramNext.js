import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FAQ from '@/components/homepage/FAQ';

export const metadata = {
  title: 'FAQ | BuzzGram',
  description: 'Everything you need to know about BuzzGram, the AI-powered platform for discovering home-based and Instagram businesses near you.',
};

export default function FAQPage() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>

      <div className="min-h-screen bg-white dark:bg-dark-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
          <div className="text-center mb-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-orange-600 dark:text-orange-500 mb-3">Support</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Everything you need to know about BuzzGram.
            </p>
          </div>
        </div>

        <FAQ />

        <Footer />
      </div>
    </>
  );
}
