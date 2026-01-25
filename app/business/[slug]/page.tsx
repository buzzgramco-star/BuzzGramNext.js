import { redirect } from 'next/navigation';
import { getBusinessBySlug, getBusiness, getCategories, getSubcategories, getBusinessReviews } from '@/lib/api';
import BusinessDetailClient from './BusinessDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

// Server Component - SSR for SEO
export default async function BusinessDetail({ params }: Props) {
  const { slug } = await params;

  try {
    let business;

    // Check if slug is actually an ID (number) - for backward compatibility
    if (/^\d+$/.test(slug)) {
      console.log('[Business Page] Fetching business by ID:', slug);
      business = await getBusiness(parseInt(slug, 10));
      console.log('[Business Page] Business found:', business.name, 'slug:', business.slug);
      // Redirect to the proper slug URL (this throws NEXT_REDIRECT)
      redirect(`/business/${business.slug}`);
    } else {
      // It's a slug - fetch normally
      console.log('[Business Page] Fetching business by slug:', slug);
      business = await getBusinessBySlug(slug);
      console.log('[Business Page] Business found:', business.name);
    }

    // Fetch all other data server-side in parallel for SEO
    const [categories, subcategories, reviews] = await Promise.all([
      getCategories(),
      getSubcategories(),
      getBusinessReviews(business.id),
    ]);

    return (
      <BusinessDetailClient
        business={business}
        categories={categories}
        subcategories={subcategories}
        initialReviews={reviews}
      />
    );
  } catch (error: any) {
    // Re-throw Next.js redirect errors - they must bubble up to Next.js
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('[Business Page] Error:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Business Not Found
          </h2>
          <p className="text-red-600 dark:text-red-300">
            The business you are looking for does not exist or there was an error loading the data.
          </p>
        </div>
      </div>
    );
  }
}
