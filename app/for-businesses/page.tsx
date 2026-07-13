import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AIDemoPreview from '@/components/homepage/AIDemoPreview';

export const metadata: Metadata = {
  title: 'List Your Home-Based Business Free | BuzzGram for Businesses',
  description:
    'BuzzGram is a free directory where home-based and Instagram businesses get found through AI-powered search. List your nail, hair, lash, baking, catering, photography or event business free and reach customers searching in your city.',
  alternates: {
    canonical: 'https://www.buzzgram.co/for-businesses',
  },
  openGraph: {
    title: 'Your Next Client Is Searching For You | BuzzGram for Businesses',
    description:
      'You run your business through Instagram. BuzzGram puts you in front of the people searching for exactly what you do in your city. Free listing, no commission.',
    url: 'https://www.buzzgram.co/for-businesses',
    type: 'website',
  },
};

const FAQS = [
  {
    q: 'How much does it cost?',
    a: 'Nothing. Listing your business on BuzzGram is free.',
  },
  {
    q: 'I work from home. Is that a problem?',
    a: "It's the point. BuzzGram exists for home-based and Instagram businesses. No storefront needed.",
  },
  {
    q: 'Do I need a website?',
    a: 'No. Your BuzzGram profile is your web presence, and it links straight to your Instagram.',
  },
  {
    q: 'Do you take a cut of my bookings?',
    a: "No. Customers contact and pay you directly on Instagram. We don't process payments or bookings.",
  },
  {
    q: "My business isn't beauty, food, or events. Can I still join?",
    a: "Yes. Beauty, food, and events are our biggest categories today, but we welcome home-based and Instagram businesses of all kinds. Submit yours and we'll fit you in as new categories open up.",
  },
  {
    q: 'What cities are you in?',
    a: 'Toronto, Vancouver, Calgary, Montreal, Ottawa, New York, Los Angeles, Chicago, Miami, and Phoenix. More coming.',
  },
  {
    q: 'I already get clients from Instagram. Why bother?',
    a: 'Keep them. BuzzGram works both ways: people who don\'t follow you yet can discover you, and your existing clients get one place to check your current services, prices, and deals. When something changes, they see it here first.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const PROBLEMS = [
  {
    title: 'The algorithm decides who sees you',
    text: 'You post your best set, your best cake, your best shoot. Instagram shows it to a fraction of your followers. New customers? They never see it at all.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ),
  },
  {
    title: "You're invisible on Google",
    text: 'No storefront means no Google listing. Someone two blocks away is searching "nail tech near me" and finding a salon chain instead of you.',
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

const FEATURES = [
  {
    title: 'A page that ranks on Google',
    text: 'Your profile lives on pages built to rank for "[your service] in [your city]". The SEO you could never do from an Instagram bio.',
  },
  {
    title: 'AI recommendations',
    text: 'Every conversation about your category in your city is a chance to be recommended by name.',
  },
  {
    title: 'Quote requests, delivered',
    text: 'Customers describe what they need once, and it lands in your dashboard. No more "how much?" DMs going nowhere.',
  },
  {
    title: 'Your menu, your prices',
    text: 'List services with real pricing: "Full set from $45". Customers arrive already knowing what you charge, and existing clients always see your latest prices and deals.',
  },
  {
    title: 'Reviews you can answer',
    text: 'Collect reviews and reply as the owner. Your reputation, on the record.',
  },
  {
    title: 'Straight to your DMs',
    text: "We don't sit in the middle. Customers connect with you directly on Instagram. No commission, no gatekeeping.",
  },
];

const STEPS = [
  {
    step: '1',
    title: 'Tell us about your business',
    text: 'Name, city, what you do, your Instagram. Takes five minutes.',
  },
  {
    step: '2',
    title: 'We review and approve',
    text: "Real humans check every listing. That's why customers trust what they find here.",
  },
  {
    step: '3',
    title: 'Get found',
    text: 'You show up in search, in browsing, and in AI recommendations across your city.',
  },
];

const CITY_LINKS = [
  { name: 'Toronto', slug: 'toronto' },
  { name: 'Vancouver', slug: 'vancouver' },
  { name: 'Calgary', slug: 'calgary' },
  { name: 'Montreal', slug: 'montreal' },
  { name: 'Ottawa', slug: 'ottawa' },
  { name: 'New York', slug: 'new-york-city' },
  { name: 'Los Angeles', slug: 'los-angeles' },
  { name: 'Chicago', slug: 'chicago' },
  { name: 'Miami', slug: 'miami' },
  { name: 'Phoenix', slug: 'phoenix' },
];

export default function ForBusinessesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>

      <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">

        {/* 1. Hero */}
        <div className="relative bg-white dark:bg-dark-bg overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-100 dark:bg-orange-900/10 rounded-full blur-3xl opacity-60" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-orange-50 dark:bg-orange-900/5 rounded-full blur-3xl opacity-60" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-24 sm:pb-20 text-center">
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-xs font-semibold tracking-wide uppercase">
                For nail techs, bakers, photographers &amp; every home-based business
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight leading-tight">
              Your next client is{' '}
              <span className="text-orange-600 dark:text-orange-500">searching for you right now.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              You run your whole business through Instagram. Your work speaks for itself, but only to
              people who already follow you. BuzzGram puts you in front of the people searching for
              exactly what you do in your city.
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
        </div>

        {/* 2. The problem */}
        <div className="bg-gray-50 dark:bg-dark-card py-16 sm:py-20 border-t border-gray-100 dark:border-dark-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12">
              Being great at your craft isn&apos;t the hard part anymore.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PROBLEMS.map((p, i) => (
                <div key={i} className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-2xl p-6">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                    {p.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. The AI section */}
        <div className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-orange-600 dark:text-orange-500 mb-3">
                The BuzzGram difference
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                When someone asks our AI for what you do, it says your name.
              </h2>
              <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                BuzzGram is the first platform where an AI actually recommends local businesses in
                conversation. Someone types &quot;I need a lash tech under $80&quot; and the AI answers
                with real vendors: names, services, prices, and a link straight to their Instagram.
                If that&apos;s you, you just got a customer you never had to find.
              </p>
            </div>

            {/* Live demo — same animated chat simulation as the homepage */}
            <div>
              <div className="bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-5 shadow-sm">
                <AIDemoPreview />
              </div>
              <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-3">
                Every one of those recommendations could be you.
              </p>
            </div>
          </div>
        </div>

        {/* 4. What you get */}
        <div className="bg-gray-50 dark:bg-dark-card py-16 sm:py-20 border-t border-gray-100 dark:border-dark-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12">
              One profile. Working for you around the clock.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {FEATURES.map((f, i) => (
                <div key={i} className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-2xl p-6">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>

            {/* Direct-payment banner */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-700 dark:to-orange-600 rounded-2xl px-8 py-8 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Free to list. Customers pay you directly.</p>
              <p className="text-sm text-orange-100">We don&apos;t process bookings or sit in the payment loop. Your clients, and your revenue, stay yours.</p>
            </div>
          </div>
        </div>

        {/* 5. How it works */}
        <div className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12">
              Live in your city in three steps
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {STEPS.map(({ step, title, text }) => (
                <div key={step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-base font-bold flex items-center justify-center mx-auto mb-4">
                    {step}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10">
              Live across{' '}
              {CITY_LINKS.map((c, i) => (
                <span key={c.slug}>
                  <Link href={`/city/${c.slug}`} prefetch={false} className="text-orange-600 dark:text-orange-400 hover:underline">
                    {c.name}
                  </Link>
                  {i < CITY_LINKS.length - 1 ? ', ' : '.'}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* 6. FAQ */}
        <div className="bg-gray-50 dark:bg-dark-card py-16 sm:py-20 border-t border-gray-100 dark:border-dark-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-10">
              Questions, answered
            </h2>
            <div className="space-y-3">
              {FAQS.map(({ q, a }, i) => (
                <details
                  key={i}
                  className="group bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-5 py-4"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none text-base font-semibold text-gray-900 dark:text-white">
                    {q}
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* 7. Final CTA */}
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
              Free. No credit card. You keep your Instagram, your clients, your prices.
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
