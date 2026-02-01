"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start gap-4">
          {/* Cookie Icon */}
          <div className="flex-shrink-0 hidden sm:block">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="15" cy="9" r="1.5" />
                <circle cx="9" cy="15" r="1.5" />
                <circle cx="16" cy="15" r="1.5" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              We Value Your Privacy
            </h3>

            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              We use cookies to enhance your browsing experience, provide personalized content, analyze site traffic, and understand where our visitors are coming from. By clicking "Accept All", you consent to our use of cookies.{' '}
              <Link href="/privacy" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium underline">
                Learn more in our Privacy Policy
              </Link>
            </p>

            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience, personalize content, and analyze website traffic.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={handleDecline}
              className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors whitespace-nowrap"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
