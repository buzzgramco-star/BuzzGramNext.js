import { Suspense } from 'react';
import { Metadata } from 'next';
import { getBusinesses, getCategories, getSubcategories } from '@/lib/api';
import Header from '@/components/Header';
import CategoryClient from './CategoryClient';

// Category slug to ID mapping
const CATEGORY_SLUGS: Record<string, number> = {
  beauty: 10,
  food: 11,
  events: 12,
};

const CATEGORY_NAMES: Record<string, string> = {
  beauty: 'Beauty Services',
  food: 'Food Services',
  events: 'Event Services',
};

type Props = {
  params: Promise<{ category: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const categoryName = CATEGORY_NAMES[categorySlug];

  if (!categoryName) {
    return {
      title: 'Category Not Found | BuzzGram',
      description: 'The category you are looking for does not exist.',
    };
  }

  return {
    title: `${categoryName} in Toronto | BuzzGram`,
    description: `Discover the best ${categoryName.toLowerCase()} in Toronto. Browse verified businesses, read reviews, and connect with top-rated local services.`,
    openGraph: {
      title: `${categoryName} in Toronto`,
      description: `Find trusted ${categoryName.toLowerCase()} businesses in Toronto`,
      type: 'website',
    },
  };
}

// Server Component - SSR for SEO
export default async function CategoryPage({ params }: Props) {
  try {
    const { category: categorySlug } = await params;
    const categoryId = CATEGORY_SLUGS[categorySlug];
    const categoryName = CATEGORY_NAMES[categorySlug];

    if (!categoryId || !categoryName) {
      return (
        <>
          <Suspense fallback={<div className="h-16" />}>
            <Header />
          </Suspense>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                Category Not Found
              </h2>
              <p className="text-red-600 dark:text-red-300">
                The category you are looking for does not exist.
              </p>
            </div>
          </div>
        </>
      );
    }

    // Fetch all data server-side in parallel
    const [businesses, subcategories] = await Promise.all([
      getBusinesses({ cityId: 36, categoryId }),
      getSubcategories(),
    ]);

    return (
      <>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <CategoryClient
          citySlug="toronto"
          categorySlug={categorySlug}
          categoryName={categoryName}
          businesses={businesses}
          subcategories={subcategories}
          categoryId={categoryId}
        />
      </>
    );
  } catch (error) {
    console.error('[Category Page] Error:', error);
    return (
      <>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Category
            </h2>
            <p className="text-red-600 dark:text-red-300">
              An error occurred while loading the category. Please try again later.
            </p>
          </div>
        </div>
      </>
    );
  }
}
