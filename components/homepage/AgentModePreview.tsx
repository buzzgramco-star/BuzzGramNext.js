'use client';

import { useState, useEffect, useRef } from 'react';

// Scripted, non-functional concept preview of a proposed "Agent Mode" —
// deliberately built to look like the real AIChatSearch UI (same message
// thread, same bordered input bar with city selector + controls at the
// bottom), with Agent Mode as one more control slotted into that bar, not a
// separately-branded demo card. The page section wrapping this already says
// "Concept Preview" in its heading, so this component itself should read as
// "the same chat, plus a toggle" rather than a new product.
//
// A simulated cursor clicks the toggle, then the AI proactively asks a
// clarifying question, gets a quick reply, builds a live checklist across a
// realistic wedding vendor spread (planner, photographer, florist, hair &
// makeup), recommends vendors, offers to draft a quote request, and the same
// cursor clicks "Send" on the draft before everything resets. Nothing here
// is wired to a backend; every bubble, tick, and click is on a timer.

const QUERY_1 = "I'm getting married in September, need help finding vendors";
const CLARIFYING = "Congrats! 🎉 Let's build your vendor list. What's your total budget, and which do you need: planner, photographer, florist, caterer, hair & makeup, or DJ?";
const QUERY_2 = 'Budget around $12,000 total. Need a planner, photographer, florist, and hair & makeup for now.';
const RESPONSE = "Great, here's who I'd start with in Toronto:";
const OFFER = 'Want me to draft a quote request to send to a few vendors like these?';
const CHECKLIST = ['Planning', 'Photography', 'Florals', 'Hair & Makeup'];

const VENDORS = [
  { name: 'Events by Leila', handle: '@eventsbyleila', detail: 'Full Planning · From $1,200' },
  { name: 'Capture Moments', handle: '@capturemoments', detail: 'Photography · From $800' },
  { name: 'Bloom & Co.', handle: '@bloomandco_', detail: 'Florals & Decor · From $400' },
  { name: 'Glam Squad Toronto', handle: '@glamsquadto', detail: 'Hair & Makeup · From $350' },
];

const QUOTE_DRAFT = {
  categories: ['Planning', 'Photography', 'Florals', 'Hair & Makeup'],
  city: 'Toronto',
  budget: '$12,000',
  eventDate: 'September 20',
  message: 'Looking for a planner, photographer, florist, and hair/makeup artist for my wedding this September.',
};

const CHAR_DELAY = 42;
const THINK_MS = 1300;
const TIME_SAVED_TARGET = 5.5;

// Step timeline — see the scheduling effect below for exact offsets.
// 0 idle · 1 cursor at toggle · 2 click + toggle on · 3 typing query 1
// 4 thinking 1 · 5 clarifying shown · 6 quick reply shown · 7 thinking 2
// 8 response shown · 9-12 checklist ticks 1-4 · 13 vendors + time-saved counter
// 14 offer shown · 15 quote draft shown · 16 cursor -> send · 17 click + "Sent!"
// 18 hold, then loop

