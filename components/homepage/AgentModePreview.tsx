'use client';

import { useState, useEffect } from 'react';

// Scripted, non-functional concept preview of a proposed "Agent Mode" — the AI
// proactively asks clarifying questions and drafts a quote request for user
// approval, instead of only responding to explicit queries. Nothing here is
// wired to a backend; every bubble, card, and button is static content on a
// timer, same mechanic as AIDemoPreview (typing -> thinking -> reveal), reusing
// its exact visual language so this reads as "the same product, a future mode"
// rather than a different design language.

const QUERY_1 = "I'm getting married in September, need help finding vendors";
const CLARIFYING = 'Congrats! 🎉 A couple quick things: what\'s your budget, and which vendors first, photographer, florist, or planner?';
const QUERY_2 = 'Budget around $3,000. Need a florist and photographer for now.';
const RESPONSE = "Great, here's who I'd start with in Toronto:";
const OFFER = 'Want me to draft a quote request to send to a few vendors like these?';

const VENDORS = [
  { name: 'Bloom & Co.', handle: '@bloomandco_', detail: 'Florals & Decor · From $400' },
  { name: 'Capture Moments', handle: '@capturemoments', detail: 'Photography · From $800' },
];

const QUOTE_DRAFT = {
  categories: ['Florals', 'Photography'],
  city: 'Toronto',
  budget: '$3,000',
  eventDate: 'September 20',
  message: 'Looking for a florist and photographer for my wedding this September.',
};

const CHAR_DELAY = 42;
const THINK_MS = 1300;
const GAP_MS = 900;

export default function AgentModePreview() {
  const [step, setStep] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setTypedChars(QUERY_1.length);
      setStep(7);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    setTypedChars(0);
    setStep(0);

    for (let i = 1; i <= QUERY_1.length; i++) {
      timeouts.push(setTimeout(() => setTypedChars(i), i * CHAR_DELAY));
    }

    let t = QUERY_1.length * CHAR_DELAY + 500;
    timeouts.push(setTimeout(() => setStep(1), t));                  // thinking 1
    t += THINK_MS;
    timeouts.push(setTimeout(() => setStep(2), t));                  // clarifying question shown
    t += 2400;
    timeouts.push(setTimeout(() => setStep(3), t));                  // user's quick reply appears
    t += GAP_MS;
    timeouts.push(setTimeout(() => setStep(4), t));                  // thinking 2
    t += THINK_MS;
    timeouts.push(setTimeout(() => setStep(5), t));                  // response + vendor cards
    t += 1800;
    timeouts.push(setTimeout(() => setStep(6), t));                  // proactive offer
    t += 1500;
    timeouts.push(setTimeout(() => setStep(7), t));                  // quote draft card
    t += 5500;                                                       // hold, then loop
    timeouts.push(setTimeout(() => setLoopCount(c => c + 1), t));

    return () => timeouts.forEach(clearTimeout);
  }, [reducedMotion, loopCount]);

  return (
    <div className="rounded-xl">
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          Agent Mode
        </span>
        <span className="text-[11px] font-medium text-orange-600 dark:text-orange-400">
          Concept preview · not yet available
        </span>
      </div>

      {/* User message 1 */}
      <div className="flex justify-end mb-4">
        <div className="bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs text-sm leading-relaxed">
          {QUERY_1.slice(0, typedChars)}
          {step === 0 && (
            <span className="inline-block w-px h-4 bg-white/80 ml-px animate-pulse align-middle" />
          )}
        </div>
      </div>

      {/* AI turn 1: thinking -> clarifying question */}
      {step >= 1 && (
        <div className="flex gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            {step === 1 ? (
              <div className="flex items-center gap-1.5 py-2">
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '160ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '320ms' }} />
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{CLARIFYING}</p>
            )}
          </div>
        </div>
      )}

      {/* User message 2 — quick reply, fades in (no re-typing) */}
      {step >= 3 && (
        <div className="flex justify-end mb-4 transition-opacity duration-500" style={{ opacity: 1 }}>
          <div className="bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs text-sm leading-relaxed">
            {QUERY_2}
          </div>
        </div>
      )}

      {/* AI turn 2: thinking -> response + vendors -> offer -> quote draft */}
      {step >= 4 && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            {step === 4 ? (
              <div className="flex items-center gap-1.5 py-2">
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '160ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '320ms' }} />
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{RESPONSE}</p>

                <div className="flex gap-3 overflow-x-auto pb-1 max-w-full mb-3">
                  {VENDORS.map((v, i) => (
                    <div key={i} className="flex-shrink-0 w-44 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate mb-0.5">{v.name}</p>
                      <p className="text-xs text-orange-500 mb-1.5 truncate">{v.handle}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{v.detail}</p>
                    </div>
                  ))}
                </div>

                {step >= 6 && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed transition-opacity duration-500" style={{ opacity: 1 }}>
                    {OFFER}
                  </p>
                )}

                {step >= 7 && (
                  <div
                    className="bg-white dark:bg-dark-bg border border-orange-200 dark:border-orange-800 rounded-xl p-3 transition-opacity duration-500"
                    style={{ opacity: 1 }}
                  >
                    <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                      Quote Request <span className="font-normal text-gray-400 dark:text-gray-500">· review before sending</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {QUOTE_DRAFT.categories.map(c => (
                        <span key={c} className="text-[11px] font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">
                          {c}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-1 text-xs mb-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">City</span>
                        <span className="font-medium text-gray-900 dark:text-white">{QUOTE_DRAFT.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Budget</span>
                        <span className="font-medium text-gray-900 dark:text-white">{QUOTE_DRAFT.budget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Event date</span>
                        <span className="font-medium text-gray-900 dark:text-white">{QUOTE_DRAFT.eventDate}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{QUOTE_DRAFT.message}</p>
                    <div className="flex gap-2">
                      <span className="flex-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-border rounded-lg py-1.5">
                        Cancel
                      </span>
                      <span className="flex-1 text-center text-xs font-semibold text-white bg-orange-600 rounded-lg py-1.5">
                        Send Request
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
