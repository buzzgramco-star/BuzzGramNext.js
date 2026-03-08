# BuzzGram Frontend - Claude Code Reference

## Project Overview
BuzzGram is a business directory platform for North American cities, built with Next.js 15 and TypeScript. The frontend provides a fully server-side rendered experience with comprehensive SEO optimization for all city, category, and subcategory pages.

## Tech Stack
- **Framework**: Next.js 15.1.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API (Auth, Theme)
- **Data Fetching**: TanStack Query (React Query)
- **API Client**: Axios
- **Authentication**: JWT + Google OAuth
- **Image Management**: Cloudinary
- **Deployment**: Vercel

## Project Structure
```
frontend-nextjs/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles + .blog-content CSS rules
│   ├── city/                     # City pages
│   │   ├── toronto/              # Toronto SSR pages (category/subcategory)
│   │   ├── vancouver/            # Vancouver SSR pages
│   │   ├── calgary/              # Calgary SSR pages
│   │   ├── montreal/             # Montreal SSR pages
│   │   ├── ottawa/               # Ottawa SSR pages
│   │   ├── los-angeles/          # Los Angeles SSR pages
│   │   ├── new-york-city/        # NYC SSR pages
│   │   ├── miami/                # Miami SSR pages
│   │   ├── chicago/              # Chicago SSR pages
│   │   └── phoenix/              # Phoenix SSR pages
│   ├── business/[slug]/          # Business detail pages (dynamic)
│   ├── blog/                     # Blog pages
│   │   ├── page.tsx              # Blog listing (SSR, 60s revalidate)
│   │   └── [slug]/
│   │       ├── page.tsx          # Blog detail SSR page (structured data, metadata)
│   │       └── BlogDetailClient.tsx # Client component (progress bar, TOC sidebar)
│   ├── admin/                    # Admin dashboard
│   ├── business-dashboard/       # Business owner dashboard (includes service management)
│   ├── quote/                    # Quote request pages
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   └── profile/                  # User profile
├── components/                   # React components
│   ├── Header.tsx                # Navigation header with auth
│   ├── Footer.tsx                # Footer with links
│   ├── BusinessCard.tsx          # Business listing card
│   ├── BusinessFormModal.tsx     # Create/edit business modal
│   ├── ServiceManagementModal.tsx # Add/edit service modal (supports optional owner callbacks)
│   ├── GeneralQuoteModal.tsx     # General quote request modal
│   ├── ThemeToggle.tsx           # Dark mode toggle
│   └── GoogleAuthButton.tsx      # Google OAuth button
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx           # Authentication state
│   └── ThemeContext.tsx          # Dark mode theme state
├── lib/                          # Utilities and helpers
│   ├── api.ts                    # API client functions
│   └── cloudinary.ts             # Cloudinary configuration
├── types/                        # TypeScript type definitions
│   └── index.ts                  # Global types
└── public/                       # Static assets
```

## Key Features

### Server-Side Rendering (SSR)
- All city pages are server-rendered for optimal SEO
- 10 cities × 3 categories × subcategories = 90+ SSR pages
- Pre-rendered pages include full structured data (Schema.org)
- Dynamic business detail pages with slug-based routing

### SEO Optimization
- **Structured Data**: CollectionPage, FAQPage, BreadcrumbList, ItemList schemas
- **Meta Tags**: Comprehensive title, description, Open Graph tags
- **URL Structure**: Clean, semantic URLs (e.g., `/city/toronto/beauty/nails`)
- **Sitemap**: Dynamic sitemap generation for all pages

### Authentication
- JWT-based authentication stored in localStorage
- Google OAuth integration
- Protected routes with AuthContext
- Role-based UI rendering (admin, business_owner, user)
- Auto-login after registration

### Dark Mode
- Full dark mode support with Tailwind CSS
- Theme persistence in localStorage
- ThemeContext for global theme state
- Custom color palette optimized for dark mode

## Routing Architecture

