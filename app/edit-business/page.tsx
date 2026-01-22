"use client";

import { Suspense } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOwnerBusiness,
  updateBusinessProfile,
  addBusinessService,
  updateBusinessService,
  deleteBusinessService,
} from '@/lib/api';
import type { Business, BusinessService } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

function EditBusinessPageContent() {
  const queryClient = useQueryClient();

  // Fetch business data
  const { data: business, isLoading } = useQuery<Business>({
    queryKey: ['ownerBusiness'],
    queryFn: getOwnerBusiness,
  });

  // Form states
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');

  // Service form states
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [editingService, setEditingService] = useState<BusinessService | null>(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editServicePrice, setEditServicePrice] = useState('');

  // UI states
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [serviceSuccess, setServiceSuccess] = useState('');
  const [serviceError, setServiceError] = useState('');

  // Initialize form values when business data loads
  useEffect(() => {
    if (business) {
      setDescription(business.description || '');
      setAddress(business.address || '');
      setInstagramHandle(business.instagramHandle || '');
    }
  }, [business]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateBusinessProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
      setProfileSuccess('Profile updated successfully!');
      setProfileError('');
      setTimeout(() => setProfileSuccess(''), 3000);
    },
    onError: (error: any) => {
      setProfileError(error.response?.data?.message || 'Failed to update profile');
      setProfileSuccess('');
    },
  });

  // Add service mutation
  const addServiceMutation = useMutation({
    mutationFn: addBusinessService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
      setNewServiceName('');
      setNewServicePrice('');
      setServiceSuccess('Service added successfully!');
      setServiceError('');
      setTimeout(() => setServiceSuccess(''), 3000);
    },
    onError: (error: any) => {
      setServiceError(error.response?.data?.message || 'Failed to add service');
      setServiceSuccess('');
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { serviceName?: string; price?: string } }) =>
      updateBusinessService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
      setEditingService(null);
      setServiceSuccess('Service updated successfully!');
      setServiceError('');
      setTimeout(() => setServiceSuccess(''), 3000);
    },
    onError: (error: any) => {
      setServiceError(error.response?.data?.message || 'Failed to update service');
      setServiceSuccess('');
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: deleteBusinessService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerBusiness'] });
      setServiceSuccess('Service deleted successfully!');
      setServiceError('');
      setTimeout(() => setServiceSuccess(''), 3000);
    },
    onError: (error: any) => {
      setServiceError(error.response?.data?.message || 'Failed to delete service');
      setServiceSuccess('');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      description,
      address,
      instagramHandle,
    });
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      setServiceError('Service name is required');
      return;
    }
    addServiceMutation.mutate({
      serviceName: newServiceName.trim(),
      price: newServicePrice.trim() || undefined,
    });
  };

  const handleEditService = (service: BusinessService) => {
    setEditingService(service);
    setEditServiceName(service.serviceName);
    setEditServicePrice(service.price || '');
  };

  const handleUpdateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    if (!editServiceName.trim()) {
      setServiceError('Service name is required');
      return;
    }
    updateServiceMutation.mutate({
      id: editingService.id,
      data: {
        serviceName: editServiceName.trim(),
        price: editServicePrice.trim() || undefined,
      },
    });
  };

  const handleDeleteService = (serviceId: number) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No business found</p>
          <Link href="/business-dashboard" className="text-orange-600 hover:text-orange-700">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/business-dashboard"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Business Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your business information and services
          </p>
        </div>

        {/* Business Profile Form */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Business Information
          </h2>

          {profileSuccess && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">{profileSuccess}</p>
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{profileError}</p>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Business Name (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={business.name}
                disabled
                className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Contact support to change your business name
              </p>
            </div>

            {/* City (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={business.city?.name || 'N/A'}
                disabled
                className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Category (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={`${business.category?.name || 'N/A'}${business.subcategory ? ` - ${business.subcategory.name}` : ''}`}
                disabled
                className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* About / Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                About Your Business
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Tell customers about your business, what makes you special, your experience, etc."
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Address <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="123 Main St, Suite 100"
              />
            </div>

            {/* Instagram Handle */}
            <div>
              <label htmlFor="instagramHandle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instagram Handle
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                  @
                </span>
                <input
                  id="instagramHandle"
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => {
                    // Strip @ if user types it
                    const value = e.target.value.replace(/^@+/, '');
                    setInstagramHandle(value);
                  }}
                  className="appearance-none rounded-lg block w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="yourbusiness"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Services Section */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Services & Pricing
          </h2>

          {serviceSuccess && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">{serviceSuccess}</p>
            </div>
          )}

          {serviceError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{serviceError}</p>
            </div>
          )}

          {/* Existing Services List */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Services</h3>
            {business.services && business.services.length > 0 ? (
              <div className="space-y-3">
                {business.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                  >
                    {editingService?.id === service.id ? (
                      /* Edit Mode */
                      <form onSubmit={handleUpdateService} className="flex-1 flex items-center gap-3">
                        <input
                          type="text"
                          value={editServiceName}
                          onChange={(e) => setEditServiceName(e.target.value)}
                          className="flex-1 appearance-none rounded-lg px-3 py-2 border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Service name"
                          required
                        />
                        <input
                          type="text"
                          value={editServicePrice}
                          onChange={(e) => setEditServicePrice(e.target.value)}
                          className="w-32 appearance-none rounded-lg px-3 py-2 border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Price"
                        />
                        <button
                          type="submit"
                          disabled={updateServiceMutation.isPending}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingService(null)}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      /* View Mode */
                      <>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{service.serviceName}</p>
                          {service.price && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{service.price}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditService(service)}
                            className="px-3 py-1 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            disabled={deleteServiceMutation.isPending}
                            className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No services added yet. Add your first service below!
              </p>
            )}
          </div>

          {/* Add New Service Form */}
          <div className="border-t border-gray-200 dark:border-dark-border pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Service</h3>
            <form onSubmit={handleAddService} className="flex gap-3">
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="flex-1 appearance-none rounded-lg px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Service name (e.g., Gel Manicure, Wedding Cake)"
                required
              />
              <input
                type="text"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                className="w-40 appearance-none rounded-lg px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Price (optional)"
              />
              <button
                type="submit"
                disabled={addServiceMutation.isPending}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addServiceMutation.isPending ? 'Adding...' : 'Add Service'}
              </button>
            </form>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Price examples: "$50", "Starting at $100", "Call for quote"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditBusinessPage() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>
      <ProtectedRoute requireBusinessOwner>
        <EditBusinessPageContent />
      </ProtectedRoute>
      <Footer />
    </>
  );
}
