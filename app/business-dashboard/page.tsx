"use client";

import { Suspense } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOwnedBusinesses, getMyQuoteRequests, getOwnerReviews, createReviewReply, updateReviewReply, deleteReviewReply } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import StarRating from '@/components/StarRating';
import VerifiedBadge from '@/components/VerifiedBadge';
import type { Review } from '@/types';

function BusinessOwnerDashboardContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showBusiness, setShowBusiness] = useState(true);
  const [showQuotes, setShowQuotes] = useState(true);
  const [showReviews, setShowReviews] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingReply, setEditingReply] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['ownedBusinesses'],
    queryFn: getOwnedBusinesses,
  });

  const { data: quoteRequests } = useQuery({
    queryKey: ['myQuoteRequests'],
    queryFn: getMyQuoteRequests,
  });

  const { data: reviews } = useQuery({
    queryKey: ['ownerReviews'],
    queryFn: getOwnerReviews,
  });

  // Reply mutations
  const createReplyMutation = useMutation({
    mutationFn: ({ reviewId, replyText }: { reviewId: number; replyText: string }) =>
      createReviewReply(reviewId, replyText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerReviews'] });
      setReplyingTo(null);
      setReplyText('');
    },
  });

  const updateReplyMutation = useMutation({
    mutationFn: ({ replyId, replyText }: { replyId: number; replyText: string }) =>
      updateReviewReply(replyId, replyText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerReviews'] });
      setEditingReply(null);
      setReplyText('');
    },
  });

  const deleteReplyMutation = useMutation({
    mutationFn: (replyId: number) => deleteReviewReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerReviews'] });
    },
  });

  // Reply handlers
  const handleStartReply = (reviewId: number) => {
    setReplyingTo(reviewId);
    setEditingReply(null);
    setReplyText('');
  };

  const handleStartEditReply = (replyId: number, currentText: string) => {
    setEditingReply(replyId);
    setReplyingTo(null);
    setReplyText(currentText);
  };

  const handleSubmitReply = (reviewId: number) => {
    if (!replyText.trim()) return;
    createReplyMutation.mutate({ reviewId, replyText });
  };

  const handleUpdateReply = (replyId: number) => {
    if (!replyText.trim()) return;
    updateReplyMutation.mutate({ replyId, replyText });
  };

  const handleDeleteReply = (replyId: number) => {
    if (confirm('Are you sure you want to delete this reply?')) {
      deleteReplyMutation.mutate(replyId);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setEditingReply(null);
    setReplyText('');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const hasBusinesses = businesses && businesses.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Business Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.name}
          </p>
        </div>

        {hasBusinesses ? (
          /* Show Businesses */
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">-</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quote Requests</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{quoteRequests?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reviews</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{reviews?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Section - Collapsible */}
            <div>
              <button
                onClick={() => setShowBusiness(!showBusiness)}
                className="w-full bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6 hover:border-orange-500 dark:hover:border-orange-500 transition-all cursor-pointer text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Your Business
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage your business profile and details
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform ${showBusiness ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {showBusiness && (
                <div className="mt-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                  <div className="space-y-4">
                {businesses.map((business: any) => (
                  <div
                    key={business.id}
                    className="border border-gray-200 dark:border-dark-border rounded-lg p-6 hover:border-orange-500 dark:hover:border-orange-500 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {business.name}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {business.city?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {business.category?.name}
                          </span>
                          {business.status && (
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                business.status === 'active'
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                  : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                              }`}
                            >
                              {business.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {business.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {business.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/edit-business"
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Edit Business
                      </Link>
                      <Link
                        href={`/business/${business.id}`}
                        className="px-4 py-2 border border-gray-300 dark:border-dark-border hover:border-orange-500 dark:hover:border-orange-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                      >
                        View Listing
                      </Link>
                      {business.instagramUrl && (
                        <a
                          href={business.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-gray-300 dark:border-dark-border hover:border-orange-500 dark:hover:border-orange-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                        >
                          Instagram
                        </a>
                      )}
                      {business.website && (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-gray-300 dark:border-dark-border hover:border-orange-500 dark:hover:border-orange-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quote Requests Section - Collapsible */}
            {quoteRequests && quoteRequests.length > 0 && (
              <div>
                <button
                  onClick={() => setShowQuotes(!showQuotes)}
                  className="w-full bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6 hover:border-orange-500 dark:hover:border-orange-500 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Quote Requests
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {quoteRequests.length} {quoteRequests.length === 1 ? 'request' : 'requests'} from customers
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform ${showQuotes ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {showQuotes && (
                  <div className="mt-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                    <div className="space-y-4">
                  {quoteRequests.map((quote: any) => (
                    <div
                      key={quote.id}
                      className="border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:border-orange-500 dark:hover:border-orange-500 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {quote.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            For: <span className="font-medium text-gray-900 dark:text-white">{quote.business.name}</span>
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            quote.status === 'pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                              : quote.status === 'viewed'
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                              : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                          }`}
                        >
                          {quote.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Email:</span>
                          <a href={`mailto:${quote.email}`} className="ml-2 text-orange-600 dark:text-orange-400 hover:underline">
                            {quote.email}
                          </a>
                        </div>
                        {quote.phone && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                            <a href={`tel:${quote.phone}`} className="ml-2 text-orange-600 dark:text-orange-400 hover:underline">
                              {quote.phone}
                            </a>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Category:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {quote.category.name}
                            {quote.subcategory && ` • ${quote.subcategory.name}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Requested:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {quote.message && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-dark-border">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">Message:</p>
                          <p className="text-sm text-gray-900 dark:text-white">{quote.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Section - Collapsible */}
            {reviews && reviews.length > 0 && (
              <div>
                <button
                  onClick={() => setShowReviews(!showReviews)}
                  className="w-full bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6 hover:border-orange-500 dark:hover:border-orange-500 transition-all cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Reviews
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} from customers
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform ${showReviews ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {showReviews && (
                  <div className="mt-4 bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                    <div className="space-y-6">
                      {reviews.map((review: Review) => (
                        <div
                          key={review.id}
                          className="border border-gray-200 dark:border-dark-border rounded-lg p-6 hover:border-orange-500 dark:hover:border-orange-500 transition-all"
                        >
                          {/* Review Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {review.user?.name || 'Anonymous'}
                                </h3>
                                {/* Verified Badge */}
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/20 rounded-full">
                                  <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Verified</span>
                                </div>
                                {/* Hidden Badge (if hidden) */}
                                {review.status === 'hidden' && (
                                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900/20 text-xs font-medium text-gray-600 dark:text-gray-400 rounded-full">
                                    Hidden by Admin
                                  </span>
                                )}
                              </div>
                              <StarRating rating={review.rating} size="sm" readonly />
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Review Text */}
                          {review.reviewText && (
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                              {review.reviewText}
                            </p>
                          )}

                          {/* Review Media */}
                          {review.mediaUrl && (
                            <div className="mb-4">
                              {review.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img
                                  src={review.mediaUrl}
                                  alt="Review media"
                                  className="w-full sm:max-w-md h-64 object-cover rounded-lg border border-gray-200 dark:border-dark-border"
                                />
                              ) : (
                                <video
                                  src={review.mediaUrl}
                                  controls
                                  className="w-full sm:max-w-md h-64 rounded-lg border border-gray-200 dark:border-dark-border"
                                />
                              )}
                            </div>
                          )}

                          {/* Existing Replies */}
                          {review.replies && review.replies.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
                              {review.replies.map((reply) => (
                                <div key={reply.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {reply.review?.business?.name || 'Your Business'}
                                      </span>
                                      <VerifiedBadge size="sm" />
                                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-xs font-medium text-orange-600 dark:text-orange-400 rounded-full">
                                        Business Owner
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>

                                  {editingReply === reply.id ? (
                                    <div className="space-y-3">
                                      <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        rows={3}
                                        placeholder="Edit your reply..."
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleUpdateReply(reply.id)}
                                          disabled={!replyText.trim() || updateReplyMutation.isPending}
                                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                          {updateReplyMutation.isPending ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                          onClick={handleCancelReply}
                                          className="px-4 py-2 border border-gray-300 dark:border-dark-border hover:border-orange-500 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                        {reply.replyText}
                                      </p>
                                      {reply.userId === user?.id && (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleStartEditReply(reply.id, reply.replyText)}
                                            className="text-sm text-orange-600 dark:text-orange-400 hover:underline"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleDeleteReply(reply.id)}
                                            className="text-sm text-red-600 dark:text-red-400 hover:underline"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply Form */}
                          {replyingTo === review.id ? (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border space-y-3">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                rows={3}
                                placeholder="Write your reply..."
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSubmitReply(review.id)}
                                  disabled={!replyText.trim() || createReplyMutation.isPending}
                                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                  {createReplyMutation.isPending ? 'Posting...' : 'Post Reply'}
                                </button>
                                <button
                                  onClick={handleCancelReply}
                                  className="px-4 py-2 border border-gray-300 dark:border-dark-border hover:border-orange-500 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            !review.replies || review.replies.length === 0 ? (
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
                                <button
                                  onClick={() => handleStartReply(review.id)}
                                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                  Reply to Review
                                </button>
                              </div>
                            ) : (
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  You've already replied to this review. Delete your reply to post a new one.
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Show "No Business Linked Yet" */
          <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-8 sm:p-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Business Linked Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                You're signed in as a business owner, but you don't have a business linked to your account yet.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                To start using your dashboard, you need to either:
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {/* Option 1: Claim Existing Business */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-dark-border">
                <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-3">
                  Option 1: Claim an Existing Business
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  If your business is already listed on BuzzGram, claim it to get access to your dashboard and start managing reviews and quote requests.
                </p>
                <Link
                  href="/claim-business"
                  className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  Search for Your Business
                </Link>
              </div>

              {/* Option 2: Register Business */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-dark-border">
                <h3 className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-3">
                  Option 2: Register Your Business
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  If your business isn't listed on BuzzGram yet, register it now and our team will review it.
                </p>
                <Link
                  href="/business-signup"
                  className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                  Register Business
                </Link>
              </div>
            </div>

            <div className="text-center pt-6 border-t border-gray-200 dark:border-dark-border">
              <Link
                href="/"
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BusinessOwnerDashboard() {
  return (
    <>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>
      <ProtectedRoute requireBusinessOwner>
        <BusinessOwnerDashboardContent />
      </ProtectedRoute>
      <Footer />
    </>
  );
}
