"use client";

import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api, getCities, getCategories, getSubcategories } from '@/lib/api';
import type { City, Category, Subcategory } from '@/types';

function BusinessSignupPageContent() {
  const router = useRouter();
  

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subcategoryId, setSubcategoryId] = useState<number | ''>('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch data
  const { data: cities } = useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: getCities,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: allSubcategories } = useQuery<Subcategory[]>({
    queryKey: ['subcategories'],
    queryFn: getSubcategories,
  });

  // Filter subcategories based on selected category
  const filteredSubcategories = allSubcategories?.filter(
    (sub) => sub.categoryId === categoryId
  ) || [];

  // Reset subcategory when category changes
  useEffect(() => {
    setSubcategoryId('');
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !email || !phone || !businessName || !instagramHandle || !cityId || !categoryId) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await api.post('/business-registrations/form', {
        name,
        email,
        phone,
        businessName,
        instagramHandle,
        cityId,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        additionalInfo: additionalInfo || undefined,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Registration Submitted!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your business registration has been submitted successfully. Our team will review your application within 48 hours.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              We'll contact you via email at <strong className="text-gray-900 dark:text-white">{email}</strong> or phone at <strong className="text-gray-900 dark:text-white">{phone}</strong> with next steps.
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Register Your Business
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Fill out the form below and we'll review your application within 48 hours
          </p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name <span className="text-orange-600">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-orange-600">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number <span className="text-orange-600">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Business Information
              </h3>
              <div className="space-y-4">
                {/* Business Name */}
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Name <span className="text-orange-600">*</span>
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="My Business Inc."
                  />
                </div>

                {/* Instagram Handle */}
                <div>
                  <label htmlFor="instagramHandle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Instagram Handle <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                      @
                    </span>
                    <input
                      id="instagramHandle"
                      name="instagramHandle"
                      type="text"
                      required
                      value={instagramHandle}
                      onChange={(e) => {
                        // Remove @ if user types it
                        const value = e.target.value.replace(/^@+/, '');
                        setInstagramHandle(value);
                      }}
                      className="appearance-none rounded-lg relative block w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="yourbusiness"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label htmlFor="cityId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City <span className="text-orange-600">*</span>
                  </label>
                  <select
                    id="cityId"
                    name="cityId"
                    required
                    value={cityId}
                    onChange={(e) => setCityId(Number(e.target.value))}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a city</option>
                    {cities?.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category <span className="text-orange-600">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subcategory <span className="text-orange-600">*</span>
                  </label>
                  <select
                    id="subcategoryId"
                    name="subcategoryId"
                    required
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(Number(e.target.value))}
                    disabled={!categoryId}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a subcategory</option>
                    {filteredSubcategories?.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                  {!categoryId && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Please select a category first
                    </p>
                  )}
                </div>

                {/* Additional Info */}
                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Information
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    rows={4}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Tell us more about your business (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>

            {/* Back Button */}
            <div>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-dark-border text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:border-orange-500 dark:hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function BusinessSignupPage() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>
      <BusinessSignupPageContent />
      <Footer />
    </>
  );
}
