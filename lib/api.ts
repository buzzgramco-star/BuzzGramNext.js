import axios from 'axios';
import type { City, Category, Subcategory, Business, BusinessSearchParams, GeneralQuote, BlogPost, CreateBlogInput } from '@/types';

// Use environment variable for API URL (fallback to production URL)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')
  || 'https://backend-production-f30d.up.railway.app';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const getCities = async (): Promise<City[]> => {
  const { data } = await api.get<{ success: boolean; data: City[] }>('/cities');
  return data.data;
};

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<{ success: boolean; data: Category[] }>('/categories');
  return data.data;
};

export const getSubcategories = async (): Promise<Subcategory[]> => {
  const { data } = await api.get<{ success: boolean; data: Subcategory[] }>('/subcategories');
  return data.data;
};

export const getBusinesses = async (params: BusinessSearchParams): Promise<Business[]> => {
  const { data } = await api.get<{ success: boolean; data: Business[] }>('/businesses', { params });
  return data.data;
};

export const getBusiness = async (id: number): Promise<Business> => {
  const { data } = await api.get<{ success: boolean; data: Business }>(`/businesses/${id}`);
  return data.data;
};

export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  const { data } = await api.get('/health');
  return data;
};

// Favorites
export const getFavorites = async () => {
  const { data } = await api.get('/favorites');
  return data.data;
};

export const addFavorite = async (businessId: number) => {
  const { data } = await api.post(`/favorites/${businessId}`);
  return data;
};

export const removeFavorite = async (businessId: number) => {
  const { data } = await api.delete(`/favorites/${businessId}`);
  return data;
};

export const checkFavorite = async (businessId: number): Promise<boolean> => {
  const { data } = await api.get(`/favorites/check/${businessId}`);
  return data.data.isFavorited;
};

// Quote Requests
export const submitQuoteRequest = async (quoteData: {
  businessId: number;
  name: string;
  email: string;
  phone?: string;
  categoryId: number;
  subcategoryId?: number;
  availability: string;
  message?: string;
}) => {
  const { data } = await api.post('/quote-requests', quoteData);
  return data;
};

// General Quotes (Admin only)
export const getGeneralQuotes = async (): Promise<GeneralQuote[]> => {
  const { data } = await api.get<{ success: boolean; data: GeneralQuote[] }>('/general-quotes');
  return data.data;
};

// Get current user's all quotes (general + business)
export const getMyQuotes = async () => {
  const { data } = await api.get('/general-quotes/my-quotes');
  return data.data;
};

// Delete a general quote
export const deleteGeneralQuote = async (quoteId: number) => {
  const { data } = await api.delete(`/general-quotes/${quoteId}`);
  return data;
};

// Delete a business quote
export const deleteBusinessQuote = async (quoteId: number) => {
  const { data } = await api.delete(`/quote-requests/${quoteId}`);
  return data;
};

// Admin: Get dashboard statistics
export const getAdminStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data.data;
};

// Admin: Get all users
export const getAllUsers = async () => {
  const { data } = await api.get('/admin/users');
  return data.data;
};

// Admin: Get all business quote requests
export const getAllBusinessQuotes = async () => {
  const { data } = await api.get('/quote-requests');
  return data.data;
};

// Admin: Delete a business
export const deleteBusiness = async (businessId: number) => {
  const { data } = await api.delete(`/admin/businesses/${businessId}`);
  return data;
};

// Admin: Update business status (pause/unpause)
export const updateBusinessStatus = async (businessId: number, status: string) => {
  const { data } = await api.put(`/admin/businesses/${businessId}`, { status });
  return data;
};

// Admin: Delete a user
export const deleteUser = async (userId: number) => {
  const { data } = await api.delete(`/admin/users/${userId}`);
  return data;
};

// Admin: Update user status (pause/unpause)
export const updateUserStatus = async (userId: number, status: string) => {
  const { data } = await api.put(`/admin/users/${userId}/status`, { status });
  return data;
};

// Business Claims
export const submitBusinessClaim = async (claimData: {
  businessId: number;
  name: string;
  email: string;
  phone: string;
}) => {
  const { data } = await api.post('/business-claims', claimData);
  return data;
};

// Admin: Get all business claims
export const getBusinessClaims = async () => {
  const { data } = await api.get('/business-claims/admin/claims');
  return data.data;
};

// Admin: Approve business claim
export const approveBusinessClaim = async (claimId: number) => {
  const { data } = await api.put(`/business-claims/admin/claims/${claimId}/approve`);
  return data;
};

// Admin: Reject business claim
export const rejectBusinessClaim = async (claimId: number) => {
  const { data } = await api.put(`/business-claims/admin/claims/${claimId}/reject`);
  return data;
};

// Admin: Get all business registrations
export const getBusinessRegistrations = async () => {
  const { data } = await api.get('/business-registrations/admin/registrations');
  return data.data;
};

// Admin: Approve business registration
export const approveBusinessRegistration = async (registrationId: number) => {
  const { data } = await api.put(`/business-registrations/admin/registrations/${registrationId}/approve`);
  return data;
};

// Admin: Reject business registration
export const rejectBusinessRegistration = async (registrationId: number) => {
  const { data } = await api.put(`/business-registrations/admin/registrations/${registrationId}/reject`);
  return data;
};

