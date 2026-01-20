"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCities } from '@/lib/api';

export default function CitySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const cityId = params?.cityId as string | undefined;

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
  });

  // Close dropdown when clicking outside (desktop and mobile)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleTouchOutside(event: TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleTouchOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchOutside);
    };
  }, []);

  // Save current city to localStorage when on a city page
  useEffect(() => {
    if (cityId) {
      localStorage.setItem('lastSelectedCityId', cityId);
    }
  }, [cityId]);

  // Auto-redirect returning users from homepage to their last selected city
  useEffect(() => {
    if (pathname === '/' && cities) {
      const lastCityId = localStorage.getItem('lastSelectedCityId');
      if (lastCityId) {
        router.push(`/city/${lastCityId}`);
      }
    }
  }, [pathname, cities, router]);

  const handleCitySelect = (selectedCityId: number) => {
    localStorage.setItem('lastSelectedCityId', selectedCityId.toString());
    router.push(`/city/${selectedCityId}`);
    setIsOpen(false);
  };

  // Determine the current city to display
  const currentCity = useMemo(() => {
    if (!cities || cities.length === 0) return null;

    // If we're on a city page, use that city
    if (cityId) {
      const city = cities.find((c) => c.id === Number(cityId));
      if (city) {
        return city;
      }
    }

    // If not on a city page, try to get last selected city from localStorage
    const lastCityId = localStorage.getItem('lastSelectedCityId');
    if (lastCityId) {
      const city = cities.find((c) => c.id === Number(lastCityId));
      if (city) return city;
    }

    // No default - let user select a city
    return null;
  }, [cities, cityId, pathname]);

  if (!cities || cities.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors border border-gray-200 dark:border-dark-border"
        title={currentCity?.name || 'Select City'}
      >
        <svg
          className="w-5 h-5 text-orange-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        <svg
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border py-1 z-50 max-h-96 overflow-y-auto">
          {cities.map((city) => {
            const isSelected = currentCity?.id === city.id;
            return (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city.id)}
                className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg'
                }`}
              >
                <svg
                  className={`w-4 h-4 mr-3 ${
                    isSelected
                      ? 'text-orange-500'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{city.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
