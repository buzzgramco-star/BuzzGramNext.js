'use client';

import { useState } from 'react';
import AIChatSearch from '@/components/AIChatSearch';

interface Props {
  citySlug: string;
}

export default function FloatingAIChat({ citySlug }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating action button — hidden when panel is open */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open BuzzGram AI"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 pl-4 pr-5 h-12 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white rounded-full shadow-xl transition-all hover:scale-105"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 00-1.1 2.028l-.3 1.5a.75.75 0 01-.734.598H8.741a.75.75 0 01-.734-.598l-.3-1.5a3.75 3.75 0 00-1.1-2.028l-.347-.347z" />
          </svg>
          <span className="text-sm font-semibold">Ask AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-300 animate-pulse" />
        </button>
      )}

      {/* Backdrop — mobile only (tapping outside closes panel) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 sm:bg-transparent sm:pointer-events-none"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel — full-screen takeover on mobile (Siri/iMessage-style), floating card on desktop */}
      <div
        className={`fixed z-50 transition-all duration-300 ease-out
          inset-0
          sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[460px] sm:rounded-2xl
          bg-white dark:bg-dark-card sm:border sm:border-gray-200 sm:dark:border-dark-border shadow-2xl
          ${open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
        `}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 00-1.1 2.028l-.3 1.5a.75.75 0 01-.734.598H8.741a.75.75 0 01-.734-.598l-.3-1.5a3.75 3.75 0 00-1.1-2.028l-.347-.347z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">BuzzGram AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat — compact keeps messages scrolling internally so panel stays bounded.
            fullHeight fills the mobile full-screen panel; falls back to the normal
            420px cap at sm: automatically (see AIChatSearch), so this is safe on
            the small desktop floating card too. */}
        <div className="p-4 sm:p-5">
          <AIChatSearch initialCitySlug={citySlug} compact fullHeight />
        </div>
      </div>
    </>
  );
}
