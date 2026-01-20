"use client";

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getCategories, getSubcategories, api } from '@/lib/api';

interface GeneralQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AvailabilitySlot {
  date: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
}

export default function GeneralQuoteModal({ isOpen, onClose }: GeneralQuoteModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([]);
  const [budget, setBudget] = useState('');
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([
    { date: '', timeSlot: 'morning' }
  ]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch categories and subcategories
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

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if user is authenticated
    if (!user) {
      setError('Please sign up or login to submit a quote request.');
      return;
    }

    // Validate at least one category selected
    if (selectedCategoryIds.length === 0) {
      setError('Please select at least one category');
      return;
    }

    // Validate at least one availability slot
    const validSlots = availability.filter(slot => slot.date !== '');
    if (validSlots.length === 0) {
      setError('Please select at least one available date');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      await api.post(
        '/general-quotes',
        {
          name,
          email,
          phone: phone || undefined,
          categoryIds: selectedCategoryIds,
          subcategoryIds: selectedSubcategoryIds.length > 0 ? selectedSubcategoryIds : undefined,
          budget: budget || undefined,
          availability: JSON.stringify(validSlots),
          message: message || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);

      // Invalidate queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['myQuotes'] });

      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quote request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone('');
    setSelectedCategoryIds([]);
    setSelectedSubcategoryIds([]);
    setBudget('');
    setAvailability([{ date: '', timeSlot: 'morning' }]);
    setMessage('');
    setError('');
    setSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div
        className="relative bg-white dark:bg-dark-card rounded-lg shadow-xl max-h-[90vh] overflow-y-auto max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Get a Quote from BuzzGram
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <svg className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  Thank you!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Your quote request has been submitted. Our team will review it and connect you with the best businesses within 24-48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {error}
                      {!user && (
                        <span className="block mt-2">
                          <Link href="/login" className="text-red-600 dark:text-red-400 hover:underline font-medium" onClick={onClose}>
                            Login
                          </Link>
                          {' or '}
                          <Link href="/register" className="text-red-600 dark:text-red-400 hover:underline font-medium" onClick={onClose}>
                            Sign Up
                          </Link>
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tell us about your needs and we'll connect you with the best businesses that match your requirements and budget.
                </p>

                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Category & Subcategory Checkboxes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Categories <span className="text-red-500">*</span>
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                      ({selectedCategoryIds.length}/5 selected)
                    </span>
                  </label>

                  <div className="border border-gray-300 dark:border-dark-border rounded-lg p-4 max-h-96 overflow-y-auto bg-white dark:bg-dark-bg">
                    {categories?.map((category) => {
                      const isSelected = selectedCategoryIds.includes(category.id);
                      const isDisabled = !isSelected && selectedCategoryIds.length >= 5;
                      const categorySubcategories = getSubcategoriesForCategory(category.id);

                      return (
                        <div key={category.id} className="mb-3">
                          {/* Category checkbox */}
                          <label className={`flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => toggleCategory(category.id)}
                              className="w-4 h-4 text-orange-600 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
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
                                <label key={subcategory.id} className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedSubcategoryIds.includes(subcategory.id)}
                                    onChange={() => toggleSubcategory(subcategory.id)}
                                    className="w-4 h-4 text-orange-600 border-gray-300 dark:border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
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

                  {selectedCategoryIds.length === 0 && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Select at least one category to get started
                    </p>
                  )}

                  {selectedCategoryIds.length >= 5 && (
                    <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                      Maximum of 5 categories reached
                    </p>
                  )}
                </div>

                {/* Budget Field */}
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget
                  </label>
                  <input
                    id="budget"
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., $500-$1000"
                  />
                </div>

                {/* Availability Date Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    When are you available? (up to 3 dates) <span className="text-red-500">*</span>
                  </label>

                  {availability.map((slot, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="date"
                        value={slot.date}
                        onChange={(e) => {
                          const newAvailability = [...availability];
                          newAvailability[index].date = e.target.value;
                          setAvailability(newAvailability);
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="flex-1 appearance-none rounded-lg px-3 py-2 border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <select
                        value={slot.timeSlot}
                        onChange={(e) => {
                          const newAvailability = [...availability];
                          newAvailability[index].timeSlot = e.target.value as 'morning' | 'afternoon' | 'evening';
                          setAvailability(newAvailability);
                        }}
                        className="appearance-none rounded-lg px-3 py-2 border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                      </select>
                      {availability.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvailability(availability.filter((_, i) => i !== index));
                          }}
                          className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}

                  {availability.length < 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvailability([
                          ...availability,
                          { date: '', timeSlot: 'morning' as const },
                        ]);
                      }}
                      className="text-orange-600 dark:text-orange-400 hover:underline text-sm"
                    >
                      + Add another date
                    </button>
                  )}
                </div>

                {/* Additional Information */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Additional Information
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Any additional details or requirements..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Submitting...' : 'Submit Quote Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
      </div>
    </div>
  );
}