### City Pages (SSR)
Each city has hardcoded routes for categories and subcategories:

```typescript
// Example: /app/city/toronto/beauty/nails/page.tsx
export default async function TorontoBeautyNailsPage() {
  const businesses = await getBusinesses({
    cityId: 36,
    subcategoryId: 11
  });

  return <CitySubcategoryClient businesses={businesses} />;
}

// Metadata for SEO
export async function generateMetadata() {
  return {
    title: 'Top Nail Salons in Toronto | BuzzGram',
    description: 'Discover the best nail salons in Toronto...',
    // ... Open Graph, structured data
  };
}
```

### Dynamic Routes
- `/business/[slug]` - Business detail pages (SSR)
- `/city/[slug]` - Fallback dynamic city pages

### Static Routes
- `/` - Homepage
- `/admin` - Admin dashboard (protected)
- `/business-dashboard` - Business owner dashboard (protected)
- `/profile` - User profile (protected)
- `/login` - Login page
- `/register` - Registration page

## Component Architecture

### Core Components

**Header.tsx**
- Navigation menu with city/category links
- Authentication UI (login/logout, user menu)
- Dark mode toggle
- Mobile responsive menu

**BusinessCard.tsx**
- Displays business info (name, address, Instagram)
- Favorite button (heart icon)
- Links to business detail page
- Shows service count
- **IMPORTANT**: Instagram handle stored with @ in DB, displayed with @ (no double @@)

**BusinessFormModal.tsx**
- Create/edit business modal (admin only)
- Form fields: name, city, category, subcategory, Instagram, description, address
- **IMPORTANT**: Strips @ prefix when loading Instagram handle for editing
- Validates and adds @ prefix on submit

**ServiceManagementModal.tsx**
- Add/edit service modal with full hierarchy support (2-level variations, 3-level subcategories)
- Fields: serviceName (required), price (optional), duration (optional), parentServiceId
- Duplicate service/subcategory/variation functionality
- **Accepts optional callback props** `onAddService` and `onUpdateService` — when provided, used instead of admin API functions. This allows the same modal to serve both admin and business owner contexts.
- Default behaviour (no callbacks): uses `addAdminService` / `updateAdminService` — admin dashboard unchanged
- Business owner usage: pass `handleOwnerAddService` / `handleOwnerUpdateService` callbacks that call owner endpoints

**GeneralQuoteModal.tsx**
- General quote request form
- Multi-category and multi-subcategory selection
- Availability calendar with time slots
- Budget and message fields

### Layout Components

**ThemeProvider** (contexts/ThemeContext.tsx)
- Manages dark mode state
- Persists theme to localStorage
- Provides `theme` and `toggleTheme` to children

**AuthProvider** (contexts/AuthContext.tsx)
- Manages authentication state
- Provides `user`, `login`, `logout`, `register`, `isAdmin`, `isBusinessOwner`
- Stores JWT in localStorage
- Auto-fetches user on mount if token exists

## State Management

### React Context
- **AuthContext**: User authentication state, JWT token management
- **ThemeContext**: Dark mode theme state

### TanStack Query (React Query)
Used for data fetching and mutations with automatic cache invalidation:

```typescript
// Fetch businesses
const { data: businesses } = useQuery({
  queryKey: ['businesses', { cityId, categoryId }],
  queryFn: () => getBusinesses({ cityId, categoryId }),
});

// Create business mutation
const createMutation = useMutation({
  mutationFn: createAdminBusiness,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['businesses'] });
  },
});
```

### LocalStorage
- `token` - JWT authentication token
- `theme` - Dark mode preference ('light' | 'dark')

## API Integration

### API Client (lib/api.ts)
All API functions are centralized in `lib/api.ts`:

