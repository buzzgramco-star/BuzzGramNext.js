"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { BlogPost } from '@/types';

type Props = {
  blog: BlogPost;
  formatDate: (dateString: string) => string;
};

export default function BlogDetailClient({ blog, formatDate }: Props) {
  const [activeSection, setActiveSection] = useState('');
  const [readProgress, setReadProgress] = useState(0);
  const [showFAQ, setShowFAQ] = useState(false);

  // Extract headings for TOC
  useEffect(() => {
    const content = document.querySelector('.blog-content');
    if (!content) return;

    const headings = content.querySelectorAll('h2');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `section-${index}`;
      }
      observer.observe(heading);
    });

    return () => observer.disconnect();
  }, []);

  // Track read progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if content has FAQ section
  useEffect(() => {
    setShowFAQ(blog.content.toLowerCase().includes('frequently asked questions'));
  }, [blog.content]);

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Article Header - Full Width Hero */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-dark-card dark:via-dark-bg dark:to-dark-card border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
          </nav>

          <div className="max-w-4xl">
            {/* Category */}
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                {blog.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {blog.title}
            </h1>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">{blog.authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>15 min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content with Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-12">
          {/* Main Content */}
          <article className="flex-1 min-w-0">
            <div
              className="blog-content prose prose-lg dark:prose-invert max-w-none
                prose-headings:scroll-mt-24
                prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900 dark:prose-h2:text-white prose-h2:mt-12 prose-h2:mb-4 prose-h2:leading-tight
                prose-h3:text-xl prose-h3:font-semibold prose-h3:text-gray-800 dark:prose-h3:text-gray-200 prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-orange-600 dark:prose-a:text-orange-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                prose-ul:my-4 prose-ul:space-y-2 prose-li:text-gray-700 dark:prose-li:text-gray-300
                prose-ol:my-4 prose-ol:space-y-2
                prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50 dark:prose-blockquote:bg-orange-900/20 prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:my-6
                prose-code:text-orange-600 dark:prose-code:text-orange-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-hr:border-gray-200 dark:prose-hr:border-gray-700 prose-hr:my-8
                break-words"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* CTA Section */}
            <div className="mt-12 p-8 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/10 dark:to-pink-900/10 rounded-2xl border border-orange-200 dark:border-orange-800">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Ready to discover quality local businesses?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Browse verified businesses in your city across Beauty, Food, and Event services.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-orange-200 dark:shadow-orange-900/30"
                >
                  Explore Businesses
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-lg transition-colors border border-gray-300 dark:border-dark-border"
                >
                  Read More Articles
                </Link>
              </div>
            </div>
          </article>

          {/* Sidebar - Table of Contents (Desktop Only) */}
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                  On This Page
                </h3>
                <nav className="space-y-2">
                  {/* TOC will be populated by headings */}
                  <div className="text-sm space-y-2" id="toc-container">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      Scroll to see navigation
                    </p>
                  </div>
                </nav>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
