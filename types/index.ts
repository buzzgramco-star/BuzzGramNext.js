export interface City {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  createdAt: string;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  categoryId: number;
  createdAt: string;
  category?: Category;
}

export interface BusinessService {
  id: number;
  businessId: number;
  serviceName: string;
  price: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  cityId: number;
  categoryId: number;
  subcategoryId: number | null;
  ownerId: number | null;
  instagramHandle: string | null;
  instagramUrl: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  imageUrl: string | null;
  featured: boolean;
  claimedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  city?: City;
  category?: Category;
  subcategory?: Subcategory;
  services?: BusinessService[];
}

export interface BusinessSearchParams {
  cityId?: number;
  categoryId?: number;
  subcategoryId?: number;
  search?: string;
}

export interface QuoteRequest {
  businessId: number;
  name: string;
  email: string;
  phone?: string;
  categoryId: number;
  subcategoryId?: number;
  availability: string; // JSON string of date/time slots
  message?: string;
}

export interface AvailabilitySlot {
  date: string; // ISO date string
  timeSlot: 'morning' | 'afternoon' | 'evening';
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  userType: 'customer' | 'business_owner';
  emailVerified: boolean;
  businessName?: string | null;
  instagramHandle?: string | null;
  phone?: string | null;
  googleId?: string | null;
  oauthProvider?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  userType: 'customer' | 'business_owner';
  businessName?: string;
  instagramHandle?: string;
  phone?: string;
}

export interface EmailVerificationInput {
  token: string;
}

export interface GeneralQuote {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  categoryId: number;
  subcategoryId: number | null;
  budget: string | null;
  availability: string;
  message: string | null;
  status: 'pending' | 'viewed' | 'responded';
  createdAt: string;
  updatedAt: string;
  user?: User;
  category?: Category;
  subcategory?: Subcategory;
  categories?: Category[];
  subcategories?: Subcategory[];
}

export interface ReviewReply {
  id: number;
  reviewId: number;
  userId: number;
  replyText: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
  };
  review?: {
    business: {
      id: number;
      name: string;
    };
  };
}

export interface Review {
  id: number;
  businessId: number;
  userId: number;
  rating: number;
  reviewText: string | null;
  mediaUrl: string | null;
  status: 'visible' | 'hidden';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    email?: string;
  };
  business?: {
    id: number;
    name: string;
  };
  replies?: ReviewReply[];
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  status: 'draft' | 'published' | 'hidden';
  authorId: number | null;
  authorName: string;
  featuredImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: number;
    name: string;
  };
}

export interface CreateBlogInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: string;
  status?: 'draft' | 'published' | 'hidden';
  authorName?: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
