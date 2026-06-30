'use client';

import { useState, useEffect, useRef } from 'react';

const DEMOS = [
  {
    query: 'nail tech under $60 this weekend',
    response: "Found some great nail techs available this weekend under $60. All home-based and Instagram-only.",
    vendors: [
      { name: 'Glam Nails by Sara', handle: '@glamnailsbysara', detail: 'Full Set · From $45' },
      { name: 'Polish & Co.', handle: '@polishandco', detail: 'Gel Mani · $55' },
      { name: 'Nails by Mia', handle: '@nailsbymia_', detail: 'Acrylic Set · From $50' },
    ],
  },
  {
    query: 'help me plan my summer wedding',
    response: "Let's get your wedding sorted. Here are some vendors I'd recommend to start with.",
    vendors: [
      { name: 'Events by Leila', handle: '@eventsbyleila', detail: 'Full Planning · From $1,200' },
      { name: 'Bloom & Co.', handle: '@bloomandco_', detail: 'Florals & Decor · From $400' },
      { name: 'Capture Moments', handle: '@capturemoments', detail: 'Photography · From $800' },
    ],
  },
  {
    query: 'custom birthday cake in NYC under $100',
    response: "Here are some home bakers in NYC who do custom birthday cakes under $100.",
    vendors: [
      { name: 'Sweet by Danielle', handle: '@sweetbydanielle', detail: 'Custom Cakes · From $80' },
      { name: 'Cakes by Priya', handle: '@cakesbypriya', detail: 'Birthday Cakes · From $75' },
      { name: 'The Cake Lab', handle: '@thecakelab_nyc', detail: 'Custom Cakes · From $90' },
    ],
  },
];

type Phase = 'typing' | 'thinking' | 'responding';

export default function AIDemoPreview() {
  const [demoIndex, setDemoIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [typedChars, setTypedChars] = useState(0);
  const [showVendors, setShowVendors] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    const demo = DEMOS[demoIndex];
    clearAll();
    setTypedChars(0);
    setPhase('typing');
    setShowVendors(false);

    const CHAR_DELAY = 48;
    const queryLen = demo.query.length;

    for (let i = 1; i <= queryLen; i++) {
      timeoutsRef.current.push(setTimeout(() => setTypedChars(i), i * CHAR_DELAY));
    }

    const typingEnd = queryLen * CHAR_DELAY + 500;
    timeoutsRef.current.push(setTimeout(() => setPhase('thinking'), typingEnd));
    timeoutsRef.current.push(setTimeout(() => setPhase('responding'), typingEnd + 1300));
    timeoutsRef.current.push(setTimeout(() => setShowVendors(true), typingEnd + 1800));
    timeoutsRef.current.push(setTimeout(() => {
      setDemoIndex(prev => (prev + 1) % DEMOS.length);
    }, typingEnd + 6000));

    return clearAll;
  }, [demoIndex]);

  const demo = DEMOS[demoIndex];

  const scrollToChat = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-50 dark:bg-dark-card py-16 sm:py-20 border-t border-gray-100 dark:border-dark-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-600 dark:text-orange-500 mb-3">See it in action</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Just describe what you need
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400">
            Watch how BuzzGram AI finds the right vendor in seconds.
          </p>
        </div>

        {/* Chat window */}
        <div className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-2xl p-5 sm:p-6 shadow-sm min-h-[340px] flex flex-col">

          {/* User bubble */}
          <div className="flex justify-end mb-5">
            <div className="bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs text-sm leading-relaxed">
              {demo.query.slice(0, typedChars)}
              {phase === 'typing' && (
                <span className="inline-block w-px h-4 bg-white/80 ml-px animate-pulse align-middle" />
              )}
            </div>
          </div>

          {/* AI bubble */}
          {(phase === 'thinking' || phase === 'responding') && (
            <div className="flex gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="flex-1">
                {phase === 'thinking' ? (
                  <div className="flex items-center gap-1.5 py-2">
                    <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '160ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '320ms' }} />
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{demo.response}</p>

                    {/* Vendor cards */}
                    <div
                      className="flex gap-3 overflow-x-auto pb-1 transition-opacity duration-500"
                      style={{ opacity: showVendors ? 1 : 0 }}
                    >
                      {demo.vendors.map((v, i) => (
                        <div
                          key={i}
                          className="flex-shrink-0 w-44 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-3"
                        >
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate mb-0.5">{v.name}</p>
                          <p className="text-xs text-orange-500 mb-1.5 truncate">{v.handle}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{v.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-5 pt-4 border-t border-gray-100 dark:border-dark-border">
            {DEMOS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: i === demoIndex ? '1.5rem' : '0.375rem',
                  backgroundColor: i === demoIndex ? '#ea580c' : '#e5e7eb',
                }}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <button
            onClick={scrollToChat}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-semibold text-sm rounded-xl hover:bg-orange-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Try it yourself
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
