"use client";

import { useState } from 'react';
import Link from 'next/link';
import ContactModal from './ContactModal';

export default function Footer() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* BuzzGram Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl font-bold tracking-tight">
                <span className="text-gray-900 dark:text-white">Buzz</span>
                <span className="text-orange-500">Gram</span>
              </h2>
            </Link>
          </div>

          {/* Footer Links */}
          <div className="flex justify-center items-center gap-8 mb-6">
            <Link
              href="/about"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/blog"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Privacy
            </Link>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Contact
            </button>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2026 BuzzGram. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}
