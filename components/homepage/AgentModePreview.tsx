'use client';

import { useState, useEffect, useRef } from 'react';

// Scripted, non-functional concept preview of a proposed "Agent Mode" —
// deliberately built to look like the real AIChatSearch UI (same message
// thread, same bordered input bar with city selector + controls at the
// bottom), with Agent Mode as one more control slotted into that bar, not a
// separately-branded demo card. The page section wrapping this already says
// "Coming Soon" in its heading, so this component itself should read as
// "the same chat, plus a toggle" rather than a new product.
//
// A simulated cursor clicks the toggle, then the AI proactively asks a
// clarifying question, gets a quick reply, shows its reasoning, builds a
// live checklist + budget summary across a realistic vendor spread, then
// offers a small menu of next actions (not just one) plus a "keep going"
// follow-up line — the same cursor clicks "Draft quote" from that menu,
// reveals the draft, and clicks "Send" before everything resets. Each loop
// cycles to the next of three scenarios (wedding, birthday, baby shower),
// deliberately varied in category count, budget, and vendor count so it
// doesn't read as the same numbers re-skinned. Nothing here is wired to a
// backend; every bubble, tick, and click is on a timer.

type Vendor = { name: string; handle: string; detail: string; price: number };

type Scenario = {
  planLabel: string;
  query1: string;
  clarifying: string;
  query2: string;
  reasoningIntro: string;
  reasoningFactors: string[];
  response: string;
  checklist: string[];
  vendors: Vendor[];
  totalBudget: number;
  timeSavedTarget: number;
  quoteDraft: { categories: string[]; city: string; budget: string; eventDate: string; message: string };
};

const SCENARIOS: Scenario[] = [
  {
    planLabel: 'Wedding Plan',
    query1: "I'm getting married in September, need help finding vendors",
    clarifying: "Congrats! 🎉 Let's build your vendor list. What's your total budget, and which do you need: planner, photographer, florist, caterer, hair & makeup, or DJ?",
    query2: 'Budget around $12,000 total. Need a planner, photographer, florist, and hair & makeup for now.',
    reasoningIntro: 'I found 24 matching vendors in Toronto. Based on:',
    reasoningFactors: ['Budget ($12,000)', 'Wedding', 'Availability', 'Ratings'],
    response: "Here's who I'd start with:",
    checklist: ['Planning', 'Photography', 'Florals', 'Hair & Makeup'],
    vendors: [
      { name: 'Events by Leila', handle: '@eventsbyleila', detail: 'Full Planning · From $2,800', price: 2800 },
      { name: 'Capture Moments', handle: '@capturemoments', detail: 'Photography · From $3,200', price: 3200 },
      { name: 'Bloom & Co.', handle: '@bloomandco_', detail: 'Florals & Decor · From $2,200', price: 2200 },
      { name: 'Glam Squad Toronto', handle: '@glamsquadto', detail: 'Hair & Makeup · From $600', price: 600 },
    ],
    totalBudget: 12000,
    timeSavedTarget: 5.5,
    quoteDraft: {
      categories: ['Planning', 'Photography', 'Florals', 'Hair & Makeup'],
      city: 'Toronto',
      budget: '$12,000',
      eventDate: 'September 20',
      message: 'Looking for a planner, photographer, florist, and hair/makeup artist for my wedding this September.',
    },
  },
  {
    planLabel: '30th Birthday Plan',
    query1: 'Turning 30 next month, want to throw a big party — need help finding people',
    clarifying: "Happy early birthday! 🎉 What's your budget, and do you need venue & decor, catering, photography, or all three?",
    query2: 'Budget is about $4,000. Need venue decor, catering, and a photographer.',
    reasoningIntro: 'I found 15 matching vendors in Toronto. Based on:',
    reasoningFactors: ['Budget ($4,000)', 'Birthday Party', 'Availability', 'Ratings'],
    response: "Here's who I'd start with:",
    checklist: ['Venue & Decor', 'Catering', 'Photography'],
    vendors: [
      { name: 'Luxe Decor Events', handle: '@luxedecorevents', detail: 'Venue & Decor · From $1,400', price: 1400 },
      { name: 'Savour Catering Co.', handle: '@savourcateringco', detail: 'Catering · From $1,800', price: 1800 },
      { name: 'Flash & Frame Photography', handle: '@flashandframe', detail: 'Photography · From $650', price: 650 },
    ],
    totalBudget: 4000,
    timeSavedTarget: 3.2,
    quoteDraft: {
      categories: ['Venue & Decor', 'Catering', 'Photography'],
      city: 'Toronto',
      budget: '$4,000',
      eventDate: 'August 16',
      message: 'Planning a 30th birthday party and need venue decor, catering, and a photographer for August 16.',
    },
  },
  {
    planLabel: 'Baby Shower Plan',
    query1: 'Planning a baby shower for my sister, need vendors in Toronto',
    clarifying: "So exciting! 🎉 What's your budget, and do you need catering & decor, photography, or both?",
    query2: 'Budget around $1,200. Need catering & decor, and a photographer would be nice too.',
    reasoningIntro: 'I found 11 matching vendors in Toronto. Based on:',
    reasoningFactors: ['Budget ($1,200)', 'Baby Shower', 'Availability', 'Ratings'],
    response: "Here's who I'd start with:",
    checklist: ['Catering & Decor', 'Photography'],
    vendors: [
      { name: 'Petite Bites Catering & Decor', handle: '@petitebitesco', detail: 'Catering & Decor · From $850', price: 850 },
      { name: 'Lens & Light Photography', handle: '@lensandlight', detail: 'Photography · From $300', price: 300 },
    ],
    totalBudget: 1200,
    timeSavedTarget: 1.8,
    quoteDraft: {
      categories: ['Catering & Decor', 'Photography'],
      city: 'Toronto',
      budget: '$1,200',
      eventDate: 'September 12',
      message: 'Planning a baby shower for my sister on September 12 in Toronto — need catering & decor and a photographer.',
    },
  },
];

