'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { City, Business, EventPlan } from '@/types';
import {
  api, API_BASE_URL, getCities, getBusinesses, getSubcategories,
  getConversations, getConversationById, createConversation, updateConversation, deleteConversation,
  getUserEvents, createEvent, saveVendorToEvent, createEventShareLink,
} from '@/lib/api';
import type { ConversationSummary } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import AIDemoPreview from '@/components/homepage/AIDemoPreview';

interface AIChatSearchProps {
  initialCitySlug?: string;
  compact?: boolean;
  /** Plays an animated demo conversation as the empty state; dissolves on first interaction */
  demo?: boolean;
  /** Fires when the user first engages the input (focus) — lets a parent switch
   *  to a full-screen mobile layout (Siri/iMessage-style takeover) without this
   *  component knowing anything about that; it just reports "someone started". */
  onEngage?: () => void;
  /** Widens the compact mode's fixed 420px scroll cap to fill a full-screen
   *  mobile container instead. No effect unless `compact` is also set. */
  fullHeight?: boolean;
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
  focusedSlug?: string;
  isLoading?: boolean;
  isError?: boolean;
  /** 429 from the AI limiter — rendered as a signup/upsell card, not a retryable error */
  isRateLimit?: boolean;
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
  eventUpdate?: { action: 'create' | 'update'; type?: string; index?: number; [key: string]: any } | null;
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

// Parked for launch (Jul 14, 2026): the manual event-type picker button/dropdown
// in the input bar is hidden. The AI's own conversational planning detection
// (typing "help me plan my wedding" -> checklist + event) is untouched and
// stays fully active — this flag affects ONLY the manual shortcut UI below.
// Flip back to true to re-enable; no other code changes needed.
const MANUAL_EVENT_PICKER_ENABLED = false;

const EVENT_TYPES = [
  { type: 'wedding',       label: 'Wedding',       icon: '💍' },
  { type: 'bridal_shower', label: 'Bridal Shower', icon: '👰' },
  { type: 'baby_shower',   label: 'Baby Shower',   icon: '🍼' },
  { type: 'gender_reveal', label: 'Gender Reveal', icon: '🎊' },
  { type: 'birthday',      label: 'Birthday',      icon: '🎂' },
  { type: 'bachelorette',  label: 'Bachelorette',  icon: '🎉' },
  { type: 'sweet_16',      label: 'Sweet 16',      icon: '✨' },
  { type: 'graduation',    label: 'Graduation',    icon: '🎓' },
];

const EVENT_CHECKLISTS: Record<string, string[]> = {
  wedding:       ['Photography', 'Hair', 'Makeup', 'Nails', 'Decor', 'Planning', 'Catering', 'Bakery'],
  bridal_shower: ['Decor', 'Catering', 'Bakery', 'Nails', 'Lashes', 'Photography'],
  baby_shower:   ['Decor', 'Catering', 'Bakery', 'Photography'],
  gender_reveal: ['Decor', 'Bakery', 'Photography', 'Catering'],
  birthday:      ['Bakery', 'Decor', 'Photography', 'Catering', 'Chef'],
  bachelorette:  ['Hair', 'Makeup', 'Nails', 'Lashes', 'Photography'],
  sweet_16:      ['Decor', 'Bakery', 'Photography', 'Catering', 'Hair', 'Makeup'],
  graduation:    ['Bakery', 'Catering', 'Photography', 'Decor'],
};

// Keywords for matching event checklist categories to subcategory/category names in the DB.
// The DB may use "Nail Techs", "Home Bakers", "Event Planners" etc., so exact string equality
// fails. These stem-based keywords let one checklist entry match multiple DB names.
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Photography: ['photo'],
  Hair:        ['hair'],
  Makeup:      ['makeup', 'make-up', 'make up'],
  Nails:       ['nail'],
  Decor:       ['decor'],
  Planning:    ['plan', 'coordinat'],
  Catering:    ['cater'],
  Bakery:      ['bak'],
  Lashes:      ['lash'],
  Chef:        ['chef', 'culinar', 'cook'],
};

function matchesEventCategory(eventCat: string, dbName: string): boolean {
  const lower = dbName.toLowerCase();
  const keywords = CATEGORY_KEYWORDS[eventCat] || [eventCat.toLowerCase()];
  return keywords.some(kw => lower.includes(kw));
}

const GUEST_KEY = 'buzzgram-chat';
const SESSION_KEY = 'buzzgram-session-id';
const CITY_KEY = 'buzzgram-city';           // persists last-selected city across remounts
const CONV_CITIES_KEY = 'buzzgram-conv-cities'; // maps convId → citySlug for history restore

// Suburbs / metro-area neighbourhoods → supported city slug
const METRO_ALIASES: Record<string, string> = {
  // Toronto metro
  'north york': 'toronto', 'scarborough': 'toronto', 'etobicoke': 'toronto',
  'mississauga': 'toronto', 'brampton': 'toronto', 'markham': 'toronto',
  'richmond hill': 'toronto', 'vaughan': 'toronto', 'oakville': 'toronto',
  'burlington': 'toronto', 'ajax': 'toronto', 'pickering': 'toronto',
  // NYC metro
  'brooklyn': 'new-york-city', 'queens': 'new-york-city', 'bronx': 'new-york-city',
  'manhattan': 'new-york-city', 'staten island': 'new-york-city',
  'jersey city': 'new-york-city', 'hoboken': 'new-york-city',
  'long island city': 'new-york-city', 'astoria': 'new-york-city',
  // LA metro
  'burbank': 'los-angeles', 'pasadena': 'los-angeles', 'santa monica': 'los-angeles',
  'glendale': 'los-angeles', 'west hollywood': 'los-angeles', 'beverly hills': 'los-angeles',
  'culver city': 'los-angeles', 'inglewood': 'los-angeles', 'compton': 'los-angeles',
  'long beach': 'los-angeles', 'torrance': 'los-angeles',
  // Miami metro
  'north miami': 'miami', 'miami beach': 'miami', 'coral gables': 'miami',
  'hialeah': 'miami', 'doral': 'miami', 'aventura': 'miami',
  // Chicago metro
  'evanston': 'chicago', 'oak park': 'chicago', 'cicero': 'chicago',
  'berwyn': 'chicago', 'skokie': 'chicago',
  // Phoenix metro
  'scottsdale': 'phoenix', 'tempe': 'phoenix', 'mesa': 'phoenix',
  'chandler': 'phoenix', 'gilbert': 'phoenix', 'peoria': 'phoenix',
  // Vancouver metro
  'burnaby': 'vancouver', 'surrey': 'vancouver', 'richmond': 'vancouver',
  'north vancouver': 'vancouver', 'west vancouver': 'vancouver', 'coquitlam': 'vancouver',
  // Ottawa / Calgary
  'gatineau': 'ottawa', 'nepean': 'ottawa', 'kanata': 'ottawa',
  'airdrie': 'calgary', 'cochrane': 'calgary',
};

