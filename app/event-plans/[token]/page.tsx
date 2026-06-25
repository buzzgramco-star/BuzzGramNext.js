'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEventSharePlan } from '@/lib/api';
import type { EventPlan } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const EVENT_ICONS: Record<string, string> = {
  wedding: '💍',
  bridal_shower: '👰',
  baby_shower: '🍼',
  gender_reveal: '🎊',
  birthday: '🎂',
  bachelorette: '🎉',
  sweet_16: '✨',
  graduation: '🎓',
};

export default function EventPlanSharePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const token = (params?.token ?? '') as string;

  const [plan, setPlan] = useState<{ event: EventPlan; expiresAt: string; token: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);

  useEffect(() => {
    getEventSharePlan(token)
      .then(data => {
        setPlan(data);
        const mins = Math.round((new Date(data.expiresAt).getTime() - Date.now()) / 60000);
        setMinutesLeft(Math.max(0, mins));
      })
      .catch(err => {
        const msg = err?.response?.data?.message || 'This plan link has expired or is no longer available.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSignUp = () => {
    try { sessionStorage.setItem('buzzgram-claim-token', token); } catch { /* silent */ }
    router.push('/register');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading plan…</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Plan Unavailable</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Start your own plan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  const { event } = plan;
  const icon = EVENT_ICONS[event.type] || '🎉';
  const found = (event.checklist || []).filter(c => c.status !== 'pending').length;
  const total = (event.checklist || []).length;
  const pct = total > 0 ? Math.round((found / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-orange-600 dark:text-orange-400">BuzzGram</Link>
          <span className="text-xs text-gray-400 dark:text-gray-500">AI Event Planner</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Plan Card */}
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl overflow-hidden mb-6">
          {/* Card header */}
          <div className="bg-orange-50 dark:bg-orange-950/30 border-b border-orange-100 dark:border-orange-900/40 px-5 py-4">
            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-1">Shared Event Plan</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{icon}</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{event.label}</h1>
                {event.date && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">📅 {event.date}</p>
                )}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="px-5 py-4 border-b border-gray-100 dark:border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vendor progress</span>
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{found} of {total} found</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 dark:bg-orange-400 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Checklist</p>
            <div className="space-y-2">
              {(event.checklist || []).map(item => (
                <div
                  key={item.category}
                  className={`flex items-center gap-3 p-2.5 rounded-lg ${
                    item.status !== 'pending'
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.status !== 'pending'
                      ? 'bg-green-500'
                      : 'border-2 border-gray-300 dark:border-gray-600'
                  }`}>
                    {item.status !== 'pending' && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      item.status !== 'pending'
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {item.category}
                    </p>
                    {item.vendorName && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.vendorName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        {!user ? (
          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.75 3.75 0 00-1.1 2.028l-.3 1.5a.75.75 0 01-.734.598H8.741a.75.75 0 01-.734-.598l-.3-1.5a3.75 3.75 0 00-1.1-2.028l-.347-.347z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              Save this plan to your account
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Create a free BuzzGram account to continue planning and find the remaining vendors with AI.
            </p>
            <button
              type="button"
              onClick={handleSignUp}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors mb-3 text-sm"
            >
              Create free account & save plan
            </button>
            <Link
              href="/login"
              className="block text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Already have an account? Log in
            </Link>
          </div>
        ) : (
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 rounded-2xl p-5 text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              You&apos;re logged in — start chatting with BuzzGram AI to build your own event plan!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Go to AI Planner
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {minutesLeft !== null && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
            This link expires in {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
