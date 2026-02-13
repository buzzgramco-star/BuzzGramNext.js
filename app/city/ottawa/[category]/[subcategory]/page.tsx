import { Suspense } from 'react';
import { Metadata } from 'next';
import { getBusinesses } from '@/lib/api';
import Header from '@/components/Header';
import SubcategoryClient from './SubcategoryClient';

// Subcategory configuration
const SUBCATEGORY_CONFIG: Record<string, Record<string, { id: number; name: string; categoryId: number; categoryName: string }>> = {
  beauty: {
    nails: { id: 11, name: 'Nail Salons', categoryId: 10, categoryName: 'Beauty Services' },
    lashes: { id: 12, name: 'Lash Extensions', categoryId: 10, categoryName: 'Beauty Services' },
    makeup: { id: 13, name: 'Makeup Artists', categoryId: 10, categoryName: 'Beauty Services' },
    hair: { id: 14, name: 'Hair Salons', categoryId: 10, categoryName: 'Beauty Services' },
  },
  food: {
    bakery: { id: 15, name: 'Bakery', categoryId: 11, categoryName: 'Food Services' },
    catering: { id: 16, name: 'Catering Services', categoryId: 11, categoryName: 'Food Services' },
    chef: { id: 17, name: 'Private Chefs', categoryId: 11, categoryName: 'Food Services' },
  },
  events: {
    decor: { id: 18, name: 'Event Decor', categoryId: 12, categoryName: 'Event Services' },
    planning: { id: 19, name: 'Event Planning', categoryId: 12, categoryName: 'Event Services' },
    photography: { id: 20, name: 'Event Photography', categoryId: 12, categoryName: 'Event Services' },
  },
};

type Props = {
  params: Promise<{ category: string; subcategory: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const subcategoryConfig = SUBCATEGORY_CONFIG[categorySlug]?.[subcategorySlug];

  if (!subcategoryConfig) {
    return {
      title: 'Subcategory Not Found | BuzzGram',
      description: 'The subcategory you are looking for does not exist.',
    };
  }

  const canonicalUrl = `https://www.buzzgram.co/city/ottawa/${categorySlug}/${subcategorySlug}`;

  return {
    title: `${subcategoryConfig.name} in Ottawa | BuzzGram`,
    description: `Discover verified ${subcategoryConfig.name.toLowerCase()} in Ottawa. Browse portfolios, read reviews, and connect with top-rated professionals.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${subcategoryConfig.name} in Ottawa`,
      description: `Find trusted ${subcategoryConfig.name.toLowerCase()} professionals in Ottawa`,
      type: 'website',
      url: canonicalUrl,
    },
  };
}

// Server Component - SSR for SEO
export default async function SubcategoryPage({ params }: Props) {
  try {
    const { category: categorySlug, subcategory: subcategorySlug } = await params;
    const subcategoryConfig = SUBCATEGORY_CONFIG[categorySlug]?.[subcategorySlug];

    if (!subcategoryConfig) {
      return (
        <>
          <Suspense fallback={<div className="h-16" />}>
            <Header />
          </Suspense>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                Subcategory Not Found
              </h2>
              <p className="text-red-600 dark:text-red-300">
                The subcategory you are looking for does not exist.
              </p>
            </div>
          </div>
        </>
      );
    }

    // Fetch businesses server-side (Ottawa city ID: 37)
    const businesses = await getBusinesses({
      cityId: 40,
      categoryId: subcategoryConfig.categoryId,
      subcategoryId: subcategoryConfig.id,
    });

    return (
      <>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <SubcategoryClient
          businesses={businesses}
          subcategoryName={subcategoryConfig.name}
          categoryName={subcategoryConfig.categoryName}
          citySlug="ottawa"
          categorySlug={categorySlug}
          subcategorySlug={subcategorySlug}
        />
      </>
    );
  } catch (error) {
    console.error('[Ottawa Subcategory Page] Error:', error);
    return (
      <>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Subcategory
            </h2>
            <p className="text-red-600 dark:text-red-300">
              An error occurred while loading the subcategory. Please try again later.
            </p>
          </div>
        </div>
      </>
    );
  }
}