```typescript
import { api } from '@/lib/api';

// Authentication
await api.post('/auth/login', { email, password });
await api.post('/auth/register', { ... });
await api.post('/auth/google', { credential });

// Businesses
const businesses = await getBusinesses({ cityId, categoryId });
const business = await getBusinessBySlug(slug);

// Admin
await createAdminBusiness({ name, cityId, ... });
await updateAdminBusiness(id, { ... });
await deleteBusiness(id);
await addAdminService(businessId, { serviceName, price, duration });
await updateAdminService(businessId, serviceId, { ... });
await deleteAdminService(businessId, serviceId);

// Favorites
await addFavorite(businessId);
await removeFavorite(businessId);

// Quotes
await submitQuoteRequest({ ... });
```

### API Base URL
Configured in `lib/api.ts`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  'https://backend-production-f30d.up.railway.app';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
```

## Authentication Flow

### Login
1. User enters email/password
2. POST `/api/auth/login`
3. Backend returns JWT + user object
4. Store JWT in localStorage
5. Update AuthContext with user
6. Redirect to dashboard or homepage

### Google OAuth
1. User clicks "Sign in with Google"
2. Google returns credential
3. POST `/api/auth/google` with credential
4. Backend validates, creates/updates user, returns JWT
5. Store JWT in localStorage
6. Update AuthContext
7. Redirect based on user type

### Protected Routes
```typescript
// In component
const { user, isAdmin } = useAuth();

if (!user) {
  redirect('/login');
}

