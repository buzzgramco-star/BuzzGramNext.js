'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { City, Business } from '@/types';
import { api, getCities } from '@/lib/api';
import BusinessCard from '@/components/BusinessCard';
import { useAuth } from '@/hooks/useAuth';

interface AIChatSearchProps {
  initialCitySlug?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  businesses?: Business[];
  followUps?: string[];
  checklist?: string[];
  type?: 'search' | 'planning' | 'question';
  isLoading?: boolean;
  isError?: boolean;
}

interface AISearchResponse {
  success: boolean;
  type: string;
  message: string | null;
  data: Business[];
  followUps: string[];
  checklist: string[];
  detectedCity: string | null;
  aiUnavailable: boolean;
}

const EXAMPLE_PROMPTS = [
  "I'm getting married this summer, help me plan",
  'Nail tech under $80',
  'Home baker for a birthday cake',
  'Event planner for a party',
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function AIChatSearch({ initialCitySlug }: AIChatSearchProps) {
  const { user } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCities().then(async (fetchedCities) => {
      setCities(fetchedCities);

      if (initialCitySlug) {
        const match = fetchedCities.find(c => c.slug === initialCitySlug);
        if (match) setSelectedCity(match);
        return;
      }

      // Auto-detect city from IP on homepage
      try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        const geo = await res.json();
        const detected = (geo.city || '').toLowerCase();
        if (!detected) return;
        const match =
          fetchedCities.find(c => c.name.toLowerCase() === detected) ||
          fetchedCities.find(c => c.slug === detected.replace(/\s+/g, '-')) ||
          fetchedCities.find(c =>
            c.name.toLowerCase().includes(detected) || detected.includes(c.name.toLowerCase())
          );
        if (match) setSelectedCity(match);
      } catch { /* silent */ }
    }).catch(() => {});
  }, [initialCitySlug]);

  // Close dropdown on outside click/touch
  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    if (!selectedCity) {
      setCityError(true);
      return;
    }
    setCityError(false);

    const userMsg: ChatMessage = { id: uid(), role: 'user', content: trimmed };
    const loadingId = uid();
    const loadingMsg: ChatMessage = { id: loadingId, role: 'assistant', content: '', isLoading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    // Send conversation history (role + content only) to backend — cap at 8 messages
    const historyForAPI = [...messages, userMsg]
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const { data } = await api.post<AISearchResponse>(
        '/ai-search',
        { messages: historyForAPI, cityId: selectedCity.id },
        { timeout: 35000 }
      );

      const assistantMsg: ChatMessage = {
        id: loadingId,
        role: 'assistant',
        content: data.message || '',
        businesses: data.data || [],
        followUps: data.followUps || [],
        checklist: data.checklist || [],
        type: data.type as any,
        isLoading: false,
      };

      setMessages(prev => prev.map(m => m.id === loadingId ? assistantMsg : m));

    } catch (error: any) {
      const errorText =
        error?.response?.status === 429
          ? user
            ? 'AI search daily limit reached.'
            : 'Daily AI search limit reached. Sign up free for 20 AI searches per day.'
          : 'Something went wrong. Please try again.';

      setMessages(prev => prev.map(m =>
        m.id === loadingId ? { ...m, content: errorText, isLoading: false, isError: true } : m
      ));
    } finally {
      setIsLoading(false);
    }
  }, [messages, selectedCity, isLoading, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">

      {/* City dropdown */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
              cityError
                ? 'border-red-400 text-red-600 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-bg'
            }`}
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{selectedCity?.name || 'Select city'}</span>
            <svg
              className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-lg z-50 min-w-[180px] py-1 overflow-hidden">
              {cities.map(city => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => { setSelectedCity(city); setCityError(false); setDropdownOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                >
                  <span>{city.name}</span>
                  {selectedCity?.id === city.id && (
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {cityError && <span className="text-red-500 text-xs">Please select a city</span>}
      </div>

      {/* Conversation thread */}
      {messages.length > 0 && (
        <div className="space-y-5">
          {messages.map(msg => (
            <div key={msg.id}>
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-orange-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 00-1.1 2.028l-.3 1.5a.75.75 0 01-.734.598H8.741a.75.75 0 01-.734-.598l-.3-1.5a3.75 3.75 0 00-1.1-2.028l-.347-.347z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wide">BuzzGram AI</p>

                    {/* Loading skeleton */}
                    {msg.isLoading && (
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 animate-pulse" />
                      </div>
                    )}

                    {/* Message text */}
                    {!msg.isLoading && msg.content && (
                      <p className={`text-sm leading-relaxed ${msg.isError ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'} ${(msg.checklist?.length || msg.businesses?.length) ? 'mb-4' : ''}`}>
                        {msg.content}
                      </p>
                    )}

                    {/* Planning checklist */}
                    {!msg.isLoading && msg.checklist && msg.checklist.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {msg.checklist.map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                            <div className="w-5 h-5 rounded-full border-2 border-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-orange-400" />
                            </div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Business results — horizontal scroll on mobile, grid on desktop */}
                    {!msg.isLoading && msg.businesses && msg.businesses.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0 md:gap-4 -mx-1 px-1 mb-3">
                        {msg.businesses.map(business => (
                          <div key={business.id} className="flex-shrink-0 w-[260px] snap-start md:w-auto">
                            <BusinessCard business={business} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Follow-up suggestion chips */}
                    {!msg.isLoading && msg.followUps && msg.followUps.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.followUps.map((suggestion, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => sendMessage(suggestion)}
                            disabled={isLoading}
                            className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-400 bg-white dark:bg-dark-card transition-all disabled:opacity-40"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Example prompts — only on empty state */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-400 bg-white dark:bg-dark-card transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input — always at bottom */}
      <form onSubmit={handleSubmit}>
        <div className="relative border-2 border-gray-200 dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card shadow-sm focus-within:border-orange-500 focus-within:shadow-md transition-all">
          <textarea
            ref={textareaRef}
            placeholder={
              messages.length === 0
                ? "Ask anything... e.g. I'm getting married this summer, help me plan"
                : 'Ask a follow-up...'
            }
            value={input}
            onChange={e => { setInput(e.target.value); resizeTextarea(e.target); }}
            onKeyDown={handleKeyDown}
            rows={1}
            className="w-full px-5 pt-4 pb-14 text-base bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none leading-relaxed"
            style={{ minHeight: '60px', maxHeight: '160px' }}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => setMessages([])}
                className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 transition-colors px-2 py-1"
              >
                Clear chat
              </button>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-600 hidden sm:block">Enter to send</span>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 dark:disabled:text-gray-500 flex items-center justify-center transition-all"
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>

    </div>
  );
}
