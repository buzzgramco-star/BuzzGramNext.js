'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AIChatSearch from '@/components/AIChatSearch';
import FloatingUseCases, { UseCaseTicker } from '@/components/homepage/FloatingUseCases';

// Clickable — each pre-fills the chat via buzzgram:prefill
const USE_CASE_PILLS = [
  '💅 nail tech under $60',
  '💍 help me plan my wedding',
  '🎂 custom cake by Saturday',
  '✨ lash fill tomorrow',
  '📸 photographer for a gender reveal',
  '🎀 decor for a sweet 16',
  '💇‍♀️ braids this weekend',
  '👨‍🍳 private chef for date night',
];

export default function HeroSection() {
  // Mobile-only Siri/iMessage-style takeover: the instant someone engages the
  // input (or taps the demo, which focuses it), the chat expands to cover the
  // full viewport instead of sitting inline in the hero. Same AIChatSearch
  // instance throughout — this only repositions its wrapper via CSS, so
  // messages/focus/state are never lost switching in or out.
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    if (!mobileExpanded) return;
    if (!window.matchMedia('(max-width: 639px)').matches) return; // desktop: no-op, no scroll lock
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, [mobileExpanded]);

  return (
    <div className="relative bg-white dark:bg-dark-bg overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100 dark:bg-orange-900/10 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-orange-50 dark:bg-orange-900/5 rounded-full blur-3xl opacity-60" />
      </div>

      <FloatingUseCases pills={USE_CASE_PILLS} interactive />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16">

        {/* Eyebrow */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-xs font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Meet the AI that knows your city
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight leading-tight">
          Find the vendor{' '}
          <span className="text-orange-600 dark:text-orange-500">your friends won&apos;t share.</span>
        </h1>

        {/* Subtext */}
        <p className="text-center text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The best local talent doesn&apos;t show up on Google. They&apos;re home-based, Instagram-only,
          and they&apos;re everywhere in your city. Just tell BuzzGram what you need and we&apos;ll find them.
        </p>

        {/* AI Chat — the hero. Plays a demo conversation until the user interacts.
            On mobile, engaging the input expands this to a full-screen takeover
            (sm: classes below restore the normal inline hero box on desktop). */}
        <div
          className={
            mobileExpanded
              ? 'fixed inset-0 z-50 bg-white dark:bg-dark-bg p-3 pt-4 sm:static sm:inset-auto sm:z-auto sm:mb-4 lg:mb-8 sm:bg-gray-50 sm:dark:bg-dark-card sm:border sm:border-gray-200 sm:dark:border-dark-border sm:rounded-2xl sm:p-6 sm:shadow-sm'
              : 'bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-5 sm:p-6 shadow-sm mb-4 lg:mb-8'
          }
        >
          {mobileExpanded && (
            <button
              type="button"
              onClick={() => setMobileExpanded(false)}
              className="sm:hidden flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-2"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          )}
          <AIChatSearch compact demo onEngage={() => setMobileExpanded(true)} fullHeight={mobileExpanded} />
        </div>

        {/* Mobile: tappable use-case ticker feeds the chat (floating field is lg+) */}
        <div className="mb-8 lg:hidden">
          <UseCaseTicker pills={USE_CASE_PILLS} interactive />
        </div>

        {/* How it works — three steps */}
        <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 mb-8 max-w-3xl mx-auto">
          {[
            {
              step: '1',
              title: 'Say what you need',
              text: '"Nail tech under $60" or "help me plan my wedding" — just type it like you\'d text a friend.',
            },
            {
              step: '2',
              title: 'AI searches your city',
              text: 'It knows the home-based, Instagram-only vendors that never show up on Google.',
            },
            {
              step: '3',
              title: 'Connect directly',
              text: 'See their work, services and prices — then DM them on Instagram. No middleman.',
            },
          ].map(({ step, title, text }) => (
            <div key={step} className="flex sm:flex-col items-start gap-3 sm:gap-2 text-left">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center justify-center">
                {step}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof strip */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-gray-400 dark:text-gray-500 mb-8">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            10 cities &amp; growing
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span>Beauty · Food · Events</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span>Only on BuzzGram</span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span>Free to use</span>
        </div>

        {/* Business owner link */}
        <div className="text-center">
          <Link
            href="/for-businesses"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors font-medium"
          >
            Are you a business owner? List your business FREE →
          </Link>
        </div>

      </div>
    </div>
  );
}