// Business Owner: Get owned businesses
export const getOwnedBusinesses = async () => {
  const { data } = await api.get('/owner/businesses');
  return data.data;
};

// Business Owner: Get single business for editing
export const getOwnerBusiness = async () => {
  const { data } = await api.get('/owner/business');
  return data.data;
};

// Business Owner: Update business profile
export const updateBusinessProfile = async (profileData: {
  description?: string;
  address?: string;
  instagramHandle?: string;
}) => {
  const { data } = await api.put('/owner/business', profileData);
  return data;
};

// Business Owner: Add service
export const addBusinessService = async (serviceData: {
  serviceName: string;
  price?: string;
}) => {
  const { data } = await api.post('/owner/business/services', serviceData);
  return data;
};

// Business Owner: Update service
export const updateBusinessService = async (serviceId: number, serviceData: {
  serviceName?: string;
  price?: string;
}) => {
  const { data } = await api.put(`/owner/business/services/${serviceId}`, serviceData);
  return data;
};

// Business Owner: Delete service
export const deleteBusinessService = async (serviceId: number) => {
  const { data} = await api.delete(`/owner/business/services/${serviceId}`);
  return data;
};

// Business Owner: Reorder services
export const reorderBusinessServices = async (serviceIds: number[]) => {
  const { data } = await api.put('/owner/business/services/reorder', { serviceIds });
  return data;
};

// User: Change password
export const changePassword = async (currentPassword: string, newPassword: string) => {
  const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
  return data;
};

// User: Set password for OAuth users
export const setPassword = async (newPassword: string) => {
  const { data } = await api.post('/auth/set-password', { newPassword });
  return data;
};

// User: Delete own account
export const deleteOwnAccount = async (password: string) => {
  const { data } = await api.delete('/auth/delete-account', { data: { password } });
  return data;
};

// Business Owner: Get quote requests for owned businesses
export const getMyQuoteRequests = async () => {
  const { data } = await api.get('/quote-requests/my-requests');
  return data.data;
};

// Reviews
export const createReview = async (reviewData: {
  businessId: number;
  rating: number;
  reviewText?: string;
  mediaUrl?: string;
}) => {
  const { data } = await api.post('/reviews', reviewData);
  return data;
};

export const getBusinessReviews = async (businessId: number) => {
  const { data } = await api.get(`/reviews/business/${businessId}`);
  return data.data;
};

export const getAllReviews = async () => {
  const { data } = await api.get('/reviews');
  return data.data;
};

export const toggleReviewVisibility = async (reviewId: number) => {
  const { data } = await api.patch(`/reviews/${reviewId}/toggle-visibility`);
  return data;
};

export const deleteReview = async (reviewId: number) => {
  const { data } = await api.delete(`/reviews/${reviewId}`);
  return data;
};

export const deleteOwnReview = async (reviewId: number) => {
  const { data } = await api.delete(`/reviews/my/${reviewId}`);
  return data;
};

// Business Owner: Get reviews for owned business
export const getOwnerReviews = async () => {
  const { data} = await api.get('/owner/reviews');
  return data.data;
};

// Review Replies
export const createReviewReply = async (reviewId: number, replyText: string) => {
  const { data } = await api.post(`/reviews/${reviewId}/reply`, { replyText });
  return data;
};

export const updateReviewReply = async (replyId: number, replyText: string) => {
  const { data } = await api.put(`/reviews/replies/${replyId}`, { replyText });
  return data;
};

export const deleteReviewReply = async (replyId: number) => {
  const { data } = await api.delete(`/reviews/replies/${replyId}`);
  return data;
};

// Google OAuth authentication
export const googleAuth = async (
  credential: string,
  userType?: 'customer' | 'business_owner',
  businessName?: string,
  instagramHandle?: string,
  phone?: string
) => {
  const { data } = await api.post('/auth/google', {
    credential,
    userType,
    businessName,
    instagramHandle,
    phone,
  });
  return data;
};

// Blog Posts - Public
export const getPublishedBlogs = async (): Promise<BlogPost[]> => {
  const { data } = await api.get('/blogs');
  return data;
};

export const getBlogBySlug = async (slug: string): Promise<BlogPost> => {
  const { data } = await api.get(`/blogs/${slug}`);
  return data;
};

// Blog Posts - Admin
export const getAllBlogs = async (): Promise<BlogPost[]> => {
  const { data } = await api.get('/blogs/admin/all');
  return data;
};

export const createBlog = async (blogData: CreateBlogInput): Promise<BlogPost> => {
  const { data } = await api.post('/blogs/admin', blogData);
  return data;
};

export const updateBlog = async (id: number, blogData: Partial<CreateBlogInput>): Promise<BlogPost> => {
  const { data } = await api.put(`/blogs/admin/${id}`, blogData);
  return data;
};

export const updateBlogStatus = async (id: number, status: 'draft' | 'published' | 'hidden'): Promise<BlogPost> => {
  const { data } = await api.put(`/blogs/admin/${id}/status`, { status });
  return data;
};

export const deleteBlog = async (id: number): Promise<void> => {
  await api.delete(`/blogs/admin/${id}`);
};
