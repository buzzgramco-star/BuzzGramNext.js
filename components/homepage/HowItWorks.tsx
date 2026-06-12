const steps = [
  {
    number: '01',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Describe what you need',
    description: 'Type naturally, like texting a friend — "nail tech under $60 this weekend" or "help me plan my summer wedding." Our AI understands context, budget, and occasion.',
  },
  {
    number: '02',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 00-1.1 2.028l-.3 1.5a.75.75 0 01-.734.598H8.741a.75.75 0 01-.734-.598l-.3-1.5a3.75 3.75 0 00-1.1-2.028l-.347-.347z" />
      </svg>
    ),
    title: 'AI finds your best match',
    description: 'BuzzGram AI scans hundreds of local vendors and ranks the best ones for your exact request — grouped by category so you can compare at a glance.',
  },
  {
    number: '03',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Connect & book directly',
    description: 'Browse vendor profiles, check their Instagram portfolio, and reach out directly. No middleman, no fees — just you and the perfect vendor.',
  },
];

export default function HowItWorks() {
  return (
    <div className="bg-white dark:bg-dark-bg py-16 sm:py-24 border-t border-gray-100 dark:border-dark-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-600 dark:text-orange-500 mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            From idea to vendor in seconds
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-start">
              {/* Dashed connector (desktop only) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(100%_-_8px)] w-full h-px border-t-2 border-dashed border-gray-200 dark:border-dark-border" />
              )}

              {/* Icon */}
              <div className="relative z-10 w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center mb-4 shadow-md flex-shrink-0">
                {step.icon}
              </div>

              <p className="text-xs font-bold tracking-widest text-orange-400 uppercase mb-2">{step.number}</p>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
