import Link from 'next/link';

export default function Footer() {
  return (
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
            href="/blog"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            Blog
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
          <Link
            href="/contact"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            Contact
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 BuzzGram. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
