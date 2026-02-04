export default function HowItWorks() {
  return (
    <div className="bg-white dark:bg-dark-bg py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How OneQuote Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connecting customers with businesses in three simple steps
          </p>
        </div>

        {/* For Customers */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
            For Customers
          </h3>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-3xl flex items-center justify-center">
                  {/* Placeholder illustration - Form/Pencil */}
                  <svg className="w-24 h-24 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute top-0 right-1/4 w-12 h-12 bg-orange-600 dark:bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Submit Once
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Fill out one simple form with your service needs, budget, and availability
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-3xl flex items-center justify-center">
                  {/* Placeholder illustration - Multiple Messages */}
                  <svg className="w-24 h-24 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="absolute top-0 right-1/4 w-12 h-12 bg-orange-600 dark:bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Get Multiple Quotes
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Businesses respond directly to you with their best offers and availability
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-3xl flex items-center justify-center">
                  {/* Placeholder illustration - Checkmark/Star */}
                  <svg className="w-24 h-24 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute top-0 right-1/4 w-12 h-12 bg-orange-600 dark:bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Choose the Best
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Compare responses, view portfolios, and book the perfect match for your needs
              </p>
            </div>
          </div>
        </div>

        {/* For Business Owners */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
            For Business Owners
          </h3>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-3xl flex items-center justify-center">
                  {/* Placeholder illustration - Building/Store */}
                  <svg className="w-24 h-24 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="absolute top-0 right-1/4 w-12 h-12 bg-orange-600 dark:bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                List FREE
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Create your profile in 5 minutes. Connect your Instagram. No credit card required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-3xl flex items-center justify-center">
                  {/* Placeholder illustration - Bell/Notification */}
                  <svg className="w-24 h-24 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="absolute top-0 right-1/4 w-12 h-12 bg-orange-600 dark:bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Receive Requests
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Get notified instantly when customers in your area need your services
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-3xl flex items-center justify-center">
                  {/* Placeholder illustration - Money/Success */}
                  <svg className="w-24 h-24 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute top-0 right-1/4 w-12 h-12 bg-orange-600 dark:bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Win Clients
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Respond with your best offer, showcase your work, and convert leads into paying clients
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
