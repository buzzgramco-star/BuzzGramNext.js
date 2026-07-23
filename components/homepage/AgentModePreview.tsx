'use client';

import { useState, useEffect, useRef } from 'react';

// Scripted, non-functional concept preview of a proposed "Agent Mode" — a
// simulated cursor clicks a toggle near a mock city selector, then the AI
// proactively asks a clarifying question, gets a quick reply, recommends
// vendors (ticking a live checklist as it goes), offers to draft a quote
// request, and the same simulated cursor clicks "Send" on the draft before
// everything resets. Nothing here is wired to a backend; every bubble, tick,
// and click is on a timer, same mechanic as AIDemoPreview (typing -> thinking
// -> reveal), reusing its exact visual language.

const QUERY_1 = "I'm getting married in September, need help finding vendors";
const CLARIFYING = 'Congrats! 🎉 A couple quick things: what\'s your budget, and which vendors first, photographer, florist, or planner?';
const QUERY_2 = 'Budget around $3,000. Need a florist and photographer for now.';
const RESPONSE = "Great, here's who I'd start with in Toronto:";
const OFFER = 'Want me to draft a quote request to send to a few vendors like these?';
const CHECKLIST = ['Florals', 'Photography'];

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
const TIME_SAVED_TARGET = 2.5;

// Step timeline — see the scheduling effect below for exact offsets.
// 0 idle (toggle off, cursor hidden) · 1 cursor -> toggle · 2 click + toggle on
// 3 typing query 1 · 4 thinking 1 · 5 clarifying shown · 6 quick reply shown
// 7 thinking 2 · 8 response shown · 9 checklist tick 1 · 10 checklist tick 2 + vendors + time-saved counter starts
// 11 offer shown · 12 quote draft shown · 13 cursor -> send · 14 click + "Sent!" · 15 hold, then loop

