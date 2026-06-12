'use client';

import { useState } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  {
    name: 'Beauty',
    slug: 'beauty',
    emoji: '💄',
    tagline: 'Nails, hair, makeup & more',
    subs: ['Nails', 'Hair', 'Makeup', 'Lashes', 'Skincare'],
    gradient: 'from-rose-50 to-orange-50 dark:from-rose-900/10 dark:to-orange-900/10',
    border: 'border-rose-100 dark:border-rose-900/20',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-700',
    subColor: 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300',
    iconBg: 'bg-rose-100 dark:bg-rose-900/20',
    arrowColor: 'text-rose-500 dark:text-rose-400',
  },
  {
    name: 'Food',
    slug: 'food',
    emoji: '🍰',
    tagline: 'Bakers, catering & home chefs',
    subs: ['Bakers', 'Catering', 'Meal Prep', 'Desserts', 'Specialty'],
    gradient: 'from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10',
    border: 'border-amber-100 dark:border-amber-900/20',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
    subColor: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    iconBg: 'bg-amber-100 dark:bg-amber-900/20',
    arrowColor: 'text-amber-500 dark:text-amber-400',
  },
  {
    name: 'Events',
    slug: 'events',
    emoji: '🎉',
    tagline: 'Photographers, decor & planners',
    subs: ['Photographers', 'Event Decor', 'Planners', 'Catering', 'Entertainment'],
    gradient: 'from-violet-50 to-orange-50 dark:from-violet-900/10 dark:to-orange-900/10',
    border: 'border-violet-100 dark:border-violet-900/20',
    hoverBorder: 'hover:border-violet-300 dark:hover:border-violet-700',
    subColor: 'bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300',
    iconBg: 'bg-violet-100 dark:bg-violet-900/20',
    arrowColor: 'text-violet-500 dark:text-violet-400',
  },
];

const CITIES = [
  { name: 'Toronto', slug: 'toronto' },
  { name: 'Vancouver', slug: 'vancouver' },
  { name: 'Calgary', slug: 'calgary' },
  { name: 'Montreal', slug: 'montreal' },
  { name: 'Ottawa', slug: 'ottawa' },
  { name: 'New York', slug: 'new-york-city' },
  { name: 'Los Angeles', slug: 'los-angeles' },
  { name: 'Miami', slug: 'miami' },
  { name: 'Chicago', slug: 'chicago' },
  { name: 'Phoenix', slug: 'phoenix' },
];

export default function BrowseCategories() {
  const [selectedCity, setSelectedCity] = useState('toronto');

  return (
    <div className="bg-white dark:bg-dark-bg py-16 sm:py-24 border-t border-gray-100 dark:border-dark-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-600 dark:text-orange-500 mb-3">Browse</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Prefer to explore on your own?
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400">Browse vendors by category across all our cities.</p>
        </div>

        {/* City selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CITIES.map(city => (
            <button
              key={city.slug}
              onClick={() => setSelectedCity(city.slug)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCity === city.slug
                  ? 'bg-orange-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600 dark:hover:text-orange-400'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/city/${selectedCity}/${cat.slug}`}
              className={`group relative bg-gradient-to-br ${cat.gradient} border ${cat.border} ${cat.hoverBorder} rounded-2xl p-6 flex flex-col gap-4 hover:-translate-y-2 hover:shadow-xl transition-all duration-300`}
            >
              {/* Arrow */}
              <div className={`absolute top-5 right-5 ${cat.arrowColor} opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              {/* Emoji */}
              <div className={`w-14 h-14 rounded-2xl ${cat.iconBg} flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110`}>
                {cat.emoji}
              </div>

              {/* Text */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{cat.tagline}</p>

                {/* Subcategory pills */}
                <div className="flex flex-wrap gap-1.5">
                  {cat.subs.map(sub => (
                    <span key={sub} className={`text-xs font-medium px-2.5 py-1 rounded-full ${cat.subColor}`}>
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
