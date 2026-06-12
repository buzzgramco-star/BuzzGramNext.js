'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { City, Business } from '@/types';
import { api, getCities, getAIConversation, saveAIConversation, deleteAIConversation } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface AIChatSearchProps {
  initialCitySlug?: string;
  compact?: boolean; // caps message area height and scrolls internally (homepage use)
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  businesses?: Business[];
  followUps?: string[];
  checklist?: string[];
  type?: 'search' | 'planning' | 'question';
  showCards?: boolean;
  focusedSlug?: string; // slug of the single vendor this message is about
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
  showCards: boolean;
  aiUnavailable: boolean;
}

interface BusinessGroup {
  label: string;
  icon: string;
  items: Business[];
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

// Render **bold** and [text](url) markdown inline
function renderMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.*?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let last = 0;
  let match;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      parts.push(
        <strong key={key++} className="font-semibold text-gray-900 dark:text-white">{match[1]}</strong>
      );
    } else {
      parts.push(
        <a
          key={key++}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
        >
          {match[2]}
        </a>
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function groupBusinesses(businesses: Business[]): BusinessGroup[] {
  const map: Record<string, BusinessGroup> = {};
  businesses.forEach(b => {
    const label = b.subcategory?.name || b.category?.name || 'Other';
    const icon = b.subcategory?.icon || b.category?.icon || '';
    if (!map[label]) map[label] = { label, icon, items: [] };
    map[label].items.push(b);
  });
  return Object.values(map);
}

// ── Compact business card for carousel ────────────────────────────────────────

function MiniBusinessCard({ business, onSelect }: { business: Business; onSelect: (name: string, slug: string) => void }) {
  return (
    <div
      onClick={() => onSelect(business.name, business.slug)}
      className="cursor-pointer bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-3 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500 transition-all group flex flex-col"
    >
      <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug mb-2">
        {business.name}
      </p>
      {business.instagramHandle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1.5">
          {business.instagramHandle}
        </p>
      )}
      {business.city && (
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate flex items-center gap-1 mb-2">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {business.city.name}
        </p>
      )}
      <Link
        href={`/business/${business.slug}`}
        onClick={e => e.stopPropagation()}
        className="mt-auto text-xs text-orange-500 dark:text-orange-400 hover:underline flex items-center gap-0.5"
      >
        View profile
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

// ── Carousel row ──────────────────────────────────────────────────────────────

function CarouselRow({ group, onSelect }: { group: BusinessGroup; onSelect: (name: string, slug: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const sync = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    // Check after paint so clientWidth / scrollWidth are accurate
    const id = setTimeout(sync, 50);
    window.addEventListener('resize', sync);
    return () => { clearTimeout(id); window.removeEventListener('resize', sync); };
  }, [group.items]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });
  };

  return (
    <div className="mb-5">
      {/* Group header */}
      <div className="flex items-center gap-2 mb-2.5">
        {group.icon && <span className="text-base leading-none">{group.icon}</span>}
        <span className="text-sm font-semibold text-gray-800 dark:text-white">{group.label}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
          · {group.items.length} {group.items.length === 1 ? 'business' : 'businesses'}
        </span>
      </div>

      {/* Scrollable row + arrows */}
      <div className="relative group/carousel">
        {/* Left arrow */}
        {canLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden sm:flex w-8 h-8 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full shadow-md items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Cards */}
        <div
          ref={scrollRef}
          onScroll={sync}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {group.items.map(business => (
            <div key={business.id} className="flex-shrink-0 w-48 snap-start">
              <MiniBusinessCard business={business} onSelect={onSelect} />
            </div>
          ))}
        </div>

        {/* Right arrow */}
        {canRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden sm:flex w-8 h-8 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full shadow-md items-center justify-center hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AIChatSearch({ initialCitySlug, compact }: AIChatSearchProps) {
  const { user } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeFocusedSlug, setActiveFocusedSlug] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const loadedCityRef = useRef<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const storageKey = (slug: string) => `buzzgram-chat-${slug}`;

  // Load conversation when city is resolved
  useEffect(() => {
    if (!selectedCity) return;
    const slug = selectedCity.slug;
    if (loadedCityRef.current === slug) return; // already loaded for this city
    loadedCityRef.current = slug;

    if (user) {
      getAIConversation(slug)
        .then(msgs => { if (msgs.length > 0) setMessages(msgs); })
        .catch(() => {});
    } else {
      try {
        const saved = sessionStorage.getItem(storageKey(slug));
        if (saved) setMessages(JSON.parse(saved));
      } catch { /* silent */ }
    }
  }, [selectedCity, user]);

  // Save conversation after each completed AI reply
  useEffect(() => {
    if (!selectedCity) return;
    const finished = messages.filter(m => !m.isLoading);
    if (finished.length === 0) return;
    const slug = selectedCity.slug;

    if (user) {
      saveAIConversation(slug, finished)
        .then(res => { if (res.autoDeleted) showToast('Your oldest conversation was cleared to make room.'); })
        .catch(() => {});
    } else {
      try { sessionStorage.setItem(storageKey(slug), JSON.stringify(finished)); } catch { /* silent */ }
    }
  // Only run when messages settle (not on every keypress)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    getCities().then(async (fetchedCities) => {
      setCities(fetchedCities);
      if (initialCitySlug) {
        const match = fetchedCities.find(c => c.slug === initialCitySlug);
        if (match) setSelectedCity(match);
        return;
      }
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


  useEffect(() => {
    if (compact && messagesContainerRef.current) {
      // Scroll within the capped container — page stays still
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, compact]);

  const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const sendMessage = useCallback(async (text: string, explicitSlug?: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    if (!selectedCity) {
      showToast('Select your city first — pick one below or mention it in chat.');
      return;
    }

    const userMsg: ChatMessage = { id: uid(), role: 'user', content: trimmed };
    const loadingId = uid();
    const loadingMsg: ChatMessage = { id: loadingId, role: 'assistant', content: '', isLoading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    const historyForAPI = [...messages, userMsg]
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content }));

    // Explicit slug (card/chip click) takes priority; fall back to active state
    // so typed follow-up messages stay anchored to the current vendor automatically.
    const slugToSend = explicitSlug !== undefined ? explicitSlug : (activeFocusedSlug ?? undefined);

    try {
      const { data } = await api.post<AISearchResponse>(
        '/ai-search',
        { messages: historyForAPI, cityId: selectedCity.id, ...(slugToSend ? { focusedSlug: slugToSend } : {}) },
        { timeout: 35000 }
      );

      // Update active focused slug based on AI response:
      // - Single vendor response → lock in that vendor
      // - Multiple results → back to discovery, clear focus
      // - Question / 0 results → keep current focus (still about same vendor)
      if (data.showCards === false && data.data?.length === 1) {
        setActiveFocusedSlug(data.data[0].slug);
      } else if ((data.data?.length ?? 0) > 1) {
        setActiveFocusedSlug(null);
      }

      // Mid-conversation city switch — backend detected user asking about a different city
      // and already fetched that city's data. Update selected city so future messages use it.
      if (data.detectedCity) {
        const switched = cities.find(c => c.slug === data.detectedCity);
        if (switched && switched.id !== selectedCity.id) {
          loadedCityRef.current = switched.slug; // prevent load effect from overwriting current messages
          setSelectedCity(switched);
          setActiveFocusedSlug(null);
        }
      }

      const assistantMsg: ChatMessage = {
        id: loadingId,
        role: 'assistant',
        content: data.message || '',
        businesses: data.data || [],
        followUps: data.followUps || [],
        checklist: data.checklist || [],
        type: data.type as any,
        showCards: data.showCards !== false,
        focusedSlug: data.showCards === false && data.data?.length === 1 ? data.data[0].slug : undefined,
        isLoading: false,
      };

      setMessages(prev => {
        const updated = prev.map(m => m.id === loadingId ? assistantMsg : m);
        if (selectedCity) {
          const toSave = updated.filter(m => !m.isLoading);
          if (user) {
            saveAIConversation(selectedCity.slug, toSave)
              .then(res => { if (res.autoDeleted) showToast('Your oldest conversation was cleared to make room.'); })
              .catch(() => {});
          } else {
            try { sessionStorage.setItem(storageKey(selectedCity.slug), JSON.stringify(toSave)); } catch { /* silent */ }
          }
        }
        return updated;
      });
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
  }, [messages, selectedCity, isLoading, user, showToast, activeFocusedSlug, cities]);

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

      {/* Conversation thread */}
      {messages.length > 0 && (
        <div
          ref={messagesContainerRef}
          className={`space-y-5 ${compact ? 'max-h-[420px] overflow-y-auto pr-1' : ''}`}
        >
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
                      <p className={`text-sm leading-relaxed whitespace-pre-line ${msg.isError ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'} ${(msg.checklist?.length || msg.businesses?.length) ? 'mb-4' : ''}`}>
                        {msg.isError ? msg.content : renderMarkdown(msg.content)}
                      </p>
                    )}

                    {/* Planning checklist */}
                    {!msg.isLoading && msg.checklist && msg.checklist.length > 0 && (
                      <div className="mb-5 space-y-2">
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

                    {/* Business results — grouped carousel (only when AI signals showCards) */}
                    {!msg.isLoading && msg.showCards !== false && msg.businesses && msg.businesses.length > 0 && (
                      <div className="mb-3">
                        {groupBusinesses(msg.businesses).map(group => (
                          <CarouselRow
                            key={group.label}
                            group={group}
                            onSelect={(name, slug) => sendMessage(`What can you tell me about ${name}?`, slug)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Subtle profile link when focused on a single vendor (no card needed) */}
                    {!msg.isLoading && msg.showCards === false && msg.businesses && msg.businesses.length === 1 && (
                      <Link
                        href={`/business/${msg.businesses[0].slug}`}
                        className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:underline mb-3"
                      >
                        View {msg.businesses[0].name} profile
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}

                    {/* Follow-up suggestion chips */}
                    {!msg.isLoading && msg.followUps && msg.followUps.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {msg.followUps.map((suggestion, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => sendMessage(suggestion, msg.focusedSlug)}
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

      {/* Empty state — city picker (no city detected) or example prompts */}
      {messages.length === 0 && (
        !selectedCity ? (
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2.5 flex items-center gap-1.5">
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Where are you? Pick your city to get started.
            </p>
            <div className="flex flex-wrap gap-2">
              {cities.map(city => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => { setSelectedCity(city); setActiveFocusedSlug(null); }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-400 bg-white dark:bg-dark-card transition-all"
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
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
        )
      )}

      {/* Input — always at bottom */}
      <form onSubmit={handleSubmit}>
        <div className="relative border-2 border-gray-200 dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card shadow-sm focus-within:border-orange-500 focus-within:shadow-md transition-all">
          <textarea
            ref={textareaRef}
            placeholder={
              !selectedCity
                ? 'Pick your city above, or just ask — e.g. "Show me nail techs in Toronto"'
                : messages.length === 0
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
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            {/* City indicator — subtle, non-interactive */}
            {selectedCity ? (
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 pointer-events-none select-none">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {selectedCity.name}
              </span>
            ) : (
              <span className="text-xs text-gray-300 dark:text-gray-600 pointer-events-none select-none">Detecting city…</span>
            )}
            {/* Actions */}
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    setActiveFocusedSlug(null);
                    if (selectedCity) {
                      if (user) {
                        deleteAIConversation(selectedCity.slug).catch(() => {});
                      } else {
                        try { sessionStorage.removeItem(storageKey(selectedCity.slug)); } catch { /* silent */ }
                      }
                    }
                  }}
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
        </div>
      </form>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-800 dark:bg-gray-700 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

    </div>
  );
}