const NEXT_STEPS_INTRO = "Here's what I can do next:";
const AGENT_OPTIONS = ['Draft quote', 'Compare prices', 'Find cheaper alternatives', 'Save this plan'];
const FOLLOW_UP_PROMPTS = ['lower the budget', 'show premium options', 'find weekend availability', 'replace a vendor'];

const CHAR_DELAY = 42;
const THINK_MS = 1300;

// Step timeline — offsets computed relative to each scenario's checklist
// length (which varies: 4/3/2 across scenarios), see STEP_* below, derived
// per-render from the active scenario.
// 0 idle · 1 cursor at toggle · 2 click + toggle on · 3 typing query 1
// 4 thinking 1 · 5 clarifying shown · 6 quick reply shown · 7 thinking 2
// 8 reasoning shown · 9 response shown · 10..(10+len-1) checklist ticks
// STEP_VENDORS vendors + plan budget + time-saved counter
// STEP_NEXT next-steps menu shown · STEP_DRAFT_HIGHLIGHT cursor -> "Draft quote"
// STEP_DRAFT_SHOWN click + quote draft shown · STEP_SEND_CURSOR cursor -> send
// STEP_SENT click + "Sent!" · hold, then loop (cycles to the next scenario)

export default function AgentModePreview() {
  const [step, setStep] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [timeSaved, setTimeSaved] = useState(0);
  const [loopCount, setLoopCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cursorStyle, setCursorStyle] = useState<{ top: number; left: number; visible: boolean; pressed: boolean }>({ top: 0, left: 0, visible: false, pressed: false });

  const scenario = SCENARIOS[loopCount % SCENARIOS.length];
  const estimatedSpend = scenario.vendors.reduce((sum, v) => sum + v.price, 0);
  const remainingBudget = scenario.totalBudget - estimatedSpend;
  const checklistLen = scenario.checklist.length;
  const STEP_VENDORS = 10 + checklistLen;
  const STEP_NEXT = STEP_VENDORS + 1;
  const STEP_DRAFT_HIGHLIGHT = STEP_NEXT + 1;
  const STEP_DRAFT_SHOWN = STEP_DRAFT_HIGHLIGHT + 1;
  const STEP_SEND_CURSOR = STEP_DRAFT_SHOWN + 1;
  const STEP_SENT = STEP_SEND_CURSOR + 1;

  const [started, setStarted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const draftChipRef = useRef<HTMLSpanElement>(null);
  const sendBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Delays the whole scripted sequence until this scrolls into view at least
  // once (same technique as Reveal.tsx), so it doesn't play out-of-sight
  // above/below the fold before the user ever scrolls to it. Fires once —
  // it keeps looping normally afterward even if scrolled away and back.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Keeps the newest message in view, matching the real chat's auto-scroll.
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [step, typedChars]);

  const moveCursorTo = (target: 'toggle' | 'draftChip' | 'send', pressed = false) => {
    const container = containerRef.current;
    const el = target === 'toggle' ? toggleRef.current : target === 'draftChip' ? draftChipRef.current : sendBtnRef.current;
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
    if (!started) return;

    if (reducedMotion) {
      setTypedChars(scenario.query1.length);
      setTimeSaved(scenario.timeSavedTarget);
      setStep(STEP_DRAFT_SHOWN);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    setTypedChars(0);
    setTimeSaved(0);
    setCursorStyle(s => ({ ...s, visible: false, pressed: false }));

    // The toggle-click intro only plays once — after that, Agent Mode is
    // already on, so later scenarios start straight from the query instead
    // of replaying the activation.
    const isFirstLoop = loopCount === 0;
    setStep(isFirstLoop ? 0 : 2);

    let t = 500;
    if (isFirstLoop) {
      timeouts.push(setTimeout(() => { setStep(1); moveCursorTo('toggle'); }, t)); // cursor appears at toggle
      t += 700;
      timeouts.push(setTimeout(() => { setStep(2); setCursorStyle(s => ({ ...s, pressed: true })); }, t)); // click + toggle on
      t += 180;
      timeouts.push(setTimeout(() => setCursorStyle(s => ({ ...s, pressed: false })), t)); // release before fading
      t += 320;
      timeouts.push(setTimeout(() => setCursorStyle(s => ({ ...s, visible: false })), t));
    }

    t += 400;
    timeouts.push(setTimeout(() => setStep(3), t)); // start typing query 1
    for (let i = 1; i <= scenario.query1.length; i++) {
      timeouts.push(setTimeout(() => setTypedChars(i), t + i * CHAR_DELAY));
    }
    t += scenario.query1.length * CHAR_DELAY + 500;
    timeouts.push(setTimeout(() => setStep(4), t)); // thinking 1
    t += THINK_MS;
    timeouts.push(setTimeout(() => setStep(5), t)); // clarifying shown
    t += 2600;
    timeouts.push(setTimeout(() => setStep(6), t)); // quick reply shown
    t += 900;
    timeouts.push(setTimeout(() => setStep(7), t)); // thinking 2
    t += THINK_MS;
    timeouts.push(setTimeout(() => setStep(8), t)); // reasoning shown
    t += 2000;
    timeouts.push(setTimeout(() => setStep(9), t)); // response shown
    t += 600;
    for (let i = 0; i < checklistLen; i++) {
      t += 420;
      timeouts.push(setTimeout(() => setStep(10 + i), t)); // checklist ticks, one at a time
    }
    t += 500;
    timeouts.push(setTimeout(() => setStep(STEP_VENDORS), t)); // vendors + plan budget + counter start
    const COUNTER_STEPS = 9;
    for (let i = 1; i <= COUNTER_STEPS; i++) {
      timeouts.push(setTimeout(() => setTimeSaved(Number(((scenario.timeSavedTarget * i) / COUNTER_STEPS).toFixed(1))), t + i * 100));
    }
    t += 2100;
    timeouts.push(setTimeout(() => setStep(STEP_NEXT), t)); // next-steps menu shown
    t += 1600;
    timeouts.push(setTimeout(() => moveCursorTo('draftChip'), t));
    timeouts.push(setTimeout(() => setStep(STEP_DRAFT_HIGHLIGHT), t));
    t += 700;
    timeouts.push(setTimeout(() => { setStep(STEP_DRAFT_SHOWN); setCursorStyle(s => ({ ...s, pressed: true })); }, t)); // click "Draft quote" + draft shown
    t += 180;
    timeouts.push(setTimeout(() => setCursorStyle(s => ({ ...s, pressed: false })), t)); // release before fading
    t += 320;
    timeouts.push(setTimeout(() => setCursorStyle(s => ({ ...s, visible: false })), t));
    t += 1800;
    timeouts.push(setTimeout(() => moveCursorTo('send'), t));
    timeouts.push(setTimeout(() => setStep(STEP_SEND_CURSOR), t));
    t += 700;
    timeouts.push(setTimeout(() => { setStep(STEP_SENT); setCursorStyle(s => ({ ...s, pressed: true })); }, t)); // click Send + "Sent!"
    t += 180;
    timeouts.push(setTimeout(() => setCursorStyle(s => ({ ...s, pressed: false })), t)); // release before fading
    t += 1820;
    timeouts.push(setTimeout(() => setCursorStyle(s => ({ ...s, visible: false })), t));
    t += 1200;
    timeouts.push(setTimeout(() => setLoopCount(c => c + 1), t)); // cycles to the next scenario

    return () => timeouts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, loopCount, started]);

  const toggleOn = step >= 2;

  return (
    <div ref={containerRef} className="relative">
      {/* Simulated cursor */}
      {cursorStyle.visible && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{
            top: cursorStyle.top,
            left: cursorStyle.left,
            transform: `scale(${cursorStyle.pressed ? 0.75 : 1})`,
            transition: 'top 450ms ease-out, left 450ms ease-out, transform 150ms ease-out',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" className="drop-shadow-md">
            <path d="M2 1l6 16 2.5-6L17 8.5 2 1z" fill="white" stroke="#1f2937" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Message thread — fixed height + internal scroll, same as the real chat's compact mode.
          Height is fixed (not max-height) so the box never grows/shrinks as content is added. */}
      <div ref={messagesRef} className="h-[380px] overflow-y-auto pr-1 mb-3 space-y-4">
        {step < 3 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              {step < 2 ? 'Turning on Agent Mode…' : 'Agent Mode on — planning ahead automatically.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <div className="bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs text-sm leading-relaxed">
                {scenario.query1.slice(0, typedChars)}
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
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{scenario.clarifying}</p>
                  )}
                </div>
              </div>
            )}

            {step >= 6 && (
              <div className="flex justify-end">
                <div className="bg-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs text-sm leading-relaxed">
                  {scenario.query2}
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
                      {/* Reasoning — shown before recommendations, builds trust */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1.5 leading-relaxed">{scenario.reasoningIntro}</p>
                      <ul className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-0.5 list-disc list-inside">
                        {scenario.reasoningFactors.map(f => <li key={f}>{f}</li>)}
                      </ul>

                      {step >= 9 && (
                        <>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">{scenario.response}</p>

                          {/* Live checklist — ticks in one category at a time */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {scenario.checklist.map((c, i) => (
                              <span
                                key={c}
                                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full transition-all duration-300 ${
                                  step >= 10 + i
                                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 opacity-100'
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-60'
                                }`}
                              >
                                {step >= 10 + i ? '✓' : '·'} {c}
                              </span>
                            ))}
                          </div>
                        </>
                      )}

                      {step >= STEP_VENDORS && (
                        <>
                          <div className="flex gap-3 overflow-x-auto pb-1 max-w-full mb-3">
                            {scenario.vendors.map((v, i) => (
                              <div key={i} className="flex-shrink-0 w-44 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl p-3">
                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate mb-0.5">{v.name}</p>
                                <p className="text-xs text-orange-500 mb-1.5 truncate">{v.handle}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{v.detail}</p>
                              </div>
                            ))}
                          </div>

                          {/* Named plan with a running budget, not just a card list */}
                          <div className="bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl p-3 mb-2">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">{scenario.planLabel}</p>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 dark:text-gray-400">Estimated Budget</span>
                              <span className="font-medium text-gray-900 dark:text-white">${estimatedSpend.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500 dark:text-gray-400">Remaining Budget</span>
                              <span className="font-medium text-orange-600 dark:text-orange-400">${remainingBudget.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full mb-3">
                            ⏱ Est. time saved: {timeSaved.toFixed(1)} hrs
                          </div>
                        </>
                      )}

                      {step >= STEP_NEXT && (
                        <>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                            {NEXT_STEPS_INTRO}
                          </p>
                          {/* Agent's menu of next actions — signals more than one capability */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {AGENT_OPTIONS.map(opt => (
                              <span
                                key={opt}
                                ref={opt === 'Draft quote' ? draftChipRef : undefined}
                                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-300 ${
                                  opt === 'Draft quote' && step >= STEP_DRAFT_HIGHLIGHT
                                    ? 'bg-orange-600 text-white border-orange-600'
                                    : 'bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                          {/* Keeps the conversation open instead of ending at a static result set */}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                            Or, want me to {FOLLOW_UP_PROMPTS.join(', ')}?
                          </p>
                        </>
                      )}

                      {step >= STEP_DRAFT_SHOWN && (
                        <div className="bg-white dark:bg-dark-bg border border-orange-200 dark:border-orange-800 rounded-xl p-3">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                            Quote Request <span className="font-normal text-gray-400 dark:text-gray-500">· review before sending</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {scenario.quoteDraft.categories.map(c => (
                              <span key={c} className="text-[11px] font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">
                                {c}
                              </span>
                            ))}
                          </div>
                          <div className="space-y-1 text-xs mb-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">City</span>
                              <span className="font-medium text-gray-900 dark:text-white">{scenario.quoteDraft.city}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Budget</span>
                              <span className="font-medium text-gray-900 dark:text-white">{scenario.quoteDraft.budget}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Event date</span>
                              <span className="font-medium text-gray-900 dark:text-white">{scenario.quoteDraft.eventDate}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{scenario.quoteDraft.message}</p>
                          <div className="flex gap-2">
                            {step >= STEP_SENT ? (
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
                                  className={`flex-1 text-center text-xs font-semibold text-white bg-orange-600 rounded-lg py-1.5 transition-transform ${cursorStyle.pressed && step === STEP_SENT ? 'scale-95' : ''}`}
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
