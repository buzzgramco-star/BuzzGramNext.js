'use client';

import { useState, useEffect } from 'react';

interface DemoVendor {
  name: string;
  handle: string;
  detail: string;
}

interface Demo {
  buildQuery: (city?: string | null) => string;
  response: string;
  vendors: DemoVendor[];
}

const DEMOS: Demo[] = [
  {
    buildQuery: city => city ? `nail tech in ${city} under $60` : 'nail tech under $60 this weekend',
    response: "Found some great nail techs available this weekend under $60. All home-based and Instagram-only.",
    vendors: [
      { name: 'Glam Nails by Sara', handle: '@glamnailsbysara', detail: 'Full Set · From $45' },
      { name: 'Polish & Co.', handle: '@polishandco', detail: 'Gel Mani · $55' },
      { name: 'Nails by Mia', handle: '@nailsbymia_', detail: 'Acrylic Set · From $50' },
    ],
  },
  {
    buildQuery: () => 'help me plan my summer wedding',
    response: "Let's get your wedding sorted. Here are some vendors I'd recommend to start with.",
    vendors: [
      { name: 'Events by Leila', handle: '@eventsbyleila', detail: 'Full Planning · From $1,200' },
      { name: 'Bloom & Co.', handle: '@bloomandco_', detail: 'Florals & Decor · From $400' },
      { name: 'Capture Moments', handle: '@capturemoments', detail: 'Photography · From $800' },
    ],
  },
  {
    buildQuery: city => city ? `custom birthday cake in ${city} under $100` : 'custom birthday cake under $100',
    response: "Here are some home bakers who do custom birthday cakes under $100.",
    vendors: [
      { name: 'Sweet by Danielle', handle: '@sweetbydanielle', detail: 'Custom Cakes · From $80' },
      { name: 'Cakes by Priya', handle: '@cakesbypriya', detail: 'Birthday Cakes · From $75' },
      { name: 'The Cake Lab', handle: '@thecakelab_', detail: 'Custom Cakes · From $90' },
    ],
  },
];

type Phase = 'typing' | 'thinking' | 'responding';

interface AIDemoPreviewProps {
  /** Personalizes demo queries, e.g. "nail tech in Toronto under $60" */
  cityName?: string | null;
  /** Called with the current demo query when the user taps the demo */
  onTry?: (query: string) => void;
}

export default function AIDemoPreview({ cityName, onTry }: AIDemoPreviewProps) {
  const [demoIndex, setDemoIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');
  const [typedChars, setTypedChars] = useState(0);
  const [showVendors, setShowVendors] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const demo = DEMOS[demoIndex];
  const query = demo.buildQuery(cityName);

  // Plays one demo scenario: type the query, think, respond, reveal vendors.
  useEffect(() => {
    if (reducedMotion) {
      setTypedChars(query.length);
      setPhase('responding');
      setShowVendors(true);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    setTypedChars(0);
    setPhase('typing');
    setShowVendors(false);

    const CHAR_DELAY = 48;
    for (let i = 1; i <= query.length; i++) {
      timeouts.push(setTimeout(() => setTypedChars(i), i * CHAR_DELAY));
    }

    const typingEnd = query.length * CHAR_DELAY + 500;
    timeouts.push(setTimeout(() => setPhase('thinking'), typingEnd));
    timeouts.push(setTimeout(() => setPhase('responding'), typingEnd + 1300));
    timeouts.push(setTimeout(() => setShowVendors(true), typingEnd + 1800));

    return () => timeouts.forEach(clearTimeout);
  }, [demoIndex, query, reducedMotion]);

  // Advances to the next scenario once vendors have been visible; pauses while hovered.
  useEffect(() => {
    if (!showVendors || isHovered || reducedMotion) return;
    const id = setTimeout(() => setDemoIndex(prev => (prev + 1) % DEMOS.length), 4200);
    return () => clearTimeout(id);
  }, [showVendors, isHovered, reducedMotion]);

  const handleTry = () => onTry?.(query);
  // Without onTry the demo is display-only: no tap affordance, no misleading hint
  const interactive = !!onTry;

  return (
    <div
      {...(interactive ? {
        role: 'button',
        tabIndex: 0,
        'aria-label': `Try this search: ${query}`,
        onClick: handleTry,
        onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTry(); } },
      } : {})}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group rounded-xl -m-1 p-1 focus:outline-none ${interactive ? 'cursor-pointer transition-colors hover:bg-white/60 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-orange-500' : ''}`}
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          Live demo
        </span>
        {interactive && (
          <span className="text-[11px] font-medium text-orange-600 dark:text-orange-400 opacity-70 group-hover:opacity-100 transition-opacity">
            Tap to try it yourself →
          </span>
        )}
      </div>

      {/* User bubble */}
      <div className="flex justify-end mb-4">
        <div className="bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs text-sm leading-relaxed">
          {query.slice(0, typedChars)}
          {phase === 'typing' && (
            <span className="inline-block w-px h-4 bg-white/80 ml-px animate-pulse align-middle" />
          )}
        </div>
      </div>

      {/* AI bubble */}
      <div className="min-h-[120px]">
        {(phase === 'thinking' || phase === 'responding') && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              {phase === 'thinking' ? (
                <div className="flex items-center gap-1.5 py-2">
                  <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '160ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '320ms' }} />
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{demo.response}</p>

                  {/* Vendor cards */}
                  <div
                    className="flex gap-3 overflow-x-auto pb-1 transition-opacity duration-500"
                    style={{ opacity: showVendors ? 1 : 0 }}
                  >
                    {demo.vendors.map((v, i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-44 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl p-3"
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
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pt-3">
        {DEMOS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === demoIndex ? 'w-6 bg-orange-600' : 'w-1.5 bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
