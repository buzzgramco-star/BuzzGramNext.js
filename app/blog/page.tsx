import { Suspense } from 'react';
import { getPublishedBlogs } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogListClient from './BlogListClient';

// Server Component - SSR for SEO
export default async function BlogListingPage() {
  try {
    const blogs = await getPublishedBlogs();

    return (
      <>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <BlogListClient blogs={blogs} />
      </>
    );
  } catch (error) {
    console.error('[Blog List] Error fetching blogs:', error);
    return (
      <>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error Loading Blog
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              An error occurred while loading the blog. Please try again later.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
}
