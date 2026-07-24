import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AIDemoPreview from '@/components/homepage/AIDemoPreview';
import FloatingUseCases, { UseCaseTicker } from '@/components/homepage/FloatingUseCases';
import Reveal from '@/components/Reveal';

// Demand flowing past — the pitch is that these requests are waiting for
// vendors. More entries than visible slots: FloatingUseCases cycles a fresh
// one in every few seconds, so demand reads as live.
const DEMAND_PILLS = [
  '✨ Lash tech needed · Toronto',
  '💍 Wedding planner wanted · Miami',
  '🎂 Custom cake order · Chicago',
  '📸 Birthday photographer · NYC',
  '💇‍♀️ Braids this weekend · Calgary',
  '🎈 Party decor · Vancouver',
  '👨‍🍳 Private chef for 10 · LA',
  '💄 Makeup artist · Montreal',
  '💅 Gel set tomorrow · Ottawa',
  '🎉 Sweet 16 planner · Phoenix',
  '🧁 Cupcakes for 50 · Toronto',
  '📷 Engagement shoot · Vancouver',
];

export const metadata: Metadata = {
  title: 'The First AI That Recommends Your Business | BuzzGram for Businesses',
  description:
    'BuzzGram AI is the first of its kind: an AI that recommends real local businesses by name. List your home-based or Instagram business free and be in its answers today.',
  alternates: {
    canonical: 'https://www.buzzgram.co/for-businesses',
  },
  openGraph: {
    title: 'The First AI That Sends Customers to Your Business | BuzzGram',
    description:
      'When someone in your city tells BuzzGram AI what they need, it recommends real local businesses by name. List free and be in its answers today.',
    url: 'https://www.buzzgram.co/for-businesses',
    type: 'website',
  },
};

const PROBLEMS = [
  {
    title: 'The algorithm decides who sees you',
    text: 'You post your best work. Instagram shows it to a fraction of your followers. New customers never see it.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ),
  },
  {
    title: "You're invisible on Google",
    text: 'No storefront, no Google listing. Someone two blocks away is searching for what you do and finding a chain instead.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    title: "Word of mouth doesn't scale",
    text: "Your clients love you and tell their friends. That's how you got this far. It's also the ceiling.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 13h4a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
];

export default function ForBusinessesPage() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>

      <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">

        {/* 1. Hero — pitch left, live demo right, demand pills orbiting the demo */}
        <div className="relative bg-white dark:bg-dark-bg overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100 dark:bg-orange-900/10 rounded-full blur-3xl opacity-60" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-orange-50 dark:bg-orange-900/5 rounded-full blur-3xl opacity-60" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-20 sm:pb-16">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              {/* Pitch */}
              <div className="text-center lg:text-left">
                <div className="flex justify-center lg:justify-start mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-xs font-semibold tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    BuzzGram AI is live
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight leading-tight">
                  The first AI that sends customers{' '}
                  <span className="text-orange-600 dark:text-orange-500">to your business.</span>
                </h1>

                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  When someone in your city tells our AI what they need, it recommends real local
                  businesses by name: nail techs, bakers, photographers, and every home-based
                  business in between. Nothing like it exists anywhere else. List free today and
                  be in its answers from day one.
                </p>

                <Link
                  href="/business-signup"
                  className="inline-block px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  List my business free
                </Link>
                <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
                  Free. No credit card. You keep your Instagram, your clients, your prices.
                </p>
              </div>

              {/* Live demo with demand pills pinned around its edges */}
              <div className="min-w-0">
                <div className="relative">
                  <FloatingUseCases pills={DEMAND_PILLS} variant="orbit" />
                  <div className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-5 shadow-sm min-w-0">
                    <AIDemoPreview showDetail />
                  </div>
                </div>
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-7">
                  Every one of those recommendations could be you.
                </p>
              </div>
            </div>

            {/* Mobile: demand requests scroll past as a ticker, right under the demo */}
            <div className="mt-8 lg:hidden">
              <UseCaseTicker pills={DEMAND_PILLS} />
            </div>
          </div>
        </div>

        {/* 2. The problem */}
        <div className="bg-gray-50 dark:bg-dark-card py-16 sm:py-20 border-t border-gray-100 dark:border-dark-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12">
              Being great at your craft isn&apos;t the hard part anymore.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PROBLEMS.map((p, i) => (
                <Reveal key={i} delay={i * 120}>
                <div className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-2xl p-6 h-full">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                    {p.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{p.text}</p>
                </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Final CTA */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              The customers are already asking.<br className="hidden sm:block" /> Make sure the answer is you.
            </h2>
            <Link
              href="/business-signup"
              className="inline-block mt-6 px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              List my business free
            </Link>
            <p className="mt-3 text-sm text-orange-100">
              No commission. Takes five minutes.
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
