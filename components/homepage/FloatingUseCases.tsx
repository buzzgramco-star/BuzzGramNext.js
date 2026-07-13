'use client';

/**
 * PROTOTYPE — ambient field of use-case pills floating in a hero's background.
 * Shows the breadth of things people can ask, all at once, at low opacity so
 * the hero content stays dominant. Desktop-only (hidden below lg — on small
 * screens there's no empty margin for them to live in).
 *
 * When `interactive`, clicking a pill dispatches a `buzzgram:prefill` event
 * that AIChatSearch listens for to pre-fill the real chat input.
 *
 * To remove this experiment: revert the commit that added it.
 */

interface FloatingUseCasesProps {
  pills: string[];
  /** Pills dispatch buzzgram:prefill on click (homepage — feeds the real chat) */
  interactive?: boolean;
}

// Hand-placed slots in the hero's side margins, avoiding the centered content column
const SLOTS: Array<React.CSSProperties> = [
  { top: '14%', left: '2%' },
  { top: '36%', left: '5%' },
  { top: '58%', left: '2%' },
  { top: '78%', left: '6%' },
  { top: '18%', right: '3%' },
  { top: '40%', right: '6%' },
  { top: '62%', right: '2%' },
  { top: '82%', right: '5%' },
];

export default function FloatingUseCases({ pills, interactive = false }: FloatingUseCasesProps) {
  const handlePick = (query: string) => {
    if (!interactive) return;
    window.dispatchEvent(new CustomEvent('buzzgram:prefill', { detail: query }));
  };

  return (
    <div className="absolute inset-0 pointer-events-none hidden lg:block" aria-hidden="true">
      <style>{`
        @keyframes fuc-drift {
          from { transform: translateY(-7px); }
          to { transform: translateY(7px); }
        }
        .fuc-pill { animation: fuc-drift 7s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .fuc-pill { animation: none !important; }
        }
      `}</style>
      {pills.slice(0, SLOTS.length).map((pill, i) => {
        const common = 'fuc-pill absolute px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap';
        const look = 'bg-white/70 dark:bg-dark-card/70 border-gray-200 dark:border-dark-border text-gray-400 dark:text-gray-500';
        const style = { ...SLOTS[i], animationDelay: `${(i * 1.1) % 7}s`, animationDuration: `${6 + (i % 3)}s` };

        return interactive ? (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => handlePick(pill)}
            style={style}
            className={`${common} ${look} pointer-events-auto cursor-pointer transition-colors hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-dark-card`}
          >
            {pill}
          </button>
        ) : (
          <span key={i} style={style} className={`${common} ${look}`}>
            {pill}
          </span>
        );
      })}
    </div>
  );
}