function matchCityFromDetected(detected: string, fetchedCities: City[]): City | null {
  const d = detected.toLowerCase().trim();
  if (!d) return null;
  // Direct name / slug match
  const direct =
    fetchedCities.find(c => c.name.toLowerCase() === d) ||
    fetchedCities.find(c => c.slug === d.replace(/\s+/g, '-')) ||
    fetchedCities.find(c => c.name.toLowerCase().includes(d) || d.includes(c.name.toLowerCase()));
  if (direct) return direct;
  // Metro alias lookup
  const aliasSlug = METRO_ALIASES[d];
  if (aliasSlug) return fetchedCities.find(c => c.slug === aliasSlug) ?? null;
  return null;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function extractCityFromText(text: string, fetchedCities: City[]): City | null {
  const t = text.toLowerCase();
  for (const city of fetchedCities) {
    if (t.includes(city.name.toLowerCase()) || t.includes(city.slug.replace(/-/g, ' '))) {
      return city;
    }
  }
  for (const [alias, slug] of Object.entries(METRO_ALIASES)) {
    if (t.includes(alias)) return fetchedCities.find(c => c.slug === slug) ?? null;
  }
  return null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function renderMarkdown(text: string): React.ReactNode[] {
  // Strip markdown heading markers (###, ##, #) — AI sometimes outputs them despite instructions
  const cleaned = text.replace(/^#{1,6}\s*/gm, '');
  const parts: React.ReactNode[] = [];
  const re = /\*\*(.*?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let last = 0;
  let match;
  let key = 0;
  while ((match = re.exec(cleaned)) !== null) {
    if (match.index > last) parts.push(cleaned.slice(last, match.index));
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
  if (last < cleaned.length) parts.push(cleaned.slice(last));
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

function MiniBusinessCard({
  business,
  onSelect,
  events,
  onSaveVendor,
  savingVendor,
}: {
  business: Business;
  onSelect: (name: string, slug: string) => void;
  events?: EventPlan[];
  onSaveVendor?: (business: Business) => void;
  savingVendor?: string | null;
}) {
  const activeEvents = (events || []).filter(e => e.status === 'active');
  const showBookmark = activeEvents.length > 0 && !!onSaveVendor;
  // Only check the latest active event — vendors saved to past events should remain saveable
  const latestEvent = activeEvents[activeEvents.length - 1];
  const isSaved = !!latestEvent && (latestEvent.checklist || []).some(
    c => c.status !== 'pending' && c.vendorSlug === business.slug
  );

  // AI-only imports (listed=false) have no public profile page yet — link
  // straight to Instagram instead. `listed` is undefined on older API
  // responses, which should behave like a normal (listed) business.
  const hasProfile = business.listed !== false;

  // Lowest priced service, matching the homepage demo's "From $X" style. The
  // AI search response returns a flat services list (parents and their price
  // variations as siblings, linked only by parentServiceId) rather than a
  // nested tree, and pricing commonly lives on the variation rather than the
  // parent group — so the minimum is taken across the whole list, not just
  // top-level entries.
  const startingPrice = (business.services || [])
    .filter(s => typeof s.priceNumeric === 'number')
    .reduce((min: number | null, s) => (min === null || s.priceNumeric! < min ? s.priceNumeric! : min), null);

  return (
    <div
      onClick={() => onSelect(business.name, business.slug)}
      className="cursor-pointer bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-3 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-500 transition-all group flex flex-col relative"
    >
      {showBookmark && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onSaveVendor!(business); }}
          disabled={savingVendor === business.slug || isSaved}
          title={isSaved ? 'Already saved to event' : 'Save to event plan'}
          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50 z-10"
        >
          {savingVendor === business.slug ? (
            <svg className="w-3.5 h-3.5 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg
              className={`w-3.5 h-3.5 transition-colors ${isSaved ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600 group-hover:text-orange-300 dark:group-hover:text-orange-600'}`}
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
        </button>
      )}
      <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug mb-2 pr-6">
        {business.name}
      </p>
      {business.instagramHandle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1.5">
          {business.instagramHandle}
        </p>
      )}
      {business.city && (
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate flex items-center gap-1 mb-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {business.city.name}
        </p>
      )}
      {startingPrice !== null && (
        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
          From ${startingPrice}
        </p>
      )}
      {hasProfile ? (
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
      ) : business.instagramUrl ? (
        <a
          href={business.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="mt-auto text-xs text-orange-500 dark:text-orange-400 hover:underline flex items-center gap-0.5"
        >
          View Instagram
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      ) : null}
    </div>
  );
}

function CarouselRow({ group, onSelect, events, onSaveVendor, savingVendor }: {
  group: BusinessGroup;
  onSelect: (name: string, slug: string) => void;
  events?: EventPlan[];
  onSaveVendor?: (business: Business) => void;
  savingVendor?: string | null;
}) {
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
    const id = setTimeout(sync, 50);
    window.addEventListener('resize', sync);
    return () => { clearTimeout(id); window.removeEventListener('resize', sync); };
  }, [group.items]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });
  };

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2.5">
        {group.icon && <span className="text-base leading-none">{group.icon}</span>}
        <span className="text-sm font-semibold text-gray-800 dark:text-white">{group.label}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
          · {group.items.length} {group.items.length === 1 ? 'business' : 'businesses'}
        </span>
      </div>

      <div className="relative group/carousel">
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

        <div
          ref={scrollRef}
          onScroll={sync}
          className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {group.items.map(business => (
            <div key={business.id} className="flex-shrink-0 w-48 snap-start">
              <MiniBusinessCard
                business={business}
                onSelect={onSelect}
                events={events}
                onSaveVendor={onSaveVendor}
                savingVendor={savingVendor}
              />
            </div>
          ))}
        </div>

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

export default function AIChatSearch({ initialCitySlug, compact, demo, onEngage, fullHeight }: AIChatSearchProps) {
  // fullHeight bakes in its own sm: fallback to the normal 420px cap, so
  // callers can pass it unconditionally (e.g. "always full height on mobile
  // popups") without tracking viewport width themselves — at sm: and up this
  // is always identical to the plain compact behavior.
  const scrollCapClass = compact
    ? (fullHeight ? 'max-h-[calc(100dvh-220px)] sm:max-h-[420px] overflow-y-auto pr-1' : 'max-h-[420px] overflow-y-auto pr-1')
    : '';
  const { user } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeFocusedSlug, setActiveFocusedSlug] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, 'up' | 'down'>>({});
  const [events, setEvents] = useState<EventPlan[]>([]);
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [savingVendor, setSavingVendor] = useState<string | null>(null);
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [showEventPanel, setShowEventPanel] = useState(false);
  const [demoDismissed, setDemoDismissed] = useState(false);
  // Long placeholders wrap on narrow screens and collide with the input bar's
  // bottom controls — swap in short variants below sm
  const [narrowScreen, setNarrowScreen] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const update = () => setNarrowScreen(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const eventPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Interruption model: a new user action (typed send or card click) aborts any
  // in-flight AI response. The generation counter lets superseded async flows
  // detect they're stale and skip all state writes.
  const requestSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Close city dropdown on outside click
  useEffect(() => {
    if (!cityDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [cityDropdownOpen]);

  // Close event picker on outside click
  useEffect(() => {
    if (!showEventPicker) return;
    const handler = (e: MouseEvent) => {
      if (eventPickerRef.current && !eventPickerRef.current.contains(e.target as Node)) {
        setShowEventPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEventPicker]);

  // Init or resume analytics session — runs once on mount
  useEffect(() => {
    const init = async () => {
      try {
        const existingId = localStorage.getItem(SESSION_KEY);
        const { data } = await api.post('/ai-sessions', {
          ...(existingId ? { existingSessionId: existingId } : {}),
        });
        setSessionId(data.sessionId);
        localStorage.setItem(SESSION_KEY, data.sessionId);
      } catch { /* silent — tracking must never break the chat */ }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guests: load single session from sessionStorage on mount
  useEffect(() => {
    if (!user) {
      try {
        const saved = sessionStorage.getItem(GUEST_KEY);
        if (saved) setMessages(JSON.parse(saved));
      } catch { /* silent */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist selected city to localStorage so it survives remounts
  useEffect(() => {
    if (selectedCity) {
      try { localStorage.setItem(CITY_KEY, selectedCity.slug); } catch { /* silent */ }
    }
  }, [selectedCity]);

  // City detection — restores from localStorage immediately, then IP-detects in background
  useEffect(() => {
    getCities().then(async (fetchedCities) => {
      setCities(fetchedCities);

      if (initialCitySlug) {
        const match = fetchedCities.find(c => c.slug === initialCitySlug);
        if (match) setSelectedCity(match);
        return;
      }

      // Restore last-used city immediately so returning users never see "pick your city"
      try {
        const savedSlug = localStorage.getItem(CITY_KEY);
        if (savedSlug) {
          const saved = fetchedCities.find(c => c.slug === savedSlug);
          if (saved) setSelectedCity(saved);
        }
      } catch { /* silent */ }

      // IP detection still runs in background to update city if user is somewhere different
      let detectedCity: string | null = null;

      try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
        const geo = await res.json();
        if (geo.city && !geo.error) detectedCity = geo.city;
      } catch { /* fall through to backup */ }

      if (!detectedCity) {
        try {
          const res = await fetch('https://ip-api.com/json/?fields=city,status', { signal: AbortSignal.timeout(4000) });
          const geo = await res.json();
          if (geo.city && geo.status === 'success') detectedCity = geo.city;
        } catch { /* silent */ }
      }

      if (!detectedCity) return;
      const match = matchCityFromDetected(detectedCity, fetchedCities);
      if (match) setSelectedCity(match);
    }).catch(() => {});
  }, [initialCitySlug]);

  // Auto-scroll messages
  useEffect(() => {
    if (compact && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, compact]);

  // Load event plans when user logs in / out
  useEffect(() => {
    if (!user) { setEvents([]); return; }
    getUserEvents().then(setEvents).catch(() => {});
  }, [user]);

  // Fire-and-forget event tracking — never throws, never blocks
  const trackEvent = useCallback(async (eventType: string, payload?: Record<string, any>) => {
    if (!sessionId) return;
    try {
      await api.post('/ai-events', { sessionId, eventType, payload });
    } catch { /* silent */ }
  }, [sessionId]);

  const handleRating = useCallback((msgId: string, rating: 'up' | 'down') => {
    const current = ratings[msgId];
    if (current === rating) {
      setRatings(prev => { const n = { ...prev }; delete n[msgId]; return n; });
    } else {
      setRatings(prev => ({ ...prev, [msgId]: rating }));
      trackEvent(rating === 'up' ? 'thumbs_up' : 'thumbs_down', { messageId: msgId });
    }
  }, [ratings, trackEvent]);

  const handleSaveVendorToEvent = useCallback(async (business: Business) => {
    if (!user || events.length === 0) return;
    const activeEvents = events.filter(e => e.status === 'active');
    if (activeEvents.length === 0) return;

    const businessCatName = business.subcategory?.name || business.category?.name || '';

    // Search latest active event first so the vendor goes to the current plan
    let bestEventIdx = -1;
    let bestCategory = '';
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].status !== 'active') continue;
      const match = (events[i].checklist || []).find(
        c => c.status === 'pending' && matchesEventCategory(c.category, businessCatName)
      );
      if (match) { bestEventIdx = i; bestCategory = match.category; break; }
    }

    if (bestEventIdx === -1) {
      showToast("This vendor type doesn't match any pending item in your event plan");
      return;
    }

    setSavingVendor(business.slug);
    try {
      await saveVendorToEvent(bestEventIdx, {
        category: bestCategory,
        vendorSlug: business.slug,
        vendorName: business.name,
        ...(sessionId ? { sessionId } : {}),
      });
      const updated = await getUserEvents();
      setEvents(updated);
      showToast(`${business.name} saved to ${events[bestEventIdx].label} checklist`);
    } catch {
      showToast('Failed to save vendor — please try again');
    } finally {
      setSavingVendor(null);
    }
  }, [user, events, sessionId]);

  const handleShareEvent = useCallback(async (eventIdx: number) => {
    try {
      const { token } = await createEventShareLink(eventIdx);
      const shareUrl = `${window.location.origin}/event-plans/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      showToast('Share link copied! Valid for 30 minutes');
    } catch {
      showToast('Failed to create share link');
    }
  }, []);

  const handleCreateEvent = useCallback(async (type: string) => {
    setShowEventPicker(false);
    setCreatingEvent(true);
    try {
      const updatedEvents = await createEvent(type, {
        city: selectedCity?.name || undefined,
      });
      setEvents(updatedEvents);
      setEventsExpanded(true);
      setShowEventPanel(true);

      const label = EVENT_TYPES.find(e => e.type === type)?.label || type;
      const categories = EVENT_CHECKLISTS[type] || [];
      const cityId = selectedCity?.id;
      const cityName = selectedCity?.name || 'your city';

      // Show a loading bubble while we fetch vendors
      const loadingId = uid();
      setMessages(prev => [...prev, { id: loadingId, role: 'assistant' as const, content: '', isLoading: true }]);

      // Fetch all subcategories once, then match each checklist category to subcategoryId(s)
      // This is far more reliable than text search which misses "Bakers", "Nail Techs", etc.
      const subcats = await getSubcategories().catch(() => []);

      const results = await Promise.all(
        categories.map(async cat => {
          const matched = subcats.filter(sc => matchesEventCategory(cat, sc.name));
          if (matched.length > 0) {
            const sub = await Promise.all(
              matched.map(sc => getBusinesses({ cityId, subcategoryId: sc.id }).catch(() => [] as Business[]))
            );
            return sub.flat();
          }
          // Fallback: keyword text search
          const kw = (CATEGORY_KEYWORDS[cat] || [cat.toLowerCase()])[0];
          return getBusinesses({ cityId, search: kw }).catch(() => [] as Business[]);
        })
      );

      // Flatten and deduplicate by business ID
      const seen = new Set<number>();
      const allBusinesses: Business[] = [];
      results.forEach(bs => bs.forEach(b => {
        if (!seen.has(b.id)) { seen.add(b.id); allBusinesses.push(b); }
      }));

      const vendorMsg: ChatMessage = {
        id: loadingId,
        role: 'assistant',
        content: allBusinesses.length > 0
          ? `Here are vendors in ${cityName} for your ${label}! Browse by category and tap the bookmark to save any to your plan.`
          : `No vendors found in ${cityName} yet for your ${label} categories. Try asking me about specific vendors you need!`,
        businesses: allBusinesses,
        followUps: [],
        checklist: [],
        type: 'search',
        showCards: true,
        isLoading: false,
      };
      setMessages(prev => prev.map(m => m.id === loadingId ? vendorMsg : m));
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create event';
      showToast(msg);
    } finally {
      setCreatingEvent(false);
    }
  }, [selectedCity]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const convs = await getConversations();
      setConversations(convs);
    } catch { /* silent */ }
    finally { setHistoryLoading(false); }
  }, [user]);

  const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  // ── SSE stream consumer ────────────────────────────────────────────────────
  // Shared by sendMessage and retryMessage. Streams the AI response token-by-token
  // then processes the final done event for structured data.
  const callAIStream = useCallback(async (
    payload: object,
    streamingMsgId: string,
    effectiveCity: City,
    controller: AbortController,
  ): Promise<AISearchResponse> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // Inactivity timeout instead of a fixed wall: the server sends keepalive
    // pings every 15s, so a healthy stream never goes 30s silent. This never
    // kills a live-but-slow response, only genuinely dead connections.
    let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
    const resetInactivity = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => controller.abort(), 30000);
    };
    resetInactivity();

    // NEXT_PUBLIC_AI_PREVIEW_KEY is set only in Vercel's Preview environment —
    // preview builds get unlimited AI searches, the production bundle never
    // contains the key so production traffic is always rate limited.
    const previewKey = process.env.NEXT_PUBLIC_AI_PREVIEW_KEY;

    const response = await fetch(`${API_BASE_URL}/api/ai-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(previewKey ? { 'X-Preview-Key': previewKey } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (response.status === 429) {
      const err: any = new Error('rate_limit');
      err.is429 = true;
      throw err;
    }

    if (!response.ok || !response.body) {
      throw new Error('Request failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let donePayload: AISearchResponse | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resetInactivity();

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const event = JSON.parse(raw);
            if (event.t === 'ping') continue;
            if (event.t === 'candidates' && Array.isArray(event.data) && event.data.length > 0) {
              // Provisional results from retrieval — render cards immediately while
              // the AI writes. The done event fully replaces this message, so the
              // final AI ranking always supersedes these.
              setMessages(prev => prev.map(m =>
                m.id === streamingMsgId
                  ? { ...m, businesses: event.data, showCards: true, isLoading: false }
                  : m
              ));
            }
            if (event.t === 'chunk' && event.text) {
              setMessages(prev => prev.map(m =>
                m.id === streamingMsgId
                  ? { ...m, content: (m.content || '') + event.text, isLoading: false }
                  : m
              ));
            }
            if (event.t === 'done') {
              donePayload = event as AISearchResponse;
            }
          } catch { /* skip malformed event */ }
        }

        if (donePayload) break;
      }
    } finally {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      reader.cancel().catch(() => {});
    }

    if (!donePayload) throw new Error('No response received');
    return donePayload;
  }, []);

  const sendMessage = useCallback(async (text: string, explicitSlug?: string | null) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // If city not yet detected, try to infer it from the user's message text
    let effectiveCity = selectedCity;
    if (!effectiveCity && cities.length > 0) {
      const inferred = extractCityFromText(trimmed, cities);
      if (inferred) { effectiveCity = inferred; setSelectedCity(inferred); }
    }

    if (!effectiveCity) {
      showToast('Select your city first — pick one below or mention it in chat.');
      return;
    }

    // Interrupt any in-flight response — a new user action (typed message or
    // card click) supersedes whatever the AI was still writing. Finalize the
    // superseded bubble with whatever already streamed in; drop it if empty.
    // Must stay synchronous up to the seq increment below so the superseded
    // flow's catch/finally (microtasks) already see themselves as stale.
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setMessages(prev => prev
        .map(m => m.isLoading
          // Trim the dangling partial word so interrupted text ends cleanly
          ? { ...m, isLoading: false, content: m.content ? m.content.replace(/\s+\S*$/, '') + ' …' : '' }
          : m)
        .filter(m => !(m.role === 'assistant' && !m.isLoading && !m.content && !(m.businesses?.length))));
    }

    const userMsg: ChatMessage = { id: uid(), role: 'user', content: trimmed };
    const loadingId = uid();
    const loadingMsg: ChatMessage = { id: loadingId, role: 'assistant', content: '', isLoading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);
    if (explicitSlug === null) setActiveFocusedSlug(null);

    const historyForAPI = [...messages, userMsg]
      .filter(m => !m.isError && !m.isLoading)
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content }));

    const slugToSend = explicitSlug === null ? undefined : explicitSlug ?? (activeFocusedSlug ?? undefined);

    const seq = ++requestSeqRef.current;
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await callAIStream(
        {
          messages: historyForAPI,
          cityId: effectiveCity.id,
          ...(slugToSend ? { focusedSlug: slugToSend } : {}),
          ...(sessionId ? { sessionId } : {}),
        },
        loadingId,
        effectiveCity,
        controller,
      );
      if (seq !== requestSeqRef.current) return; // superseded by a newer request

      if (data.showCards === false && data.data?.length === 1) {
        setActiveFocusedSlug(data.data[0].slug);
      } else if ((data.data?.length ?? 0) > 1) {
        setActiveFocusedSlug(null);
      }

      if (data.detectedCity) {
        const switched = cities.find(c => c.slug === data.detectedCity);
        if (switched && switched.id !== effectiveCity!.id) {
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

      setMessages(prev => prev.map(m => m.id === loadingId ? assistantMsg : m));

      // Always refresh events for logged-in users after each AI response — ensures
      // the panel appears as soon as the backend writes the new event to DB
      if (user) {
        setTimeout(() => getUserEvents().then(setEvents).catch(() => {}), 800);
      }

      // Persist conversation
      const toSave = [...messages, userMsg, assistantMsg];
      if (user) {
        if (activeConversationId) {
          updateConversation(activeConversationId, toSave, effectiveCity!.slug).catch(() => {});
        } else {
          const firstUser = toSave.find(m => m.role === 'user');
          const title = (firstUser?.content || 'Chat').slice(0, 60);
          createConversation(title, toSave, effectiveCity!.slug)
            .then(res => {
              setActiveConversationId(res.id);
              try {
                const map = JSON.parse(localStorage.getItem(CONV_CITIES_KEY) || '{}');
                map[res.id] = effectiveCity!.slug;
                localStorage.setItem(CONV_CITIES_KEY, JSON.stringify(map));
              } catch { /* silent */ }
              if (res.autoDeleted) showToast('Your oldest chat was auto-removed to make room.');
            })
            .catch(() => {});
        }
      } else {
        try { sessionStorage.setItem(GUEST_KEY, JSON.stringify(toSave)); } catch { /* silent */ }
      }
    } catch (error: any) {
      // Superseded by a newer request — its interrupt already cleaned up our
      // bubble; touching state here would clobber the new request's UI.
      if (seq !== requestSeqRef.current) return;

      const is429 = !!error?.is429;
      if (is429) trackEvent('rate_limit_hit', { guest: !user });

      const errorText = is429
        ? user
          ? "You've reached today's AI search limit — it resets tomorrow."
          : "You've used your free searches for today."
        : 'Something went wrong. Please try again.';

      setMessages(prev => prev.map(m =>
        m.id === loadingId ? { ...m, content: errorText, isLoading: false, isError: true, isRateLimit: is429 } : m
      ));
    } finally {
      if (seq === requestSeqRef.current) {
        setIsLoading(false);
        abortRef.current = null;
      }
    }
  }, [messages, selectedCity, user, activeFocusedSlug, cities, activeConversationId, callAIStream, sessionId, trackEvent]);

  // Retry an errored AI message in-place — replaces the error bubble with loading
  // then with the real response. Does NOT add a new user message to the thread.
  const retryMessage = useCallback(async (errorMsgId: string) => {
    if (isLoading || !selectedCity) return;

    const errorIdx = messages.findIndex(m => m.id === errorMsgId);
    const triggeringUser = messages.slice(0, errorIdx).reverse().find(m => m.role === 'user');
    if (!triggeringUser) return;

    setIsLoading(true);
    setMessages(prev => prev.map(m =>
      m.id === errorMsgId ? { ...m, content: '', isLoading: true, isError: false } : m
    ));

    const historyForAPI = messages
      .filter(m => m.id !== errorMsgId && !m.isError && !m.isLoading)
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content }));

    const slugToSend = activeFocusedSlug ?? undefined;

    const seq = ++requestSeqRef.current;
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await callAIStream(
        {
          messages: historyForAPI,
          cityId: selectedCity.id,
          ...(slugToSend ? { focusedSlug: slugToSend } : {}),
          ...(sessionId ? { sessionId } : {}),
        },
        errorMsgId,
        selectedCity,
        controller,
      );
      if (seq !== requestSeqRef.current) return; // superseded by a newer request

      if (data.showCards === false && data.data?.length === 1) {
        setActiveFocusedSlug(data.data[0].slug);
      } else if ((data.data?.length ?? 0) > 1) {
        setActiveFocusedSlug(null);
      }

      if (data.detectedCity) {
        const switched = cities.find(c => c.slug === data.detectedCity);
        if (switched && switched.id !== selectedCity.id) {
          setSelectedCity(switched);
          setActiveFocusedSlug(null);
        }
      }

      const assistantMsg: ChatMessage = {
        id: errorMsgId,
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

      setMessages(prev => prev.map(m => m.id === errorMsgId ? assistantMsg : m));

      if (user) {
        setTimeout(() => getUserEvents().then(setEvents).catch(() => {}), 800);
      }

      const toSave = messages
        .filter(m => m.id !== errorMsgId && !m.isError && !m.isLoading)
        .concat(assistantMsg);

      if (user) {
        if (activeConversationId) {
          updateConversation(activeConversationId, toSave, selectedCity?.slug).catch(() => {});
        } else {
          const firstUser = toSave.find(m => m.role === 'user');
          const title = (firstUser?.content || 'Chat').slice(0, 60);
          createConversation(title, toSave, selectedCity?.slug)
            .then(res => {
              setActiveConversationId(res.id);
              if (selectedCity) {
                try {
                  const map = JSON.parse(localStorage.getItem(CONV_CITIES_KEY) || '{}');
                  map[res.id] = selectedCity.slug;
                  localStorage.setItem(CONV_CITIES_KEY, JSON.stringify(map));
                } catch { /* silent */ }
              }
              if (res.autoDeleted) showToast('Your oldest chat was auto-removed to make room.');
            })
            .catch(() => {});
        }
      } else {
        try { sessionStorage.setItem(GUEST_KEY, JSON.stringify(toSave)); } catch { /* silent */ }
      }
    } catch (error: any) {
      if (seq !== requestSeqRef.current) return; // superseded — new request owns the UI
      const is429 = !!error?.is429;
      if (is429) trackEvent('rate_limit_hit', { guest: !user });
      const errorText = is429
        ? user
          ? "You've reached today's AI search limit — it resets tomorrow."
          : "You've used your free searches for today."
        : 'Something went wrong. Please try again.';
      setMessages(prev => prev.map(m =>
        m.id === errorMsgId ? { ...m, content: errorText, isLoading: false, isError: true, isRateLimit: is429 } : m
      ));
    } finally {
      if (seq === requestSeqRef.current) {
        setIsLoading(false);
        abortRef.current = null;
      }
    }
  }, [messages, selectedCity, isLoading, user, activeFocusedSlug, cities, activeConversationId, callAIStream, sessionId, trackEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input, null);  // null clears activeFocusedSlug — user typed a new intent
  };

  // Tapping the demo dissolves it and hands its query to the real input, ready to send
  const handleDemoTry = (query: string) => {
    setDemoDismissed(true);
    setInput(query);
    setTimeout(() => {
      const el = textareaRef.current;
      if (el) { el.focus(); resizeTextarea(el); }
    }, 0);
  };

  // Floating use-case pills (FloatingUseCases prototype) pre-fill the chat the
  // same way a demo tap does. Ref keeps the listener stable across renders.
  const demoTryRef = useRef(handleDemoTry);
  demoTryRef.current = handleDemoTry;
  useEffect(() => {
    const onPrefill = (e: Event) => {
      const query = (e as CustomEvent<string>).detail;
      if (typeof query === 'string' && query) demoTryRef.current(query);
    };
    window.addEventListener('buzzgram:prefill', onPrefill);
    return () => window.removeEventListener('buzzgram:prefill', onPrefill);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, null);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setActiveFocusedSlug(null);
    setActiveConversationId(null);
    setRatings({});
    setShowEventPanel(false);
    setEventsExpanded(false);
    if (!user) {
      try { sessionStorage.removeItem(GUEST_KEY); } catch { /* silent */ }
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveFocusedSlug(null);
    setActiveConversationId(null);
    setRatings({});
    setShowHistory(false);
    setShowEventPanel(false);
    setEventsExpanded(false);
  };

  const handleShowHistory = () => {
    setHistoryLoading(true);  // loading skeleton shows immediately, no "no chats" flash
    setShowHistory(true);
    fetchHistory();
  };

  const handleLoadConversation = async (id: number) => {
    try {
      const conv = await getConversationById(id);
      setMessages(conv.messages || []);
      setActiveConversationId(id);
      setActiveFocusedSlug(null);
      setShowHistory(false);

      // Always restore city from conversation — even if selectedCity is already set,
      // load the city the conversation belongs to
      const slug =
        conv.citySlug ||                                              // 1. DB field (permanent fix)
        (() => { try { return JSON.parse(localStorage.getItem(CONV_CITIES_KEY) || '{}')[id] ?? null; } catch { return null; } })() || // 2. localStorage map
        (() => { for (const msg of (conv.messages || [])) { const c = (msg.businesses as any[])?.[0]?.city; if (c?.slug) return c.slug; } return null; })(); // 3. scan messages

      if (slug) {
        const match = cities.find(c => c.slug === slug);
        if (match) setSelectedCity(match);
      }
    } catch { /* silent */ }
  };

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        setMessages([]);
        setActiveConversationId(null);
      }
    } catch { /* silent */ }
  };

  return (
    <div className="w-full flex flex-col gap-4">

      {/* ── Event Plans Panel ── */}
      {user && showEventPanel && events.some(e => e.status === 'active') && (() => {
        const activeWithIdx = events.map((e, i) => ({ event: e, idx: i })).filter(({ event }) => event.status === 'active');
        const { event: latestEvent, idx: latestIdx } = activeWithIdx[activeWithIdx.length - 1];
        const event = latestEvent;
        const globalIdx = latestIdx;
        const found = (event.checklist || []).filter(c => c.status !== 'pending').length;
        const total = (event.checklist || []).length;
        const pct = total > 0 ? Math.round((found / total) * 100) : 0;
        return (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 rounded-xl overflow-hidden">
              <div className="px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">🎉</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{event.label}</span>
                    {event.date && <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">· {event.date}</span>}
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400 flex-shrink-0">{found}/{total} found</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleShareEvent(globalIdx)}
                      title="Copy share link (valid 30 min)"
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800/50 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventsExpanded(x => !x)}
                      aria-label={eventsExpanded ? 'Collapse checklist' : 'Expand checklist'}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                      <svg className={`w-4 h-4 transition-transform duration-200 ${eventsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-2 h-1 bg-orange-100 dark:bg-orange-900/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 dark:bg-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {eventsExpanded && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {(event.checklist || []).map(item => (
                      <span
                        key={item.category}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.status !== 'pending'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-border'
                        }`}
                      >
                        {item.status !== 'pending' ? (
                          <svg className="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full border border-current flex-shrink-0 opacity-40" />
                        )}
                        {item.category}
                        {item.vendorName && (
                          <span className="opacity-60 font-normal">
                            ({item.vendorName.length > 12 ? item.vendorName.slice(0, 12) + '…' : item.vendorName})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
        </div>
        );
      })()}

      {showHistory ? (
        /* ── History panel ── */
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Chat History</h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleNewChat}
                className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
              >
                + New chat
              </button>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                Back
              </button>
            </div>
          </div>

          {historyLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              No saved conversations yet.
            </p>
          ) : (
            <div className={`space-y-1.5 ${scrollCapClass}`}>
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleLoadConversation(conv.id)}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                    conv.id === activeConversationId
                      ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-100 dark:border-dark-border hover:border-gray-200 dark:hover:border-gray-600 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-bg'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{conv.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {conv.messageCount} messages · {formatDate(conv.updatedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    title="Delete"
                    className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* ── Conversation thread ── */}
          {messages.length > 0 && (
            <div
              ref={messagesContainerRef}
              className={`space-y-5 ${scrollCapClass}`}
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

                        {msg.isLoading && (
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 animate-pulse" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 animate-pulse" />
                          </div>
                        )}

                        {!msg.isLoading && msg.content && (
                          <p className={`text-sm leading-relaxed whitespace-pre-line ${msg.isError && !msg.isRateLimit ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'} ${(msg.checklist?.length || msg.businesses?.length) ? 'mb-4' : ''}`}>
                            {msg.isError ? msg.content : renderMarkdown(msg.content)}
                          </p>
                        )}

                        {msg.isError && !msg.isLoading && !msg.isRateLimit && (
                          <button
                            type="button"
                            onClick={() => retryMessage(msg.id)}
                            disabled={isLoading}
                            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors disabled:opacity-40"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Try again
                          </button>
                        )}

                        {/* Rate limit hit — the highest-intent moment for a guest signup */}
                        {msg.isRateLimit && !msg.isLoading && (
                          !user ? (
                            <div className="mt-3 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 p-4">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                Keep the conversation going — free
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                                A free account gets you 20 AI searches every day, saved conversations, and event planning.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Link
                                  href="/register"
                                  onClick={() => trackEvent('rate_limit_signup_click')}
                                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors"
                                >
                                  Sign up free
                                </Link>
                                <Link
                                  href="/login"
                                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 text-xs font-semibold transition-colors bg-white dark:bg-dark-card"
                                >
                                  Log in
                                </Link>
                              </div>
                            </div>
                          ) : selectedCity ? (
                            <Link
                              href={`/city/${selectedCity.slug}`}
                              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                            >
                              Browse {selectedCity.name} vendors directly →
                            </Link>
                          ) : null
                        )}

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

                        {!msg.isLoading && msg.businesses && msg.businesses.length > 0 && (
                          <div className="mb-3">
                            {groupBusinesses(msg.businesses).map(group => (
                              <CarouselRow
                                key={group.label}
                                group={group}
                                onSelect={(name, slug) => {
                                  trackEvent('business_click', { businessSlug: slug });
                                  sendMessage(`What can you tell me about ${name}?`, slug);
                                }}
                                events={events}
                                onSaveVendor={handleSaveVendorToEvent}
                                savingVendor={savingVendor}
                              />
                            ))}
                          </div>
                        )}

                        {!msg.isLoading && msg.followUps && msg.followUps.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {msg.followUps.map((suggestion, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  trackEvent('followup_click', { text: suggestion });
                                  sendMessage(suggestion, msg.focusedSlug);
                                }}
                                disabled={isLoading}
                                className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-orange-400 hover:text-orange-600 dark:hover:border-orange-500 dark:hover:text-orange-400 bg-white dark:bg-dark-card transition-all disabled:opacity-40"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {!msg.isLoading && !msg.isError && msg.content && (
                          <div className="flex items-center gap-0.5 mt-2">
                            <button
                              type="button"
                              onClick={() => handleRating(msg.id, 'up')}
                              title="Good response"
                              className={`p-1 rounded-lg transition-colors ${
                                ratings[msg.id] === 'up'
                                  ? 'text-green-500 dark:text-green-400'
                                  : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500'
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill={ratings[msg.id] === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRating(msg.id, 'down')}
                              title="Poor response"
                              className={`p-1 rounded-lg transition-colors ${
                                ratings[msg.id] === 'down'
                                  ? 'text-red-500 dark:text-red-400'
                                  : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500'
                              }`}
                            >
                              <svg className="w-3.5 h-3.5" fill={ratings[msg.id] === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                              </svg>
                            </button>
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

          {/* ── Empty state ── */}
          {messages.length === 0 && demo && !demoDismissed && (
            <AIDemoPreview cityName={selectedCity?.name ?? null} onTry={handleDemoTry} />
          )}
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
        </>
      )}

      {/* ── Input bar — always visible ── */}
      <form onSubmit={handleSubmit}>
        <div className="relative border-2 border-gray-200 dark:border-dark-border rounded-2xl bg-white dark:bg-dark-card shadow-sm focus-within:border-orange-500 focus-within:shadow-md transition-all">
          <textarea
            ref={textareaRef}
            placeholder={
              showHistory
                ? narrowScreen ? 'Select a conversation above' : 'Select a conversation above or start a new one'
                : !selectedCity
                  ? narrowScreen ? 'Pick your city above, or just ask' : 'Pick your city above, or just ask — e.g. "Show me nail techs in Toronto"'
                  : messages.length === 0
                    ? narrowScreen ? 'Ask anything...' : "Ask anything... e.g. I'm getting married this summer, help me plan"
                    : 'Ask a follow-up...'
            }
            value={input}
            onChange={e => { if (!showHistory) { setInput(e.target.value); resizeTextarea(e.target); } }}
            onFocus={() => { if (demo && !demoDismissed) setDemoDismissed(true); onEngage?.(); }}
            onKeyDown={handleKeyDown}
            disabled={showHistory}
            rows={1}
            className="w-full px-5 pt-4 pb-14 text-base bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 placeholder:whitespace-nowrap placeholder:overflow-hidden placeholder:text-ellipsis focus:outline-none resize-none leading-relaxed disabled:opacity-60"
            style={{ minHeight: '60px', maxHeight: '160px' }}
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            {showHistory ? (
              /* History mode bottom bar */
              <>
                <span className="text-xs text-gray-400 dark:text-gray-500 pointer-events-none select-none">Browsing history</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline px-2 py-1"
                  >
                    New chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 transition-colors px-2 py-1"
                  >
                    Back to chat
                  </button>
                </div>
              </>
            ) : (
              /* Normal mode bottom bar */
              <>
                <div className="flex items-center gap-2">
                {/* City selector — shows detected/selected city, click to switch */}
                <div ref={cityDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setCityDropdownOpen(o => !o)}
                    className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors group"
                  >
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{selectedCity ? selectedCity.name : 'Detecting city…'}</span>
                    {cities.length > 0 && (
                      <svg
                        className={`w-3 h-3 transition-transform duration-150 ${cityDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {cityDropdownOpen && cities.length > 0 && (
                    <div className="absolute bottom-full left-0 mb-2 w-44 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-lg py-1 z-50">
                      {cities.map(city => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city);
                            setActiveFocusedSlug(null);
                            setCityDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                        >
                          <span className={selectedCity?.id === city.id ? 'text-orange-500 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                            {city.name}
                          </span>
                          {selectedCity?.id === city.id && (
                            <svg className="w-3 h-3 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Event planner picker — always visible; guests prompted to log in */}
                {!showHistory && MANUAL_EVENT_PICKER_ENABLED && (
                  <div ref={eventPickerRef} className="relative">
                    <button
                      type="button"
                      onClick={() => user ? setShowEventPicker(o => !o) : showToast('Sign in to use the event planner')}
                      disabled={creatingEvent}
                      className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors disabled:opacity-50"
                    >
                      {creatingEvent ? (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <span>🎉</span>
                      )}
                      <span>Plan event</span>
                      <svg className={`w-3 h-3 transition-transform duration-150 ${showEventPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showEventPicker && (
                      <div className="absolute bottom-full left-0 mb-2 w-44 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-lg py-1 z-50">
                        <p className="px-3 pt-1.5 pb-1 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                          What are you planning?
                        </p>
                        {EVENT_TYPES.map(et => (
                          <button
                            key={et.type}
                            type="button"
                            onClick={() => handleCreateEvent(et.type)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                          >
                            <span>{et.icon}</span>
                            <span>{et.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                </div>

                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearChat}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 transition-colors px-2 py-1"
                    >
                      Clear chat
                    </button>
                  )}
                  {user && (
                    <button
                      type="button"
                      onClick={handleShowHistory}
                      title="Chat history"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-600 hidden sm:block">Enter to send</span>
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim() || showHistory}
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
              </>
            )}
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
