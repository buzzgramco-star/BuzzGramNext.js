"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getCities, getCategories, getSubcategories } from '@/lib/api';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function QuoteLandingContent() {
  const { user } = useAuth();

  // Form state
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([]);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch data
  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories'],
    queryFn: getSubcategories,
  });

  // Helper functions for category/subcategory selection
  const toggleCategory = (categoryId: number) => {
    if (selectedCategoryIds.includes(categoryId)) {
      // Remove category and its subcategories
      setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId));
      setSelectedSubcategoryIds(prev =>
        prev.filter(subId => {
          const subcategory = subcategories?.find(s => s.id === subId);
          return subcategory?.categoryId !== categoryId;
        })
      );
    } else {
      // Add category (max 5)
      if (selectedCategoryIds.length < 5) {
        setSelectedCategoryIds(prev => [...prev, categoryId]);
      }
    }
  };

  const toggleSubcategory = (subcategoryId: number) => {
    if (selectedSubcategoryIds.includes(subcategoryId)) {
      setSelectedSubcategoryIds(prev => prev.filter(id => id !== subcategoryId));
    } else {
      setSelectedSubcategoryIds(prev => [...prev, subcategoryId]);
    }
  };

  const getSubcategoriesForCategory = (categoryId: number) => {
    return subcategories?.filter(sub => sub.categoryId === categoryId) || [];
  };

  const removeCategory = (categoryId: number) => {
    toggleCategory(categoryId);
  };

  const removeSubcategory = (subcategoryId: number) => {
    toggleSubcategory(subcategoryId);
  };

  const getSelectedCategoryNames = () => {
    return categories?.filter(cat => selectedCategoryIds.includes(cat.id)) || [];
  };

  const getSelectedSubcategoryNames = () => {
    return subcategories?.filter(sub => selectedSubcategoryIds.includes(sub.id)) || [];
  };

  // Submit quote mutation
  const submitQuoteMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      const token = Cookies.get('token');
      const { data } = await api.post('/general-quotes', quoteData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      setFormSuccess(true);
      setFormError('');
      // Reset form
      setSelectedCityId(null);
      setSelectedCategoryIds([]);
      setSelectedSubcategoryIds([]);
      setServiceDescription('');
      setBudget('');
      setPhone('');
      if (!user) {
        setName('');
        setEmail('');
      }
      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (error: any) => {
      setFormError(error.response?.data?.message || 'Failed to submit quote request. Please try again.');
      setFormSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!user) {
      setFormError('Please sign up or login to submit a quote request.');
      return;
    }

    if (selectedCategoryIds.length === 0) {
      setFormError('Please select at least one category');
      return;
    }

    if (!phone) {
      setFormError('Please provide a phone number');
      return;
    }

    // Create availability slot for next day morning (placeholder)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const availabilitySlot = [{
      date: tomorrow.toISOString().split('T')[0],
      timeSlot: 'morning'
    }];

    submitQuoteMutation.mutate({
      categoryIds: selectedCategoryIds,
      subcategoryIds: selectedSubcategoryIds.length > 0 ? selectedSubcategoryIds : undefined,
      name,
      email,
      phone,
      budget: budget || undefined,
      availability: JSON.stringify(availabilitySlot),
      message: serviceDescription || undefined,
    });
  };

  const scrollToForm = () => {
    const formElement = document.getElementById('quote-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryCardClick = (categoryName: string) => {
    const category = categories?.find(c => c.name === categoryName);
    if (category) {
      // Add category if not already selected and under limit
      if (!selectedCategoryIds.includes(category.id) && selectedCategoryIds.length < 5) {
        setSelectedCategoryIds(prev => [...prev, category.id]);
      }
      // Always scroll to form when clicking category card
      scrollToForm();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Section 1: Hero */}
      <div className="bg-gradient-to-b from-orange-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Find Multiple Service Providers <br className="hidden sm:block" />
              <span className="text-[#ff6b35]">in One Quote</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Beauty, Food & Events specialists in your city. Compare quotes and find the perfect fit.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Category Showcase */}
      <div className="bg-white dark:bg-slate-900 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Beauty Card */}
            <button
              onClick={() => handleCategoryCardClick('Beauty')}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 hover:shadow-2xl hover:shadow-[#ff6b35]/20 hover:-translate-y-2 transition-all duration-300 text-left group"
            >
              <div className="text-6xl mb-4">💄</div>
              <h3 className="text-2xl font-bold text-[#ff6b35] mb-4">Beauty</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                Nails • Lashes • Makeup • Hair
              </p>
              <div className="flex items-center text-gray-900 dark:text-white group-hover:text-[#ff6b35] transition-colors">
                <span className="font-medium">Get Beauty Quotes</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>

            {/* Food Card */}
            <button
              onClick={() => handleCategoryCardClick('Food')}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 hover:shadow-2xl hover:shadow-[#ff6b35]/20 hover:-translate-y-2 transition-all duration-300 text-left group"
            >
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold text-[#ff6b35] mb-4">Food</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                Bakery • Catering • Chef
              </p>
              <div className="flex items-center text-gray-900 dark:text-white group-hover:text-[#ff6b35] transition-colors">
                <span className="font-medium">Get Food Quotes</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>

            {/* Events Card */}
            <button
              onClick={() => handleCategoryCardClick('Events')}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 hover:shadow-2xl hover:shadow-[#ff6b35]/20 hover:-translate-y-2 transition-all duration-300 text-left group"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-[#ff6b35] mb-4">Events</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
                Decor • Planning • Photography
              </p>
              <div className="flex items-center text-gray-900 dark:text-white group-hover:text-[#ff6b35] transition-colors">
                <span className="font-medium">Get Events Quotes</span>
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Why BuzzGram */}
      <div className="bg-gray-100 dark:bg-slate-950 py-16 sm:py-20 border-y border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Why <span className="text-[#ff6b35]">BuzzGram</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">One Form, Multiple Quotes</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fill out one simple form and get responses from multiple service providers in your area.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Compare & Choose</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Review quotes, check provider profiles, and choose the best fit for your needs and budget.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Fast Responses</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Most providers respond within 24 hours. Get your project started quickly and efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: How It Works */}
      <div className="bg-white dark:bg-slate-900 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
            How It <span className="text-[#ff6b35]">Works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Select Your Service</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Choose the category and type of service you need from our wide range of options.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Describe Your Needs</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Tell us what you're looking for, your timeline, and any specific requirements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-[#ff6b35] rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Get Quotes</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Receive quotes from qualified providers and choose the one that's right for you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Quote Form */}
      <div id="quote-form" className="bg-gray-50 dark:bg-slate-950 py-16 sm:py-20 border-y border-gray-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Request Your <span className="text-[#ff6b35]">Quote</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-10">
            Fill out the form below and we'll connect you with the best service providers in your area.
          </p>

          {formSuccess ? (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-8 text-center">
              <svg className="w-16 h-16 text-green-600 dark:text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                Your quote request has been submitted. Providers will contact you shortly.
              </p>
              <button
                onClick={() => setFormSuccess(false)}
                className="mt-6 text-[#ff6b35] hover:underline font-medium"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {!user && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    Please{' '}
                    <Link href="/login" className="text-[#ff6b35] hover:underline font-medium">
                      login
                    </Link>
                    {' or '}
                    <Link href="/register" className="text-[#ff6b35] hover:underline font-medium">
                      sign up
                    </Link>
                    {' to submit a quote request.'}
                  </p>
                </div>
              )}

              {formError && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200">{formError}</p>
                </div>
              )}

              {/* City Selector */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Your City <span className="text-[#ff6b35]">*</span>
                </label>
                <select
                  id="city"
                  required
                  value={selectedCityId || ''}
                  onChange={(e) => setSelectedCityId(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                >
                  <option value="">Choose a city</option>
                  {cities?.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Categories & Subcategories - Multi-Select Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Categories <span className="text-[#ff6b35]">*</span>
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({selectedCategoryIds.length}/5 selected)
                  </span>
                </label>

                {/* Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-left focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent flex items-center justify-between"
                >
                  <span className={selectedCategoryIds.length === 0 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}>
                    {selectedCategoryIds.length === 0 ? 'Select categories...' : `${selectedCategoryIds.length} ${selectedCategoryIds.length === 1 ? 'category' : 'categories'} selected`}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Selected Items as Tags */}
                {(selectedCategoryIds.length > 0 || selectedSubcategoryIds.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {/* Category Tags */}
                    {getSelectedCategoryNames().map((category) => (
                      <span
                        key={`cat-${category.id}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#ff6b35] text-white"
                      >
                        {category.name}
                        <button
                          type="button"
                          onClick={() => removeCategory(category.id)}
                          className="ml-2 hover:bg-[#ff5722] rounded-full p-0.5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                    {/* Subcategory Tags */}
                    {getSelectedSubcategoryNames().map((subcategory) => (
                      <span
                        key={`sub-${subcategory.id}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-600 text-white"
                      >
                        {subcategory.name}
                        <button
                          type="button"
                          onClick={() => removeSubcategory(subcategory.id)}
                          className="ml-2 hover:bg-slate-500 rounded-full p-0.5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Dropdown Panel */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 shadow-xl max-h-96 overflow-y-auto">
                    <div className="p-4">
                      {categories?.map((category) => {
                        const isSelected = selectedCategoryIds.includes(category.id);
                        const isDisabled = !isSelected && selectedCategoryIds.length >= 5;
                        const categorySubcategories = getSubcategoriesForCategory(category.id);

                        return (
                          <div key={category.id} className="mb-3">
                            {/* Category checkbox */}
                            <label className={`flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => toggleCategory(category.id)}
                                className="w-4 h-4 text-[#ff6b35] bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#ff6b35] focus:ring-2"
                                style={{
                                  accentColor: '#ff6b35'
                                }}
                              />
                              <span className="ml-3 text-gray-900 dark:text-white font-medium">
                                {category.name}
                              </span>
                            </label>

                            {/* Subcategories indented below */}
                            {isSelected && categorySubcategories.length > 0 && (
                              <div className="ml-8 mt-2 space-y-1">
                                {categorySubcategories.map((subcategory) => (
                                  <label key={subcategory.id} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={selectedSubcategoryIds.includes(subcategory.id)}
                                      onChange={() => toggleSubcategory(subcategory.id)}
                                      className="w-4 h-4 text-[#ff6b35] bg-white dark:bg-slate-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#ff6b35] focus:ring-2"
                                      style={{
                                        accentColor: '#ff6b35'
                                      }}
                                    />
                                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                      {subcategory.name}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer info */}
                    <div className="border-t border-gray-200 dark:border-slate-600 p-3 bg-gray-50 dark:bg-slate-900/50">
                      {selectedCategoryIds.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Select at least one category to get started
                        </p>
                      ) : selectedCategoryIds.length >= 5 ? (
                        <p className="text-sm text-[#ff6b35]">
                          Maximum of 5 categories reached
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          You can select up to {5 - selectedCategoryIds.length} more {5 - selectedCategoryIds.length === 1 ? 'category' : 'categories'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-[#ff6b35]">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-[#ff6b35]">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone <span className="text-[#ff6b35]">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Service Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tell Us What You Need <span className="text-[#ff6b35]">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent resize-none"
                  placeholder="Describe your project, timeline, and any specific requirements..."
                />
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget (Optional)
                </label>
                <input
                  id="budget"
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                  placeholder="e.g., $500-$1000"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitQuoteMutation.isPending || !user}
                className="w-full py-4 bg-[#ff6b35] hover:bg-[#ff5722] text-white font-bold text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitQuoteMutation.isPending ? 'Submitting...' : !user ? 'Login Required' : 'Request Quotes'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Section 6: Social Proof */}
      <div className="bg-white dark:bg-slate-950 py-16 sm:py-20 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
            {/* Stat 1 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-[#ff6b35] mb-2">1,000+</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Businesses</p>
            </div>

            {/* Stat 2 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-[#ff6b35] mb-2">10+</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Cities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 7: Business Owner CTA */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Are You a <span className="text-[#ff6b35]">Service Provider</span>?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Join BuzzGram and connect with customers looking for your services. Create your free business profile today.
          </p>
          <Link
            href="/business-signup"
            className="inline-block px-8 py-4 bg-[#ff6b35] hover:bg-[#ff5722] text-white font-bold text-lg rounded-lg transition-colors"
          >
            List Your Business (Free)
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function QuoteLandingPage() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>
      <QuoteLandingContent />
      <Footer />
    </>
  );
}
