import Link from 'next/link';
import type { City } from '@/types';

interface CityGridProps {
  cities: City[];
}

export default function CityGrid({ cities }: CityGridProps) {
  // Placeholder images for cities
  const getCityImage = (cityName: string) => {
    const images: Record<string, string> = {
      'Los Angeles': 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800&auto=format&fit=crop',
      'New York City': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop',
      'Miami': 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=800&auto=format&fit=crop',
      'Chicago': 'https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&auto=format&fit=crop',
      'Phoenix': 'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=800&auto=format&fit=crop',
      'Toronto': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&auto=format&fit=crop',
      'Vancouver': 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800&auto=format&fit=crop',
      'Calgary': 'https://images.unsplash.com/photo-1561134643-668f9057cce4?w=800&auto=format&fit=crop',
      'Montreal': 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&auto=format&fit=crop',
      'Ottawa': 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&auto=format&fit=crop',
    };
    return images[cityName] || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {cities.map((city) => (
        <Link
          key={city.id}
          href={`/city/${city.slug}`}
          className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border"
        >
          <div className="aspect-video relative overflow-hidden">
            <img
              src={getCityImage(city.name)}
              alt={city.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-1 drop-shadow-lg tracking-tight">{city.name}</h3>
            {city.description && (
              <p className="text-sm text-gray-200 mt-2 line-clamp-2 drop-shadow-md leading-relaxed">
                {city.description}
              </p>
            )}
            <div className="mt-4 flex items-center text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-sm font-medium">Explore businesses</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
