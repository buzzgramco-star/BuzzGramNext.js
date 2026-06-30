import Link from 'next/link';

export default function QuickValueProps() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-600 to-orange-500 dark:from-orange-700 dark:via-orange-700 dark:to-orange-600">
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Large decorative icon */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 hidden md:block pointer-events-none">
        <svg className="w-40 h-40 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </div>

      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 py-10 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Icon badge */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-1">OneQuote</p>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              Skip the DMs. Send one request and get quotes from multiple vendors.
            </h2>
            <p className="text-sm text-orange-100 mt-1">Describe your needs once and let vendors come to you.</p>
          </div>
        </div>

        <Link
          href="/quote"
          className="flex-shrink-0 px-6 py-3 bg-white text-orange-600 font-semibold text-sm rounded-xl hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
        >
          Try OneQuote →
        </Link>
      </div>
    </div>
  );
}