export default function AgentModePreview() {
  const [step, setStep] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [timeSaved, setTimeSaved] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cursorStyle, setCursorStyle] = useState<{ top: number; left: number; visible: boolean; pressed: boolean }>({ top: 0, left: 0, visible: false, pressed: false });

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const sendBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Keeps the newest message in view, matching the real chat's auto-scroll.
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [step, typedChars]);

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
      setStep(15);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    setTypedChars(0);
    setTimeSaved(0);
    setCursorStyle(s => ({ ...s, visible: false, pressed: false }));
    setStep(0);

    let t = 500;
    timeouts.push(setTimeout(() => { setStep(1); moveCursorTo('toggle'); }, t)); // cursor appears at toggle
    t += 700;
    timeouts.push(setTimeout(() => { setStep(2); setCursorStyle(s => ({ ...s, pressed: true })); }, t)); // click + toggle on
    t += 500;
    timeouts.push(setTimeout(() => setCursorStyle(s => ({ ...s, visible: false, pressed: false })), t));

    t += 400;
    timeouts.push(setTimeout(() => setStep(3), t)); // start typing query 1
    for (let i = 1; i <= QUERY_1.length; i++) {
      timeouts.push(setTimeout(() => setTypedChars(i), t + i * CHAR_DELAY));
    }
    t += QUERY_1.length * CHAR_DELAY + 500;
    timeouts.push(setTimeout(() => setStep(4), t)); // thinking 1
    t += THINK_MS;
    timeouts.push(setTimeout(() => setStep(5), t)); // clarifying shown
    t += 2600;
    timeouts.push(setTimeout(() => setStep(6), t)); // quick reply shown
    t += 900;
    timeouts.push(setTimeout(() => setStep(7), t)); // thinking 2
    t += THINK_MS;
    timeouts.push(setTimeout(() => setStep(8), t)); // response shown
    t += 600;
    for (let i = 0; i < CHECKLIST.length; i++) {
      t += 420;
      timeouts.push(setTimeout(() => setStep(9 + i), t)); // checklist ticks, one at a time
    }
    t += 500;
    timeouts.push(setTimeout(() => setStep(13), t)); // vendors + counter start
    const COUNTER_STEPS = 9;
    for (let i = 1; i <= COUNTER_STEPS; i++) {
      timeouts.push(setTimeout(() => setTimeSaved(Number(((TIME_SAVED_TARGET * i) / COUNTER_STEPS).toFixed(1))), t + i * 100));
    }
    t += 1900;
    timeouts.push(setTimeout(() => setStep(14), t)); // offer shown
    t += 1500;
    timeouts.push(setTimeout(() => setStep(15), t)); // quote draft shown
    t += 1800;
    timeouts.push(setTimeout(() => moveCursorTo('send'), t));
    timeouts.push(setTimeout(() => setStep(16), t));
    t += 750;
    timeouts.push(setTimeout(() => { setStep(17); setCursorStyle(s => ({ ...s, pressed: true })); }, t)); // click + Sent!
    t += 2000;
    timeouts.push(setTimeout(() => setCursorStyle(s => ({ ...s, visible: false, pressed: false })), t));
    t += 1200;
    timeouts.push(setTimeout(() => setLoopCount(c => c + 1), t));

    return () => timeouts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, loopCount]);

  const toggleOn = step >= 2;

  return (
    <div ref={containerRef} className="relative">
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

      {/* Message thread — fixed height + internal scroll, same as the real chat's compact mode */}
      <div ref={messagesRef} className="max-h-[360px] overflow-y-auto pr-1 mb-3 space-y-4">
        {step < 3 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-10">
            {step < 2 ? 'Turning on Agent Mode…' : 'Agent Mode on — planning ahead automatically.'}
          </p>
        ) : (
          <>
            <div className="flex justify-end">
              <div className="bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs text-sm leading-relaxed">
                {QUERY_1.slice(0, typedChars)}
                {step === 3 && (
                  <span className="inline-block w-px h-4 bg-white/80 ml-px animate-pulse align-middle" />
                )}
              </div>
            </div>

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
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{CLARIFYING}</p>
                  )}
                </div>
              </div>
            )}

            {step >= 6 && (
              <div className="flex justify-end">
                <div className="bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs text-sm leading-relaxed">
                  {QUERY_2}
                </div>
              </div>
            )}

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

                      {/* Live checklist — ticks in one category at a time */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {CHECKLIST.map((c, i) => (
                          <span
                            key={c}
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full transition-all duration-300 ${
                              step >= 9 + i
                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 opacity-100'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-60'
                            }`}
                          >
                            {step >= 9 + i ? '✓' : '·'} {c}
                          </span>
                        ))}
                      </div>

                      {step >= 13 && (
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

                          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full mb-3">
                            ⏱ Est. time saved: {timeSaved.toFixed(1)} hrs
                          </div>
                        </>
                      )}

                      {step >= 14 && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                          {OFFER}
                        </p>
                      )}

                      {step >= 15 && (
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
                            {step >= 17 ? (
                              <div className="flex-1 text-center text-xs font-semibold text-white bg-orange-600 rounded-lg py-1.5 flex items-center justify-center gap-1">
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
                                  className={`flex-1 text-center text-xs font-semibold text-white bg-orange-600 rounded-lg py-1.5 transition-transform ${cursorStyle.pressed && step === 17 ? 'scale-95' : ''}`}
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

      {/* Input bar — mirrors the real chat's exact bottom bar, Agent Mode is
          just one more control slotted into it, next to the city selector */}
      <div className="relative border-2 border-gray-200 dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card shadow-sm">
        <div className="w-full px-5 pt-4 pb-14 text-sm text-gray-400 dark:text-gray-500 select-none">
          Ask a follow-up...
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Toronto
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </span>

            <div ref={toggleRef} className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 dark:text-gray-500">Agent Mode</span>
              <div className={`w-8 h-4.5 rounded-full transition-colors duration-300 relative ${toggleOn ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'}`} style={{ height: '18px' }}>
                <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform duration-300 ${toggleOn ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">Clear chat</span>
            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
