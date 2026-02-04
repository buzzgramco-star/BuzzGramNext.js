import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Your 10 supported cities with coordinates for nearest city detection
const SUPPORTED_CITIES = [
  { slug: 'toronto', name: 'Toronto', lat: 43.6532, lon: -79.3832 },
  { slug: 'vancouver', name: 'Vancouver', lat: 49.2827, lon: -123.1207 },
  { slug: 'montreal', name: 'Montreal', lat: 45.5017, lon: -73.5673 },
  { slug: 'ottawa', name: 'Ottawa', lat: 45.4215, lon: -75.6972 },
  { slug: 'calgary', name: 'Calgary', lat: 51.0447, lon: -114.0719 },
  { slug: 'new-york-city', name: 'New York', lat: 40.7128, lon: -74.0060 },
  { slug: 'chicago', name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { slug: 'los-angeles', name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { slug: 'miami', name: 'Miami', lat: 25.7617, lon: -80.1918 },
  { slug: 'phoenix', name: 'Phoenix', lat: 33.4484, lon: -112.0740 },
];

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest city based on coordinates
function findNearestCity(lat: number, lon: number): string {
  let nearestCity = 'toronto'; // Default
  let minDistance = Infinity;

  for (const city of SUPPORTED_CITIES) {
    const distance = calculateDistance(lat, lon, city.lat, city.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city.slug;
    }
  }

  return nearestCity;
}

// Detect city from Vercel geo headers
function detectCity(request: NextRequest): string {
  // Get Vercel geo headers
  const vercelCity = request.headers.get('x-vercel-ip-city');
  const vercelCountry = request.headers.get('x-vercel-ip-country');
  const vercelLat = request.headers.get('x-vercel-ip-latitude');
  const vercelLon = request.headers.get('x-vercel-ip-longitude');

  // Try to match city name directly
  if (vercelCity) {
    const cityName = decodeURIComponent(vercelCity).toLowerCase();

    // Direct match with our cities
    const directMatch = SUPPORTED_CITIES.find(city =>
      city.name.toLowerCase() === cityName ||
      cityName.includes(city.name.toLowerCase())
    );

    if (directMatch) {
      return directMatch.slug;
    }
  }

  // If we have coordinates, find nearest city
  if (vercelLat && vercelLon) {
    const lat = parseFloat(vercelLat);
    const lon = parseFloat(vercelLon);

    if (!isNaN(lat) && !isNaN(lon)) {
      return findNearestCity(lat, lon);
    }
  }

  // Default to Toronto if detection fails
  return 'toronto';
}

export function middleware(request: NextRequest) {
  // Only run on homepage
  if (request.nextUrl.pathname === '/') {
    const detectedCity = detectCity(request);

    // Add detected city to response headers so it's available to the page
    const response = NextResponse.next();
    response.headers.set('x-detected-city', detectedCity);

    return response;
  }

  return NextResponse.next();
}

// Only run middleware on homepage
export const config = {
  matcher: '/',
};
