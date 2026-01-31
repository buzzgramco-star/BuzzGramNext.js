"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getBusinessBySlug, getCategories, getSubcategories, submitQuoteRequest, createReview, getBusinessReviews, deleteOwnReview } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import VerifiedBadge from '@/components/VerifiedBadge';
import StarRating from '@/components/StarRating';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { AvailabilitySlot, Review, Business, Category, Subcategory } from '@/types';

type TabType = 'about' | 'services' | 'reviews' | 'quote';

type Props = {
  business: Business;
  categories: Category[];
  subcategories: Subcategory[];
  initialReviews: Review[];
};

export default function BusinessDetailClient({ business: initialBusiness, categories, subcategories, initialReviews }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('about');

  // Use SSR data as initial state
  const business = initialBusiness;
  const reviews = initialReviews;

  // Quote form state
  const [quoteName, setQuoteName] = useState('');
  const [quoteEmail, setQuoteEmail] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteCategoryId, setQuoteCategoryId] = useState('');
  const [quoteSubcategoryId, setQuoteSubcategoryId] = useState('');
  const [quoteAvailability, setQuoteAvailability] = useState<AvailabilitySlot[]>([
    { date: '', timeSlot: 'morning' }
  ]);
  const [quoteMessage, setQuoteMessage] = useState('');
  const [quoteError, setQuoteError] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewMediaUrl, setReviewMediaUrl] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Data is provided by SSR - no need to fetch
  // Reviews can be refetched after mutations

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      setReviewSuccess(true);
      setReviewError('');
      setReviewRating(0);
      setReviewText('');
      setReviewMediaUrl('');
      queryClient.invalidateQueries({ queryKey: ['reviews', business.id] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (error: any) => {
      setReviewError(error.response?.data?.message || 'Failed to submit review');
      setReviewSuccess(false);
    },
  });

  // Delete own review mutation
  const deleteOwnReviewMutation = useMutation({
    mutationFn: deleteOwnReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', business.id] });
      setReviewSuccess(false);
    },
    onError: (error: any) => {
      setReviewError(error.response?.data?.message || 'Failed to delete review');
    },
  });

  const handleDeleteOwnReview = (reviewId: number) => {
    if (window.confirm('Are you sure you want to delete your review? This action cannot be undone.')) {
      deleteOwnReviewMutation.mutate(reviewId);
    }
  };

  // Cloudinary upload widget
  const openUploadWidget = () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // @ts-ignore - Cloudinary widget is loaded via script tag
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ['local', 'camera'],
        multiple: false,
        maxFiles: 1,
        resourceType: 'auto',
        clientAllowedFormats: ['image', 'video'],
        maxFileSize: 10000000, // 10MB
        maxImageWidth: 2000,
        maxImageHeight: 2000,
        maxVideoFileSize: 50000000, // 50MB
        folder: 'reviews',
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          setReviewMediaUrl(result.info.secure_url);
        }
      }
    );

    widget.open();
  };

  // Filter subcategories by selected category
  const filteredSubcategories = subcategories?.filter(
    (sub) => sub.categoryId === parseInt(quoteCategoryId)
  );

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      setQuoteName(user.name || '');
      setQuoteEmail(user.email || '');
    }
  }, [user]);


  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteError('');

    // Validate at least one availability slot
    const validSlots = quoteAvailability.filter(slot => slot.date !== '');
    if (validSlots.length === 0) {
      setQuoteError('Please select at least one available date');
      return;
    }

    setQuoteLoading(true);

    try {
      await submitQuoteRequest({
        businessId: business!.id,
        name: quoteName,
        email: quoteEmail,
        phone: quotePhone || undefined,
        categoryId: parseInt(quoteCategoryId),
        subcategoryId: quoteSubcategoryId ? parseInt(quoteSubcategoryId) : undefined,
        availability: JSON.stringify(validSlots),
        message: quoteMessage || undefined,
      });

      setQuoteSuccess(true);

      // Invalidate queries to refresh dashboard
      queryClient.invalidateQueries({ queryKey: ['myQuotes'] });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setQuoteError(err.response?.data?.message || 'Failed to submit quote request. Please try again.');
    } finally {
      setQuoteLoading(false);
    }
  };

  if (!business) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Business
            </h2>
            <p className="text-red-600 dark:text-red-300">
              Business not found
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: business.description || `Check out ${business.name}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white dark:bg-dark-bg">
        {/* Back Button */}
        <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Section 1: Header with Business Name and Action Buttons */}
        <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Business Name with Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              {/* Business Name */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {business.name}
                {business.claimedAt && business.approvedAt && (
                  <VerifiedBadge size="md" />
                )}
              </h1>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:border-orange-500 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-all whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
            </div>

            {/* Location and Category */}
            <div className="space-y-2">

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {/* Location */}
                {business.city && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                    <svg className="w-4 h-4 mr-1.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{business.city.name}</span>
                  </div>
                )}

                {/* Category Badge */}
                {business.category && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                    <span className="text-sm">{business.category.icon}</span>
                    <span>{business.category.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Tab Navigation */}
        <div className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 overflow-x-auto scrollbar-hide" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'about'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 px-1 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'services'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Reviews ({reviews?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('quote')}
                className={`py-4 px-1 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === 'quote'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Get Quote
              </button>
            </nav>
          </div>
        </div>

        {/* Section 4: Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="max-w-4xl space-y-6">
              {/* Description */}
              {business.description && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    About {business.name}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {business.description}
                  </p>
                </div>
              )}

              {/* Location */}
              {(business.city || business.address) && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Location
                  </h2>
                  <div className="space-y-1">
                    {business.address && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {business.address}
                      </p>
                    )}
                    {business.city && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {business.city.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Category */}
              {business.category && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Category
                  </h2>
                  <div className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                    <span className="text-base">{business.category.icon}</span>
                    <span>{business.category.name}</span>
                    {business.subcategory && (
                      <>
                        <span className="text-gray-400 dark:text-gray-500">•</span>
                        <span className="text-base">{business.subcategory.icon}</span>
                        <span>{business.subcategory.name}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Contact Information
                </h2>
                <div className="space-y-3">
                  {business.instagramHandle && (
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Instagram</p>
                        <a
                          href={business.instagramUrl || `https://instagram.com/${business.instagramHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline"
                        >
                          @{business.instagramHandle}
                        </a>
                      </div>
                    </div>
                  )}

                  {business.website && (
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Website</p>
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline break-all"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}

                  {!business.instagramHandle && !business.website && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      No contact information available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="max-w-4xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Services Offered
              </h2>
              {business.services && business.services.length > 0 ? (
                <div className="space-y-3">
                  {business.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start justify-between p-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-gray-900 dark:text-white font-medium">{service.serviceName}</span>
                          {service.duration && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{service.duration}</p>
                          )}
                        </div>
                      </div>
                      {service.price && (
                        <span className="text-orange-600 dark:text-orange-400 font-semibold whitespace-nowrap ml-4">
                          {service.price}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No services listed yet. Contact the business for more information.
                </p>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="max-w-4xl space-y-8">
              {/* Review Submission Form */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Leave a Review
                </h2>

                {reviewSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="ml-3 text-sm text-green-800 dark:text-green-200">
                        Thank you! Your review has been submitted successfully.
                      </p>
                    </div>
                  </div>
                )}

                {reviewError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-800 dark:text-red-200">{reviewError}</p>
                  </div>
                )}

                <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-6">
                  {user && business.ownerId === user.id ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-dark-border rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You cannot review your own business.
                      </p>
                    </div>
                  ) : user ? (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Posting as <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                      </p>
                      {reviews?.some((r: Review) => r.user?.id === user.id) && !reviewSuccess && (
                        <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                          <p className="text-sm text-orange-800 dark:text-orange-200">
                            You've already reviewed this business. To submit a new review, please delete your existing one first.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <span className="text-orange-600 dark:text-orange-400 font-medium">Sign in</span> to leave a review
                    </p>
                  )}

                  {(!user || business.ownerId !== user.id) && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!user) {
                      router.push('/login');
                      return;
                    }
                    if (reviewRating === 0) {
                      setReviewError('Please select a rating');
                      return;
                    }
                    createReviewMutation.mutate({
                      businessId: business.id,
                      rating: reviewRating,
                      reviewText: reviewText || undefined,
                      mediaUrl: reviewMediaUrl || undefined,
                    });
                  }} className="space-y-4">
                    {/* Star Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Rating <span className="text-red-500">*</span>
                      </label>
                      <StarRating
                        rating={reviewRating}
                        onRatingChange={setReviewRating}
                        size="lg"
                        readonly={false}
                      />
                    </div>

                    {/* Review Text */}
                    <div>
                      <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Review
                      </label>
                      <textarea
                        id="review-text"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={4}
                        className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        placeholder="Share your experience with this business..."
                      />
                    </div>

                    {/* Media Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Add Photo or Video (Optional)
                      </label>

                      {reviewMediaUrl ? (
                        <div className="relative">
                          {/* Preview uploaded media */}
                          {reviewMediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={reviewMediaUrl}
                              alt="Review media preview"
                              className="w-full sm:max-w-md h-64 object-cover rounded-lg border border-gray-300 dark:border-dark-border"
                            />
                          ) : reviewMediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video
                              src={reviewMediaUrl}
                              controls
                              className="w-full sm:max-w-md h-64 rounded-lg border border-gray-300 dark:border-dark-border"
                            />
                          ) : (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                              <p className="text-sm text-green-800 dark:text-green-200">
                                Media uploaded successfully
                              </p>
                            </div>
                          )}

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => setReviewMediaUrl('')}
                            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                          >
                            Remove media
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={openUploadWidget}
                          className="w-full border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg p-6 text-center hover:border-orange-500 dark:hover:border-orange-500 transition-colors"
                        >
                          <svg className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Click to upload photo or video</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Max 10MB for images, 50MB for videos</p>
                        </button>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={createReviewMutation.isPending || Boolean(user && reviews?.some((r: Review) => r.user?.id === user.id))}
                      className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {createReviewMutation.isPending ? 'Submitting...' : (user && reviews?.some((r: Review) => r.user?.id === user.id)) ? 'Already Reviewed' : 'Submit Review'}
                    </button>
                  </form>
                  )}
                </div>
              </div>

              {/* Existing Reviews */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Customer Reviews {reviews && reviews.length > 0 && `(${reviews.length})`}
                </h2>

                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: Review) => (
                      <div
                        key={review.id}
                        className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-6"
                      >
                        {/* Review Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {review.user?.name || 'Anonymous'}
                              </p>
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/20 rounded-full">
                                <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">Verified</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <StarRating
                            rating={review.rating}
                            onRatingChange={() => {}}
                            size="sm"
                            readonly={true}
                          />
                        </div>

                        {/* Review Text */}
                        {review.reviewText && (
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {review.reviewText}
                          </p>
                        )}

                        {/* Review Media */}
                        {review.mediaUrl && (
                          <div className="mt-4">
                            {review.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <img
                                src={review.mediaUrl}
                                alt="Review media"
                                className="w-full sm:max-w-md h-64 object-cover rounded-lg border border-gray-200 dark:border-dark-border"
                              />
                            ) : review.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                              <video
                                src={review.mediaUrl}
                                controls
                                className="w-full sm:max-w-md h-64 rounded-lg border border-gray-200 dark:border-dark-border"
                              />
                            ) : (
                              <img
                                src={review.mediaUrl}
                                alt="Review media"
                                className="w-full sm:max-w-md h-64 object-cover rounded-lg border border-gray-200 dark:border-dark-border"
                              />
                            )}
                          </div>
                        )}

                        {/* Business Owner Replies */}
                        {review.replies && review.replies.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
                            {review.replies.map((reply) => (
                              <div key={reply.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {reply.review?.business?.name || 'Business Owner'}
                                    </span>
                                    <VerifiedBadge size="sm" />
                                    <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-xs font-medium text-orange-600 dark:text-orange-400 rounded-full">
                                      Business Owner
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {reply.replyText}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Delete Button (only for review owner) */}
                        {user && review.user?.id === user.id && (
                          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-dark-border">
                            <button
                              onClick={() => handleDeleteOwnReview(review.id)}
                              disabled={deleteOwnReviewMutation.isPending}
                              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors disabled:opacity-50"
                            >
                              {deleteOwnReviewMutation.isPending ? 'Deleting...' : 'Delete my review'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border">
                    <svg className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <p className="text-gray-900 dark:text-white font-medium text-sm mb-1">
                      No reviews yet
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      Be the first to review {business.name}!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Get Quote Tab */}
          {activeTab === 'quote' && (
            <div className="max-w-4xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Request a Quote
              </h2>

              {!user ? (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-8 text-center">
                  <svg className="w-16 h-16 text-orange-600 dark:text-orange-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Sign In Required
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please create an account or sign in to request a quote from {business.name}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => router.push('/register')}
                      className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => router.push('/login')}
                      className="px-6 py-2.5 border border-orange-600 text-orange-600 dark:text-orange-400 rounded-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Fill out the form below and {business.name} will contact you shortly.
                  </p>

                  {quoteSuccess ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                  <svg className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                    Thank you!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Your quote request has been submitted and {business.name} will contact you shortly.
                  </p>
                  <button
                    onClick={() => {
                      setQuoteSuccess(false);
                      setQuoteName('');
                      setQuoteEmail('');
                      setQuotePhone('');
                      setQuoteCategoryId('');
                      setQuoteSubcategoryId('');
                      setQuoteAvailability([{ date: '', timeSlot: 'morning' }]);
                      setQuoteMessage('');
                    }}
                    className="mt-4 text-orange-600 dark:text-orange-400 hover:underline"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  {quoteError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm text-red-800 dark:text-red-200">{quoteError}</p>
                    </div>
                  )}

                  {/* Name Field */}
                  <div>
                    <label htmlFor="quote-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="quote-name"
                      type="text"
                      required
                      value={quoteName}
                      onChange={(e) => setQuoteName(e.target.value)}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="quote-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="quote-email"
                      type="email"
                      required
                      value={quoteEmail}
                      onChange={(e) => setQuoteEmail(e.target.value)}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label htmlFor="quote-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      value={quotePhone}
                      onChange={(e) => setQuotePhone(e.target.value)}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <label htmlFor="quote-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Service Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="quote-category"
                      required
                      value={quoteCategoryId}
                      onChange={(e) => {
                        setQuoteCategoryId(e.target.value);
                        setQuoteSubcategoryId(''); // Reset subcategory
                      }}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Dropdown */}
                  {quoteCategoryId && (
                    <div>
                      <label htmlFor="quote-subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Service Subcategory
                      </label>
                      <select
                        id="quote-subcategory"
                        value={quoteSubcategoryId}
                        onChange={(e) => setQuoteSubcategoryId(e.target.value)}
                        className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select a subcategory (optional)</option>
                        {filteredSubcategories?.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Availability Date Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      When are you available? (up to 3 dates) <span className="text-red-500">*</span>
                    </label>

                    {quoteAvailability.map((slot, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="date"
                          value={slot.date}
                          onChange={(e) => {
                            const newAvailability = [...quoteAvailability];
                            newAvailability[index].date = e.target.value;
                            setQuoteAvailability(newAvailability);
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          className="flex-1 appearance-none rounded-lg px-3 py-2 border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <select
                          value={slot.timeSlot}
                          onChange={(e) => {
                            const newAvailability = [...quoteAvailability];
                            newAvailability[index].timeSlot = e.target.value as 'morning' | 'afternoon' | 'evening';
                            setQuoteAvailability(newAvailability);
                          }}
                          className="appearance-none rounded-lg px-3 py-2 border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            setQuoteAvailability(quoteAvailability.filter((_, i) => i !== index));
                          }}
                          className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    {quoteAvailability.length < 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuoteAvailability([
                            ...quoteAvailability,
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
                    <label htmlFor="quote-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Information
                    </label>
                    <textarea
                      id="quote-message"
                      value={quoteMessage}
                      onChange={(e) => setQuoteMessage(e.target.value)}
                      rows={4}
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-dark-border placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      placeholder="Any additional details or requirements..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={quoteLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {quoteLoading ? 'Submitting...' : 'Request Quote'}
                  </button>
                </form>
              )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
