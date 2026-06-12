'use client';

import { useState, useEffect, useRef } from 'react';
import type { City, Business } from '@/types';
import { api, getCities } from '@/lib/api';
import BusinessCard from '@/components/BusinessCard';
import { useAuth } from '@/hooks/useAuth';

interface AIChatSearchProps {
  initialCitySlug?: string;
}

interface AISearchResponse {
  success: boolean;
  data: Business[];
  summary: string | null;
  detectedCity: string | null;
  aiUnavailable: boolean;
}

const EXAMPLE_PROMPTS = [
  'Nail tech under $80',
  'Home baker for a birthday cake',
  'Wedding makeup artist',
  'Event planner for a party',
];

export default function AIChatSearch({ initialCitySlug }: AIChatSearchProps) {
  const { user } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [mode, setMode] = useState<'ai' | 'search'>('ai');
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [cityError, setCityError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getCities().then(setCities).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialCitySlug && cities.length > 0) {
      const match = cities.find(c => c.slug === initialCitySlug);
      if (match) setSelectedCity(match);
    }
  }, [initialCitySlug, cities]);

  // Close dropdown on outside click or touch
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

  const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    resizeTextarea(e.target);
  };

  const runStandardSearch = async (city: City, q: string) => {
    try {
      const { data } = await api.get<{ success: boolean; data: Business[] }>('/businesses', {
        params: { cityId: city.id, search: q, limit: 30 },
      });
      setResults(data.data || []);
      setMode('search');
    } catch {
      setResults([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCity) {
      setCityError(true);
      return;
    }
    setCityError(false);
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setSummary(null);
    setDetectedCity(null);
    setLimitMessage(null);
    setMode('ai');

    try {
      const { data } = await api.post<AISearchResponse>(
        '/ai-search',
        { query: query.trim(), cityId: selectedCity.id },
        { timeout: 35000 }
      );

      if (data.aiUnavailable) {
        await runStandardSearch(selectedCity, query.trim());
        return;
      }

      setResults(data.data || []);
      setSummary(data.summary);

      if (
        data.detectedCity &&
        data.detectedCity.toLowerCase() !== selectedCity.slug.toLowerCase() &&
        data.detectedCity.toLowerCase() !== selectedCity.name.toLowerCase()
      ) {
        setDetectedCity(data.detectedCity);
      }
    } catch (error: any) {
      if (error?.response?.status === 429) {
        setLimitMessage(
          user
            ? 'AI search daily limit reached. Showing standard results.'
            : 'Daily AI search limit reached. Sign up free for 20 AI searches per day.'
        );
        await runStandardSearch(selectedCity, query.trim());
      } else {
        await runStandardSearch(selectedCity, query.trim());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setQuery(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
      resizeTextarea(textareaRef.current);
    }
  };

  const handleSwitchCity = (cityName: string) => {
    const match = cities.find(
      c =>
        c.slug === cityName.toLowerCase() ||
        c.name.toLowerCase() === cityName.toLowerCase()
    );
    if (match) {
      setSelectedCity(match);
      setDetectedCity(null);
    }
  };

  return (
    <div className="w-full">
      {/* City dropdown */}
      <div className="flex items-center gap-2 mb-3">
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
                  onClick={() => {
                    setSelectedCity(city);
                    setCityError(false);
                    setDropdownOpen(false);
                  }}
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

        {cityError && (
          <span className="text-red-500 text-xs">Please select a city</span>
        )}
      </div>

      {/* Chat-style input */}
      <form onSubmit={handleSubmit}>
        <div className="relative border-2 border-gray-200 dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card shadow-sm focus-within:border-orange-500 focus-within:shadow-md transition-all">
          <textarea
            ref={textareaRef}
            placeholder="Ask anything... e.g. I want to get married this summer, need help with everything"
            value={query}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={1}
            className="w-full px-5 pt-4 pb-14 text-base bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none leading-relaxed"
            style={{ minHeight: '60px', maxHeight: '200px' }}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-600 hidden sm:block">Enter to send</span>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-9 h-9 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 dark:disabled:text-gray-500 flex items-center justify-center transition-all"
            >
              {loading ? (
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

      {/* Example prompts — only before first search */}
      {!hasSearched && (
        <div className="flex flex-wrap gap-2 mt-3">
          {EXAMPLE_PROMPTS.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleExampleClick(prompt)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-400 bg-white dark:bg-dark-card transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Detected city prompt */}
      {detectedCity && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl text-sm flex items-center justify-between">
          <span className="text-orange-800 dark:text-orange-300">
            Did you mean <strong>{detectedCity}</strong>?
          </span>
          <button
            type="button"
            onClick={() => handleSwitchCity(detectedCity)}
            className="ml-3 px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-medium hover:bg-orange-700 transition-colors"
          >
            Switch
          </button>
        </div>
      )}

      {/* Rate limit message */}
      {limitMessage && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between flex-wrap gap-2">
          <span>{limitMessage}</span>
          {!user && (
            <a href="/register" className="text-orange-600 dark:text-orange-400 font-medium hover:underline">
              Sign up free →
            </a>
          )}
        </div>
      )}

      {/* AI response bubble */}
      {!loading && summary && mode === 'ai' && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl flex gap-3">
          <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 00-1.1 2.028l-.3 1.5a.75.75 0 01-.734.598H8.741a.75.75 0 01-.734-.598l-.3-1.5a3.75 3.75 0 00-1.1-2.028l-.347-.347z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide">BuzzGram AI</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && results.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(business => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}

      {/* Zero results */}
      {!loading && hasSearched && results.length === 0 && (
        <div className="mt-6 text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No businesses found</p>
          <p className="text-sm mt-1">Try a different search or select another city.</p>
        </div>
      )}
    </div>
  );
}
