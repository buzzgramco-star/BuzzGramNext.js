export default function QuickValueProps() {
  return (
    <div className="bg-white dark:bg-dark-bg py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid of 4 value props */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {/* 1. Home-based & Instagram focus */}
          <div className="text-center flex flex-col">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl mb-4 mx-auto">
              <svg className="w-7 h-7 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 min-h-[48px] flex items-center justify-center">
              Home-Based & Instagram Businesses
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Discover talented entrepreneurs all in one place
            </p>
          </div>

          {/* 2. View profiles */}
          <div className="text-center flex flex-col">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl mb-4 mx-auto">
              <svg className="w-7 h-7 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 min-h-[48px] flex items-center justify-center">
              View Profiles First
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              See their Instagram work before reaching out
            </p>
          </div>

          {/* 3. Request quotes from multiple (OneQuote mention) */}
          <div className="text-center flex flex-col">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl mb-4 mx-auto">
              <svg className="w-7 h-7 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 min-h-[48px] flex items-center justify-center">
              Request Quotes from Multiple
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Send one request, get responses from several businesses
            </p>
          </div>

          {/* 4. Direct connection */}
          <div className="text-center flex flex-col">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl mb-4 mx-auto">
              <svg className="w-7 h-7 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 min-h-[48px] flex items-center justify-center">
              Direct Connection
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Connect directly with business owners, no middleman
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
