"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Business } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { addFavorite, removeFavorite, checkFavorite } from '@/lib/api';
import VerifiedBadge from './VerifiedBadge';

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if business is favorited on mount
  useEffect(() => {
    async function checkIfFavorited() {
      if (user) {
        try {
          const favorited = await checkFavorite(business.id);
          setIsFavorited(favorited);
        } catch (error) {
          // User not authenticated or error occurred
          setIsFavorited(false);
        }
      }
    }
    checkIfFavorited();
  }, [user, business.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        await removeFavorite(business.id);
        setIsFavorited(false);
      } else {
        await addFavorite(business.id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative group bg-white dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-dark-border">
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        disabled={isLoading}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 sm:p-2 rounded-full bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border hover:border-orange-500 dark:hover:border-orange-500 transition-all z-10"
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg
          className={`w-5 h-5 sm:w-5 sm:h-5 transition-colors ${
            isFavorited
              ? 'fill-orange-500 text-orange-500'
              : 'fill-none text-gray-400 dark:text-gray-500 hover:text-orange-500'
          }`}
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <Link href={`/business/${business.slug}`} className="block">
      {/* Business Name */}
      <h3 className="text-xl sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors tracking-tight flex items-center gap-1.5">
        {business.name}
        {business.claimedAt && business.approvedAt && (
          <VerifiedBadge size="sm" />
        )}
      </h3>

      {/* Category Badge */}
      {business.category && (
        <div className="inline-flex items-center px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-xs sm:text-xs font-medium mb-4">
          <span className="mr-1.5 text-base sm:text-sm">{business.category.icon}</span>
          {business.category.name}
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-3 sm:space-y-2.5">
        {/* Instagram Handle */}
        {business.instagramHandle && (
          <a
            href={business.instagramUrl || `https://instagram.com/${business.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center text-base sm:text-sm text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group/instagram w-fit"
          >
            <svg className="w-5 h-5 sm:w-4 sm:h-4 mr-2 text-orange-500 group-hover/instagram:text-orange-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="font-medium">@{business.instagramHandle}</span>
          </a>
        )}

        {/* Location */}
        {business.city && (
          <div className="flex items-center text-base sm:text-sm text-gray-600 dark:text-gray-300">
            <svg className="w-5 h-5 sm:w-4 sm:h-4 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{business.city.name}</span>
          </div>
        )}
      </div>
      </Link>
    </div>
  );
}
