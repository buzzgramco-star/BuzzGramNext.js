"use client";

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import UserDropdown from './UserDropdown';
import CitySelector from './CitySelector';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Check if we're on a city page
  const isCityPage = pathname?.startsWith('/city/') || false;
  const searchTerm = searchParams?.get('search') || '';

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link href="/" className="group">
              <div>
                {/* Modern Text Logo */}
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="text-gray-900 dark:text-white">Buzz</span>
                  <span className="text-orange-500">Gram</span>
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 tracking-wide">
                  Discover Local Businesses
                </p>
              </div>
            </Link>

            {/* City Selector */}
            <CitySelector />

            {/* Search Bar - Only on City Pages, Hidden on Mobile */}
            {isCityPage && (
              <div className="relative w-48 lg:w-64 hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-3 py-1.5 pl-9 text-sm border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* One Quote Button - Visible to everyone */}
            <button
              onClick={() => router.push('/quote')}
              className="px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 border border-gray-200 dark:border-dark-border hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-lg transition-colors"
            >
              One Quote
            </button>

            {/* Desktop Menu - Hidden on Mobile */}
            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <>
                  {/* User Dropdown */}
                  <UserDropdown />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Mobile Menu - Visible on Mobile Only */}
            {user ? (
              // If logged in, show UserDropdown on mobile
              <div className="md:hidden">
                <UserDropdown />
              </div>
            ) : (
              // If not logged in, show mobile menu button
              <div className="md:hidden relative" ref={mobileMenuRef}>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2.5 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-200"
                  aria-label="Open menu"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border py-1 z-50">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                    >
                      Sign Up
                    </Link>
                    <div className="border-t border-gray-200 dark:border-dark-border my-1"></div>
                    <button
                      onClick={() => {
                        toggleTheme();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                    >
                      {theme === 'dark' ? (
                        <>
                          <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                          </svg>
                          Light Mode
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                          </svg>
                          Dark Mode
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