if (isAdmin) {
  // Show admin UI
}
```

## Admin Features (app/admin/page.tsx)

### Business Management
- View all businesses (including paused) with `includeInactive: true`
- Create new business with BusinessFormModal
- Edit business details (name, city, category, Instagram, etc.)
- Pause/unpause businesses (changes status)
- Delete businesses

### Service Management (NEW - Feb 17, 2026)
- **Collapsible service list** for each business
- Shows service count: "Manage Services (5)"
- Click to expand and see all services
- **Add Service** button opens ServiceManagementModal
- **Edit** button for each service (pre-populates form)
- **Delete** button for each service (with confirmation)
- Real-time updates with React Query invalidation

### User Management
- View all users
- Pause/unpause users
- Delete users

### Quote Management
- View all business quotes
- View all general quotes
- Delete quotes

### Statistics Dashboard
- Total businesses, users, quotes, reviews
- Active vs paused counts
- Recent activity

## Business Owner Features (app/business-dashboard/page.tsx)

### My Business
- View owned business details
- Edit business profile (description, address, Instagram)
- View quote requests
- View and reply to customer reviews

### Service Management (Services & Pricing section)
- Collapsible "Services & Pricing" section showing all services including admin-created ones
- 3-level hierarchy display: parent → children (expand/collapse) → grandchildren
- Add new services using `ServiceManagementModal` with owner callbacks
- Edit any service (name, price, duration) — including services added by admin
- Delete services (cascade deletes all children)
- Service count shown in section header
- Uses `getOwnerBusiness` query (includes flat services list with `parentServiceId`)
- Hierarchy built client-side by filtering `parentServiceId === null` for parents
- **Scoped strictly to own business** — backend enforces `ownerId = userId` on every call

### Quote Requests
- View quote requests for owned business
- Contact information for follow-up

## Blog Styling (globals.css)
Blog content is stored as HTML in the database and rendered via `dangerouslySetInnerHTML`. Styling is applied via direct CSS class selectors in `globals.css` — **do NOT use Tailwind prose modifier classes** for blog content as they are unreliable.

```css
/* Key blog content rules in globals.css */
.blog-content { color: #374151; line-height: 1.8; font-size: 1.125rem; }
.blog-content h2 { font-size: 1.875rem; font-weight: 800; margin-top: 3.5rem; border-bottom: 2px solid #e5e7eb; }
.blog-content h3 { font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; }
.blog-content strong { font-weight: 700; color: #111827; }
.dark .blog-content h2 { color: #ffffff; border-bottom-color: #374151; }
```

`@plugin "@tailwindcss/typography"` is imported in `globals.css` but blog content styling uses `.blog-content` selectors, not prose classes.

## Blog Detail Page (app/blog/[slug]/)

### page.tsx (Server Component)
- Fetches blog by slug server-side
- Generates metadata (title, description, Open Graph)
- Injects JSON-LD structured data (Article schema)
- Renders `<BlogDetailClient blog={blog} />` — passes only serializable data, no functions

### BlogDetailClient.tsx (Client Component)
- Reading progress bar (fixed top, orange → pink gradient)
- Article header with breadcrumb, category badge, title, excerpt, author, date, read time
- Main content area: `<div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />`
- Sidebar TOC (desktop only, xl breakpoint) — populated from h2 headings via IntersectionObserver
- CTA section at bottom linking to homepage and blog listing
- Contains `formatDate` internally — **never pass functions as props from Server to Client Component**

## Recent Changes (March 2026)

### Business Owner Service Management (Mar 8, 2026)
- Added "Services & Pricing" collapsible section to business owner dashboard
- Business owners can view, add, edit, and delete all services including admin-created ones
- Full 3-level hierarchy display with expand/collapse per parent service
- `ServiceManagementModal` refactored to accept optional `onAddService`/`onUpdateService` callbacks
- Admin dashboard behaviour unchanged (no callbacks = uses admin functions as default)
- New API functions: `getOwnerBusiness`, updated `addBusinessService`, `updateBusinessService`, `deleteBusinessService`

## Recent Changes (February 2026)

### Blog Detail Page (Feb 2026)
- Added `app/blog/[slug]/page.tsx` — SSR with metadata, Open Graph, Article JSON-LD structured data
- Added `app/blog/[slug]/BlogDetailClient.tsx` — reading progress bar, TOC sidebar, full-width hero layout
- `@tailwindcss/typography` installed; blog content styled via `.blog-content` CSS selectors in globals.css
- **Key lesson**: Never pass functions as props from Server Components to Client Components in Next.js 15
- Blog listing page (`app/blog/page.tsx`) uses 60s revalidation

### Instagram Handle Display Fix (Feb 17, 2026)
- **Bug**: Business cards showed `@@hairbycle0` instead of `@hairbycle0`
- **Root Cause**: Database stores handles with @ prefix, component was adding another @
- **Fix**: Removed extra @ from display in BusinessCard.tsx line 120
- **Fix**: Strip @ when loading edit form in BusinessFormModal.tsx

### Menu Label for Food Category (Feb 17, 2026)
- Food category businesses now show "Menu" instead of "Services"
- Business detail page (BusinessDetailClient.tsx):
  - Tab button: "Menu" for Food, "Services" for others
  - Section heading: "Menu" for Food, "Services Offered" for others
- Conditional rendering based on `business.category?.name === 'Food'`

### Admin Service Management (Feb 17, 2026)
- **New Component**: ServiceManagementModal.tsx
- Admins can add/edit/delete services for any business
- Collapsible service list in admin dashboard
- Service count display with expand/collapse
- Real-time updates with React Query mutations
- API functions: `addAdminService`, `updateAdminService`, `deleteAdminService`

### Business Status Filtering (Feb 17, 2026)
- Admin dashboard now passes `includeInactive: true` to view paused businesses
- Public pages only show active businesses
- Backend filters out paused businesses automatically

### Services Inclusion in Business Queries (Feb 17, 2026)
- Business queries now include `services` relation
- Service count displays correctly in admin dashboard
- Services are ordered by `displayOrder` and `id`

## Important Code Patterns

### Server-Side Rendering
```typescript
// app/city/toronto/beauty/nails/page.tsx
import { getBusinesses } from '@/lib/api';

export default async function Page() {
  // Fetch data server-side
  const businesses = await getBusinesses({
    cityId: 36,
    subcategoryId: 11
  });

  return <ClientComponent businesses={businesses} />;
}

// Client component for interactivity
'use client';
export function ClientComponent({ businesses }: Props) {
  // Interactive features (favorites, modals, etc.)
}
```

### Metadata for SEO
```typescript
export async function generateMetadata() {
  return {
    title: 'Best Nail Salons in Toronto | BuzzGram',
    description: 'Discover top-rated nail salons...',
    openGraph: {
      title: '...',
      description: '...',
      url: '...',
      images: [{ url: '...' }],
    },
  };
}
```

### Structured Data (Schema.org)
```typescript
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Nail Salons in Toronto",
    "description": "...",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": businesses.map((b, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "LocalBusiness",
          "name": b.name,
          "address": b.address,
          // ...
        }
      }))
    }
  })}
