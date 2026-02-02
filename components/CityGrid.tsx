import Link from 'next/link';
import type { City } from '@/types';

interface CityGridProps {
  cities: City[];
}

export default function CityGrid({ cities }: CityGridProps) {
  // Category images representing Beauty, Food, and Events services
  const getCityImage = (cityName: string) => {
    const images: Record<string, string> = {
      // Beauty Services (with people)
      'Los Angeles': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop', // Makeup artist working
      'New York City': 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=800&auto=format&fit=crop', // Nail salon with person
      'Miami': 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800&auto=format&fit=crop', // Lash artist working
      'Chicago': 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&auto=format&fit=crop', // Hair salon with stylist
      // Food Services (with people)
      'Phoenix': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop', // Baker with pastries
      'Toronto': 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&auto=format&fit=crop', // Chef plating food
      'Vancouver': 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800&auto=format&fit=crop', // Kid with birthday cake
      // Events Services (with people and decor)
      'Calgary': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop', // Wedding/event setup with people
      'Montreal': 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&auto=format&fit=crop', // Event planner decorating
      'Ottawa': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop', // Florist arranging flowers
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
