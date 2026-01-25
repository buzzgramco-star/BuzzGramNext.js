import { getCityBySlug, getBusinesses, getCategories, getSubcategories } from '@/lib/api';
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
    // Fetch all data server-side in parallel
    const [city, categories, subcategories, businesses] = await Promise.all([
      getCityBySlug(slug),
      getCategories(),
      getSubcategories(),
      getBusinesses({ cityId: 0 }), // We'll fetch by city.id below
    ]);

    // Fetch businesses for the specific city
    const cityBusinesses = await getBusinesses({ cityId: city.id });

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
