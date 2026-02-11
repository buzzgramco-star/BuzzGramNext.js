"use client";

import { useState, useEffect } from 'react';
import { createAdminBusiness, updateAdminBusiness, getCities, getCategories, getSubcategories } from '@/lib/api';
import type { Business, City, Category, Subcategory } from '@/types';

interface BusinessFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  business?: Business | null; // If provided, edit mode. Otherwise, create mode
}

export default function BusinessFormModal({ isOpen, onClose, onSuccess, business }: BusinessFormModalProps) {
  const [name, setName] = useState('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [subcategoryId, setSubcategoryId] = useState<number | ''>('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Data for dropdowns
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);

  // Load cities, categories, and subcategories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [citiesData, categoriesData, subcategoriesData] = await Promise.all([
          getCities(),
          getCategories(),
          getSubcategories(),
        ]);
        setCities(citiesData);
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (business) {
      setName(business.name);
      setCityId(business.cityId);
      setCategoryId(business.categoryId);
      setSubcategoryId(business.subcategoryId || '');
      // Strip @ prefix from Instagram handle for editing
      setInstagramHandle(business.instagramHandle?.replace(/^@/, '') || '');
      setDescription(business.description || '');
      setAddress(business.address || '');
    } else {
      // Reset form for create mode
      setName('');
      setCityId('');
      setCategoryId('');
      setSubcategoryId('');
      setInstagramHandle('');
      setDescription('');
      setAddress('');
    }
  }, [business, isOpen]);

  // Filter subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      const filtered = subcategories.filter(sub => sub.categoryId === categoryId);
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [categoryId, subcategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const businessData = {
        name,
        cityId: Number(cityId),
        categoryId: Number(categoryId),
        subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
        instagramHandle,
        description: description || undefined,
        address: address || undefined,
      };

      if (business) {
        // Edit mode
        await updateAdminBusiness(business.id, businessData);
      } else {
        // Create mode
        await createAdminBusiness(businessData as any);
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess(); // Refresh the business list
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
        `Failed to ${business ? 'update' : 'create'} business. Please try again.`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCityId('');
    setCategoryId('');
    setSubcategoryId('');
    setInstagramHandle('');
    setDescription('');
    setAddress('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl max-w-2xl w-full p-6 relative my-8">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {business ? 'Edit Business' : 'Add New Business'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {business ? 'Update the business information below.' : 'Fill in the details to add a new business to the directory.'}
        </p>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Business {business ? 'updated' : 'created'} successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Name */}
              <div className="md:col-span-2">
                <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Business Name *
                </label>
                <input
                  id="business-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Bella's Nail Salon"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City *
                </label>
                <select
                  id="city"
                  required
                  value={cityId}
                  onChange={(e) => setCityId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a city</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(Number(e.target.value));
                    setSubcategoryId(''); // Reset subcategory when category changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subcategory (Optional)
                </label>
                <select
                  id="subcategory"
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value ? Number(e.target.value) : '')}
                  disabled={!categoryId || filteredSubcategories.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select a subcategory</option>
                  {filteredSubcategories.map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
                  ))}
                </select>
              </div>

              {/* Instagram Handle */}
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Instagram Handle *
                </label>
                <input
                  id="instagram"
                  type="text"
                  required
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="@businessname"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address (Optional)
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, Toronto, ON"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about this business..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (business ? 'Updating...' : 'Creating...') : (business ? 'Update Business' : 'Create Business')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
