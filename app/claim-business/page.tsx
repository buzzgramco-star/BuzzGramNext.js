"use client";

import { Suspense } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getBusinesses, submitBusinessClaim } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Business } from '@/types';

function ClaimBusinessPageContent() {
  
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Search businesses
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['businesses', searchQuery],
    queryFn: () => getBusinesses({ search: searchQuery }),
    enabled: searchQuery.length > 2,
  });

  // Submit claim mutation
  const claimMutation = useMutation({
    mutationFn: submitBusinessClaim,
    onSuccess: () => {
      setSuccess(true);
      setSelectedBusiness(null);
      setPhone('');
      setSearchQuery('');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to submit claim. Please try again.');
    },
  });

  const handleSelectBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setSearchQuery('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBusiness) {
      setError('Please select a business first');
      return;
    }

    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    claimMutation.mutate({
      businessId: selectedBusiness.id,
      name: user?.name || '',
      email: user?.email || '',
      phone: phone.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-orange-600 dark:text-orange-400 hover:underline mb-4 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Claim a Business
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search for your business and submit a claim request. Our team will review and get back to you.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-1">
                  Claim Submitted Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Our team will review your claim and get back to you within 48 hours.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 text-orange-600 dark:text-orange-400 hover:underline font-medium"
            >
              Submit another claim
            </button>
          </div>
        )}

        {/* Main Content */}
        {!success && (
          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-sm">
            <div className="p-6">
              {/* Search Bar */}
              <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search for your business
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter business name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Search Results */}
              {searchQuery.length > 2 && (
                <div className="mb-6">
                  {isSearching ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">Searching...</p>
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Found {searchResults.length} business{searchResults.length !== 1 ? 'es' : ''}
                      </p>
                      {searchResults.map((business) => (
                        <button
                          key={business.id}
                          onClick={() => handleSelectBusiness(business)}
                          className="w-full text-left p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {business.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {business.city?.name} • {business.category?.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-gray-200 dark:border-dark-border rounded-lg">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-gray-600 dark:text-gray-400">
                        No businesses found matching "{searchQuery}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Selected Business & Claim Form */}
              {selectedBusiness && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
                  {/* Selected Business Card */}
                  <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {selectedBusiness.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {selectedBusiness.city?.name} • {selectedBusiness.category?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedBusiness(null)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Claim Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={user?.name || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        We may call this number to verify your claim
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={claimMutation.isPending}
                      className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {claimMutation.isPending ? 'Submitting...' : 'Submit Claim'}
                    </button>
                  </form>
                </div>
              )}

              {/* Empty State */}
              {!selectedBusiness && searchQuery.length <= 2 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Search for your business
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Type at least 3 characters to start searching
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClaimBusinessPage() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>
      <ProtectedRoute requireBusinessOwner>
        <ClaimBusinessPageContent />
      </ProtectedRoute>
      <Footer />
    </>
  );
}
