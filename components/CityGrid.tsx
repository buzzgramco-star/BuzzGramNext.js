import Link from 'next/link';
import type { City } from '@/types';

interface CityGridProps {
  cities: City[];
}

export default function CityGrid({ cities }: CityGridProps) {
  // Category images representing Beauty, Food, and Events services
  const getCityImage = (cityName: string) => {
    const images: Record<string, string> = {
      // Beauty Services
      'Los Angeles': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&auto=format&fit=crop', // Makeup brushes
      'New York City': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop', // Nail polish
      'Miami': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&auto=format&fit=crop', // Lash extensions
      'Chicago': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&auto=format&fit=crop', // Hair styling
      // Food Services
      'Phoenix': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop', // Desserts/Bakery
      'Toronto': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop', // Catering/Food
      'Vancouver': 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop', // Gourmet food
      // Events Services
      'Calgary': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop', // Party balloons
      'Montreal': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop', // Event decorations
      'Ottawa': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop', // Wedding flowers
    };
    return images[cityName] || 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&auto=format&fit=crop';
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
