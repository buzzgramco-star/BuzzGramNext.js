"use client";

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCities } from '@/lib/api';
import CityGrid from '@/components/CityGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HomePage() {
  const { data: cities, isLoading, error } = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
  });

  // SEO/AEO Optimization for Homepage
  useEffect(() => {
    // Set page title
    document.title = 'BuzzGram - Discover Local Businesses in Toronto | Beauty, Food & Events';

    // Add canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://buzz-gram-next-js.vercel.app');

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Discover verified local businesses in Toronto. Browse beauty services (nails, lashes, makeup, hair), food services (bakery, catering, chefs), and event services (decor, planning, photography). Connect instantly with top-rated Toronto businesses on BuzzGram.');

    // Add keywords meta tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'Toronto businesses, local businesses Toronto, nail salons Toronto, lash extensions Toronto, makeup artists Toronto, hair salons Toronto, bakery Toronto, catering Toronto, private chef Toronto, event planners Toronto, event decorators Toronto, wedding photographers Toronto, beauty services Toronto, food services Toronto, event services Toronto');

    // Add Open Graph tags
    const setOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setOgTag('og:title', 'BuzzGram - Discover Local Businesses in Toronto');
    setOgTag('og:description', 'Connect with verified local businesses in Toronto. Browse beauty, food, and event services. Get instant quotes from top-rated Toronto businesses.');
    setOgTag('og:type', 'website');
    setOgTag('og:url', 'https://buzz-gram-next-js.vercel.app');
    setOgTag('og:site_name', 'BuzzGram');
    setOgTag('og:locale', 'en_CA');

    // Add Twitter Card tags
    const setTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setTwitterTag('twitter:card', 'summary_large_image');
    setTwitterTag('twitter:title', 'BuzzGram - Discover Local Businesses in Toronto');
    setTwitterTag('twitter:description', 'Connect with verified local businesses in Toronto. Browse beauty, food, and event services.');

    // Add Organization Schema (Critical for SEO/AEO)
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'BuzzGram',
      url: 'https://buzz-gram-next-js.vercel.app',
      logo: 'https://buzz-gram-next-js.vercel.app/logo.png',
      description: 'Toronto\'s premier local business directory connecting customers with verified beauty, food, and event services.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Toronto',
        addressRegion: 'ON',
        addressCountry: 'CA'
      },
      areaServed: {
        '@type': 'City',
        name: 'Toronto',
        '@id': 'https://en.wikipedia.org/wiki/Toronto'
      },
      sameAs: [
        'https://instagram.com/buzzgram'
      ],
      knowsAbout: [
        'Beauty Services',
        'Nail Salons',
        'Lash Extensions',
        'Makeup Artists',
        'Hair Salons',
        'Food Services',
        'Bakeries',
        'Catering Services',
        'Private Chefs',
        'Event Services',
        'Event Planning',
        'Event Decor',
        'Wedding Photography',
        'Local Business Directory',
        'Toronto Businesses'
      ]
    };

    // Add WebSite Schema with SearchAction (helps Google show search box)
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'BuzzGram',
      url: 'https://buzz-gram-next-js.vercel.app',
      description: 'Discover verified local businesses in Toronto',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://buzz-gram-next-js.vercel.app/city/36?search={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    };

    // Combine schemas
    const combinedSchema = {
      '@context': 'https://schema.org',
      '@graph': [organizationSchema, websiteSchema]
    };

    // Insert structured data
    let script = document.querySelector('script[type="application/ld+json"][data-page="home"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-page', 'home');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(combinedSchema);

    return () => {
      document.title = 'BuzzGram - Discover Local Businesses';
    };
  }, []);

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Cities
            </h2>
            <p className="text-red-600 dark:text-red-300">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-card dark:to-dark-bg border-b border-gray-200 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Discover Local Businesses
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Explore amazing businesses across cities. From beauty salons to restaurants, find your next favorite spot.
            </p>
          </div>
        </div>

        {/* Cities Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Browse by City
          </h2>

          {cities && cities.length > 0 ? (
            <CityGrid cities={cities} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300">No cities available</p>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