</script>
```

### React Query Mutations
```typescript
const createMutation = useMutation({
  mutationFn: (data) => createAdminBusiness(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['businesses'] });
    setModalOpen(false);
  },
  onError: (error) => {
    console.error(error);
  },
});

// Usage
createMutation.mutate({ name, cityId, categoryId });
```

### Protected Routes
```typescript
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';

export default function ProtectedPage() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    redirect('/login');
  }

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return <AdminDashboard />;
}
```

## Common Issues & Solutions

### Double @@ Instagram Handle
- **Issue**: Instagram handles showing `@@hairbycle0`
- **Solution**: Database stores with @, don't add another @ in display
- **Files**: BusinessCard.tsx line 120, BusinessFormModal.tsx edit form

### Service Count Showing 0
- **Issue**: Service count shows 0 even after adding services
- **Solution**: Backend must include `services` relation in business queries
- **Backend File**: `src/routes/businesses.ts` - add `services` to `with` clause

### Paused Businesses Visible to Public
- **Issue**: Paused businesses still showing on public pages
- **Solution**: Backend filters by `status = 'active'` on public endpoints
- **Admin Override**: Pass `includeInactive: true` in admin dashboard

### CORS Errors
- **Issue**: API calls failing with CORS errors
- **Solution**: Verify `FRONTEND_URL` in backend matches Vercel deployment URL
- **URL**: `https://buzzgram-frontend.vercel.app` (NOT `buzz-gram-next-js.vercel.app`)

### Blog Content Not Styled (No Spacing, No Bold, Dark Mode Invisible)
- **Issue**: Blog content renders as unstyled text
- **Solution**: Use `.blog-content` CSS selectors in `globals.css`, NOT Tailwind prose modifier classes
- **Root cause history**: `@tailwindcss/typography` was missing; prose modifier classes generated zero CSS
- Blog content div must have `className="blog-content"` — styling is applied via globals.css rules

### Dark Mode Not Persisting
- **Issue**: Dark mode resets on page refresh
- **Solution**: ThemeContext saves to localStorage, check `useEffect` runs on mount

### Authentication State Lost on Refresh
- **Issue**: User logged out after page refresh
- **Solution**: AuthContext checks localStorage for token on mount and fetches user

## Deployment (Vercel)

### Environment Variables
Set in Vercel dashboard:
```env
NEXT_PUBLIC_API_URL=https://backend-production-f30d.up.railway.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Deploy
```bash
# Automatic deployment on push to main
git push origin main

# Manual deployment
vercel deploy
```

### Build Command
```bash
npm run build
```

### Environment-Specific Builds
- **Production**: `NODE_ENV=production` - uses production API URL
- **Preview**: `NODE_ENV=production` - uses production API URL
- **Development**: `NODE_ENV=development` - uses localhost API

## Production URLs
- Frontend: https://buzzgram-frontend.vercel.app
- Backend: https://backend-production-f30d.up.railway.app
- API: https://backend-production-f30d.up.railway.app/api

## Notes for Claude Code
- Always use specialized tools (Read, Edit, Write) instead of bash for file operations
- When adding new city pages, maintain consistent structure with existing cities
- Instagram handles: DB stores with @, display as-is, strip @ when editing
- Service management: Always invalidate React Query cache after mutations
- SEO: All city pages must have metadata, structured data, and FAQPage schema
- Dark mode: Test both light and dark themes when making UI changes
- Use TodoWrite tool to track multi-step tasks
- Vercel deployments are automatic on git push to main
