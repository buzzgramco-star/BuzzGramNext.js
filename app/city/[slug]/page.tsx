import { redirect } from 'next/navigation';
import { getCityBySlug, getCityById, getBusinesses, getCategories, getSubcategories } from '@/lib/api';
import CityPageClient from './CityPageClient';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Server Component - SSR for SEO
export default async function CityPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const search = await searchParams;

  try {
    let city;

    // Check if slug is actually an ID (number)
    if (/^\d+$/.test(slug)) {
      // It's a numeric ID - fetch by ID and redirect to slug URL
      try {
        city = await getCityById(parseInt(slug, 10));
        // Redirect to the proper slug URL
        redirect(`/city/${city.slug}`);
      } catch (error) {
        // City ID not found
        throw new Error('City not found');
      }
    } else {
      // It's a slug - fetch normally
      city = await getCityBySlug(slug);
    }

    // Fetch all other data server-side in parallel
    const [categories, subcategories, cityBusinesses] = await Promise.all([
      getCategories(),
      getSubcategories(),
      getBusinesses({ cityId: city.id }),
    ]);

    return (
      <CityPageClient
        city={city}
        businesses={cityBusinesses}
        categories={categories}
        subcategories={subcategories}
        searchTerm={(search?.search as string) || ''}
      />
    );
  } catch (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            City Not Found
          </h2>
          <p className="text-red-600 dark:text-red-300">
            The city you are looking for does not exist or there was an error loading the data.
          </p>
        </div>
      </div>
    );
  }
}
