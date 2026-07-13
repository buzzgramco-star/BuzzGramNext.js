'use client';

import { useState, useEffect } from 'react';

/**
 * PROTOTYPE — ambient field of use-case pills floating in a hero's background.
 * Shows the breadth of things people can ask, all at once, at low opacity so
 * the hero content stays dominant. Desktop-only (hidden below lg — on small
 * screens there's no empty margin for them to live in).
 *
 * When `interactive`, clicking a pill dispatches a `buzzgram:prefill` event
 * that AIChatSearch listens for to pre-fill the real chat input.
 *
 * When NOT interactive and `pills` has more entries than slots, one pill is
 * swapped for a fresh one from the pool every few seconds — reads as live
 * demand flowing past (for-businesses).
 *
 * To remove this experiment: revert the commits that added it.
 */

interface FloatingUseCasesProps {
  pills: string[];
  /** Pills dispatch buzzgram:prefill on click (homepage — feeds the real chat) */
  interactive?: boolean;
}

// strip the leading emoji — only the words belong in the chat input
function dispatchPrefill(query: string) {
  const text = query.replace(/^[^\p{L}\p{N}]+\s*/u, '');
  window.dispatchEvent(new CustomEvent('buzzgram:prefill', { detail: text }));
}

const PILL_LOOK = 'bg-white/80 dark:bg-dark-card/80 border-orange-100 dark:border-orange-900/30 text-gray-500 dark:text-gray-400';

// Hand-placed slots in the hero's side margins, avoiding the centered content
// column. depth: 0 = far (small, faint), 2 = near (bigger, clearer) — three
// layers give the field a sense of space. r = resting rotation.
const SLOTS: Array<{ style: React.CSSProperties; depth: 0 | 1 | 2; r: string }> = [
  { style: { top: '14%', left: '2%' }, depth: 1, r: '-2deg' },
  { style: { top: '36%', left: '5%' }, depth: 2, r: '1.5deg' },
  { style: { top: '58%', left: '2%' }, depth: 0, r: '2deg' },
  { style: { top: '78%', left: '6%' }, depth: 1, r: '-1.5deg' },
  { style: { top: '18%', right: '3%' }, depth: 0, r: '2deg' },
  { style: { top: '40%', right: '6%' }, depth: 2, r: '-1.5deg' },
  { style: { top: '62%', right: '2%' }, depth: 1, r: '1deg' },
  { style: { top: '82%', right: '5%' }, depth: 0, r: '-2deg' },
];

const DEPTH = [
  'opacity-50 scale-90',
  'opacity-70 scale-100',
  'opacity-90 scale-105 shadow-sm',
];

const CYCLE_MS = 3800;

export default function FloatingUseCases({ pills, interactive = false }: FloatingUseCasesProps) {
  // visible[i] = index into pills; extras beyond the slots rotate in over time
  const [visible, setVisible] = useState<number[]>(() => SLOTS.map((_, i) => i % pills.length));
  // bump forces the enter animation to replay on the slot that just swapped
  const [bump, setBump] = useState<Record<number, number>>({});

  useEffect(() => {
    if (interactive || pills.length <= SLOTS.length) return; // clickable pills stay put
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(() => {
      setVisible(prev => {
        const slot = Math.floor(Math.random() * SLOTS.length);
        const inUse = new Set(prev);
        const candidates = pills.map((_, i) => i).filter(i => !inUse.has(i));
        if (candidates.length === 0) return prev;
        const next = [...prev];
        next[slot] = candidates[Math.floor(Math.random() * candidates.length)];
        setBump(b => ({ ...b, [slot]: (b[slot] ?? 0) + 1 }));
        return next;
      });
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [interactive, pills]);

  const handlePick = (query: string) => {
    if (!interactive) return;
    dispatchPrefill(query);
  };

  return (
    <div className="absolute inset-0 pointer-events-none hidden lg:block" aria-hidden="true">
      <style>{`
        @keyframes fuc-drift {
          from { transform: translateY(-7px) rotate(var(--fuc-r, 0deg)); }
          to { transform: translateY(7px) rotate(var(--fuc-r, 0deg)); }
        }
        @keyframes fuc-enter {
          from { opacity: 0; transform: translateY(14px) scale(.92) rotate(var(--fuc-r, 0deg)); }
        }
        .fuc-pill {
          animation:
            fuc-enter .7s ease-out var(--fuc-enter-delay, 0s) backwards,
            fuc-drift var(--fuc-dur, 7s) ease-in-out var(--fuc-drift-delay, 0s) infinite alternate;
        }
        @media (prefers-reduced-motion: reduce) {
          .fuc-pill { animation: none !important; }
        }
      `}</style>
      {SLOTS.map((slot, i) => {
        const pill = pills[visible[i]];
        if (!pill) return null;
        const style: React.CSSProperties = {
          ...slot.style,
          '--fuc-r': slot.r,
          '--fuc-dur': `${6 + (i % 3)}s`,
          '--fuc-drift-delay': `-${(i * 1.7) % 7}s`,
          '--fuc-enter-delay': bump[i] ? '0s' : `${0.15 + i * 0.12}s`,
        } as React.CSSProperties;
        const common = `fuc-pill absolute px-3.5 py-2 rounded-full text-xs font-medium border whitespace-nowrap backdrop-blur-sm ${DEPTH[slot.depth]}`;
        const look = 'bg-white/80 dark:bg-dark-card/80 border-orange-100 dark:border-orange-900/30 text-gray-500 dark:text-gray-400';

        return interactive ? (
          <button
            key={`${i}-${bump[i] ?? 0}`}
            type="button"
            tabIndex={-1}
            onClick={() => handlePick(pill)}
            style={style}
            className={`${common} ${look} pointer-events-auto cursor-pointer transition-all duration-200 hover:!opacity-100 hover:!scale-110 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-dark-card hover:shadow-md`}
          >
            {pill}
          </button>
        ) : (
          <span key={`${i}-${bump[i] ?? 0}`} style={style} className={`${common} ${look}`}>
            {pill}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Mobile counterpart of the floating field: a slim auto-scrolling marquee of
 * the same pills, in the page flow (never behind content). Shown below lg,
 * where the floating field hides. Pauses while touched; reduced-motion users
 * get a static row they can flick manually.
 */
export function UseCaseTicker({ pills, interactive = false }: FloatingUseCasesProps) {
  const pillClass = `flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-medium border whitespace-nowrap ${PILL_LOOK}`;

  const renderRow = (ariaHidden: boolean) =>
    pills.map((pill, i) =>
      interactive && !ariaHidden ? (
        <button
          key={i}
          type="button"
          onClick={() => dispatchPrefill(pill)}
          className={`${pillClass} active:border-orange-400 active:text-orange-600`}
        >
          {pill}
        </button>
      ) : (
        <span key={i} className={pillClass} aria-hidden={ariaHidden}>
          {pill}
        </span>
      )
    );

  return (
    <div className="lg:hidden relative overflow-hidden motion-reduce:overflow-x-auto">
      <style>{`
        @keyframes fuc-marquee { to { transform: translateX(-50%); } }
        .fuc-track {
          width: max-content;
          animation: fuc-marquee ${Math.max(pills.length * 3, 18)}s linear infinite;
        }
        .fuc-track:active { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .fuc-track { animation: none !important; }
        }
      `}</style>
      <div className="fuc-track flex gap-2 py-1">
        {renderRow(false)}
        {renderRow(true)}
      </div>
      {/* edge fades so pills dissolve at the strip's ends */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white dark:from-dark-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white dark:from-dark-bg to-transparent" />
    </div>
  );
}
