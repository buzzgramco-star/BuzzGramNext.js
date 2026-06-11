'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    getCities().then(setCities).catch(() => {});
  }, []);

  // Pre-select city from slug prop once cities are loaded
  useEffect(() => {
    if (initialCitySlug && cities.length > 0) {
      const match = cities.find(c => c.slug === initialCitySlug);
      if (match) setSelectedCity(match);
    }
  }, [initialCitySlug, cities]);

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

      // Only surface detectedCity if it differs from the selected city
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
      {/* City Selector Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {cities.map(city => (
          <button
            key={city.id}
            type="button"
            onClick={() => { setSelectedCity(city); setCityError(false); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              selectedCity?.id === city.id
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border-gray-300 dark:border-dark-border hover:border-orange-500 dark:hover:border-orange-500'
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* City selection error */}
      {cityError && (
        <p className="text-red-500 text-sm mb-3">Please select a city first.</p>
      )}

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 00-1.1 2.028l-.3 1.5a.75.75 0 01-.734.598H8.741a.75.75 0 01-.734-.598l-.3-1.5a3.75 3.75 0 00-1.1-2.028l-.347-.347z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="e.g. nail tech under $80, home baker for a birthday cake..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-4 py-4 pl-12 pr-32 text-base border-2 border-gray-300 dark:border-dark-border rounded-xl bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute inset-y-0 right-0 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-r-xl transition-colors"
        >
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {/* Detected city prompt */}
      {detectedCity && (
        <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl text-sm flex items-center justify-between">
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

      {/* Rate limit / mode message */}
      {limitMessage && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between flex-wrap gap-2">
          <span>{limitMessage}</span>
          {!user && (
            <a
              href="/register"
              className="text-orange-600 dark:text-orange-400 font-medium hover:underline"
            >
              Sign up free →
            </a>
          )}
        </div>
      )}

      {/* AI summary */}
      {!loading && summary && mode === 'ai' && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 italic">{summary}</p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6 animate-pulse"
            >
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(business => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}

      {/* Zero results */}
      {!loading && hasSearched && results.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">No businesses found</p>
          <p className="text-sm mt-1">Try a different search or select another city.</p>
        </div>
      )}
    </div>
  );
}
