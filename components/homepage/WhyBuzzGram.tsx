const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Hidden gems, finally found',
    description: 'BuzzGram specializes in home-based and Instagram businesses — talented nail techs, bakers, photographers, and event planners who operate outside the traditional listings. The kind of vendors your friends rave about but you can never find on Google.',
    highlight: 'Home-based & Instagram businesses',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Your city, fully covered',
    description: 'We\'re live across 10 major cities in Canada and the US — Toronto, Vancouver, Calgary, Montreal, Ottawa, New York, Los Angeles, Miami, Chicago, and Phoenix. More cities coming soon.',
    highlight: '10 cities across North America',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 00-1.1 2.028l-.3 1.5a.75.75 0 01-.734.598H8.741a.75.75 0 01-.734-.598l-.3-1.5a3.75 3.75 0 00-1.1-2.028l-.347-.347z" />
      </svg>
    ),
    title: 'AI that actually understands',
    description: 'Unlike a search bar, our AI understands what you mean. Planning an event? It builds a checklist. Looking for a vendor? It ranks by relevance, budget, and vibe. Ask follow-ups, refine results, and keep the conversation going.',
    highlight: 'Conversational AI discovery',
  },
];

export default function WhyBuzzGram() {
  return (
    <div className="bg-gray-50 dark:bg-dark-card py-16 sm:py-24 border-t border-gray-100 dark:border-dark-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-600 dark:text-orange-500 mb-3">About BuzzGram</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            A smarter way to find local vendors
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We built BuzzGram because the best local vendors — the ones your friends rave about — were impossible to find online. We changed that.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <span className="inline-block text-xs font-semibold text-orange-600 dark:text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1 rounded-full mb-3">
                  {f.highlight}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