export default function AgentModePreview() {
  const [step, setStep] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [timeSaved, setTimeSaved] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cursorStyle, setCursorStyle] = useState<{ top: number; left: number; visible: boolean; pressed: boolean }>({ top: 0, left: 0, visible: false, pressed: false });

  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const sendBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const moveCursorTo = (target: 'toggle' | 'send', pressed = false) => {
    const container = containerRef.current;
    const el = target === 'toggle' ? toggleRef.current : sendBtnRef.current;
    if (!container || !el) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setCursorStyle({
      top: eRect.top - cRect.top + eRect.height / 2 - 10,
      left: eRect.left - cRect.left + eRect.width / 2 - 10,
      visible: true,
      pressed,
    });
  };

  useEffect(() => {
    if (reducedMotion) {
      setTypedChars(QUERY_1.length);
      setTimeSaved(TIME_SAVED_TARGET);
      setStep(12);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    setTypedChars(0);
    setTimeSaved(0);
    setCursorStyle(s => ({ ...s, visible: false, pressed: false }));
    setStep(0);

    let t = 500;
    timeouts.push(setTimeout(() => { setStep(1); moveCursorTo('toggle'); }, t)); // cursor approaches toggle
    t += 750;
    timeouts.push(setTimeout(() => { setStep(2); setCursorStyle(s => ({ ...s, pressed: true })); }, t)); // click + toggle on
    t += 500;
    timeouts.push(setTimeout(() => setCursorStyle(s => ({ ...s, visible: false, pressed: false })), t)); // cursor fades, work begins

    t += 400;
    timeouts.push(setTimeout(() => setStep(3), t)); // start typing query 1
    for (let i = 1; i <= QUERY_1.length; i++) {
      timeouts.push(setTimeout(() => setTypedChars(i), t + i * CHAR_DELAY));
    }
    t += QUERY_1.length * CHAR_DELAY + 500;
    timeouts.push(setTimeout(() => setStep(4), t)); // thinking 1
    t += THINK_MS;
    timeouts.push(setTimeout(() => setStep(5), t)); // clarifying shown
    t += 2400;
    timeouts.push(setTimeout(() => setStep(6), t)); // quick reply shown
    t += 900;
    timeouts.push(setTimeout(() => setStep(7), t)); // thinking 2
    t += THINK_MS;
    timeouts.push(setTimeout(() => setStep(8), t)); // response shown
    t += 700;
    timeouts.push(setTimeout(() => setStep(9), t)); // checklist tick 1
    t += 500;
    timeouts.push(setTimeout(() => setStep(10), t)); // checklist tick 2 + vendors + counter starts
    // time-saved counter ticks up over ~900ms
    const COUNTER_STEPS = 9;
    for (let i = 1; i <= COUNTER_STEPS; i++) {
      timeouts.push(setTimeout(() => setTimeSaved(Number(((TIME_SAVED_TARGET * i) / COUNTER_STEPS).toFixed(1))), t + i * 100));
    }
    t += 1700;
    timeouts.push(setTimeout(() => setStep(11), t)); // offer shown
    t += 1500;
    timeouts.push(setTimeout(() => setStep(12), t)); // quote draft shown
    t += 1700;
    timeouts.push(setTimeout(() => moveCursorTo('send'), t)); // cursor approaches Send
    timeouts.push(setTimeout(() => setStep(13), t));
    t += 750;
    timeouts.push(setTimeout(() => { setStep(14); setCursorStyle(s => ({ ...s, pressed: true })); }, t)); // click + Sent!
    t += 2000;
    timeouts.push(setTimeout(() => setCursorStyle(s => ({ ...s, visible: false, pressed: false })), t));
    t += 1200; // hold on "Sent!" before resetting
    timeouts.push(setTimeout(() => setLoopCount(c => c + 1), t));

    return () => timeouts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, loopCount]);

  const toggleOn = step >= 2;

  return (
    <div ref={containerRef} className="relative rounded-xl">
      {/* Simulated cursor */}
      {cursorStyle.visible && (
        <div
          className={`absolute z-10 pointer-events-none transition-all duration-700 ease-out ${cursorStyle.pressed ? 'scale-75' : 'scale-100'}`}
          style={{ top: cursorStyle.top, left: cursorStyle.left }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" className="drop-shadow-md">
            <path d="M2 1l6 16 2.5-6L17 8.5 2 1z" fill="white" stroke="#1f2937" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </div>
      )}

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

      {/* Mock city selector + Agent Mode toggle — this is what the cursor clicks */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-dark-border">
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Toronto
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Agent Mode</span>
          <div
            ref={toggleRef}
            className={`w-9 h-5 rounded-full transition-colors duration-300 relative ${toggleOn ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${toggleOn ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </div>
      </div>

      {step < 3 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">
          {step < 2 ? 'Turning on Agent Mode…' : 'Agent Mode on — planning ahead automatically.'}
        </p>
      ) : (
        <>
          {/* User message 1 */}
          <div className="flex justify-end mb-4">
            <div className="bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs text-sm leading-relaxed">
              {QUERY_1.slice(0, typedChars)}
              {step === 3 && (
                <span className="inline-block w-px h-4 bg-white/80 ml-px animate-pulse align-middle" />
              )}
            </div>
          </div>

          {/* AI turn 1: thinking -> clarifying question */}
          {step >= 4 && (
            <div className="flex gap-3 mb-4">
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
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{CLARIFYING}</p>
                )}
              </div>
            </div>
          )}

          {/* User message 2 — quick reply, fades in */}
          {step >= 6 && (
            <div className="flex justify-end mb-4">
              <div className="bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs text-sm leading-relaxed">
                {QUERY_2}
              </div>
            </div>
          )}

          {/* AI turn 2: thinking -> response -> checklist -> vendors -> offer -> quote draft */}
          {step >= 7 && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {step === 7 ? (
                  <div className="flex items-center gap-1.5 py-2">
                    <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '160ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '320ms' }} />
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">{RESPONSE}</p>

                    {/* Live checklist — ticks in as the agent locks in each category */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {CHECKLIST.map((c, i) => (
                        <span
                          key={c}
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full transition-all duration-300 ${
                            step >= 9 + i
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 opacity-100'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-60'
                          }`}
                        >
                          {step >= 9 + i ? '✓' : '·'} {c}
                        </span>
                      ))}
                    </div>

                    {step >= 10 && (
                      <>
                        <div className="flex gap-3 overflow-x-auto pb-1 max-w-full mb-2">
                          {VENDORS.map((v, i) => (
                            <div key={i} className="flex-shrink-0 w-44 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl p-3">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate mb-0.5">{v.name}</p>
                              <p className="text-xs text-orange-500 mb-1.5 truncate">{v.handle}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">{v.detail}</p>
                            </div>
                          ))}
                        </div>

                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full mb-3">
                          ⏱ Est. time saved: {timeSaved.toFixed(1)} hrs
                        </div>
                      </>
                    )}

                    {step >= 11 && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                        {OFFER}
                      </p>
                    )}

                    {step >= 12 && (
                      <div className="bg-white dark:bg-dark-bg border border-orange-200 dark:border-orange-800 rounded-xl p-3">
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
                          {step >= 14 ? (
                            <div className="flex-1 text-center text-xs font-semibold text-white bg-green-600 rounded-lg py-1.5 flex items-center justify-center gap-1 transition-all">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              Sent!
                            </div>
                          ) : (
                            <>
                              <span className="flex-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-border rounded-lg py-1.5">
                                Cancel
                              </span>
                              <span
                                ref={sendBtnRef}
                                className={`flex-1 text-center text-xs font-semibold text-white bg-orange-600 rounded-lg py-1.5 transition-transform ${cursorStyle.pressed && step === 14 ? 'scale-95' : ''}`}
                              >
                                Send Request
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
