# BuzzGram - Local Business Directory Platform

BuzzGram is a modern local business directory platform that connects customers with verified businesses across major North American cities. Built with Next.js 16 and optimized for SEO with server-side rendering.

## 🌟 Features

- **Server-Side Rendering (SSR)** - Pre-rendered pages for optimal SEO performance
- **SEO Optimized** - Comprehensive structured data (Schema.org) for all city, category, and subcategory pages
- **Multi-City Support** - 10 major cities with dedicated SSR implementations (5 Canadian, 5 US)
- **Dark Mode** - Full dark mode support with theme persistence
- **User Authentication** - Google OAuth and email/password authentication with JWT
- **Business Listings** - Browse businesses by city, category, and subcategory
- **Quote Requests** - General and business-specific quote request system with availability calendar
- **Business Dashboard** - For business owners to manage their listings and services
- **Admin Panel** - Comprehensive admin dashboard with business, service, user, and quote management
- **Service Management** - Admins can add, edit, delete, and reorder services for any business
- **Responsive Design** - Mobile-first design with Tailwind CSS v4
- **Real-time Search** - Search businesses within city pages with instant results
- **Favorites System** - Save and manage favorite businesses with heart icon
- **Instagram Integration** - View business portfolios directly from Instagram feeds
- **Reviews & Ratings** - Customer reviews with business owner replies

## 🏙️ Cities with Full SSR + SEO Implementation

### Canada
- **Toronto** (ON) - City ID: 36
- **Vancouver** (BC) - City ID: 37
- **Calgary** (AB) - City ID: 38
- **Montreal** (QC) - City ID: 39
- **Ottawa** (ON) - City ID: 40

### United States
- **Los Angeles** (CA) - City ID: 31
- **New York City** (NY) - City ID: 32
- **Miami** (FL) - City ID: 33
- **Chicago** (IL) - City ID: 34
- **Phoenix** (AZ) - City ID: 35

Each city includes:
- Category pages (Beauty, Food, Events)
- Subcategory pages (Nails, Lashes, Makeup, Hair, Bakery, Catering, Chefs, Decor, Photography, Venues)
- CollectionPage schema
- FAQPage schema (8 questions)
- BreadcrumbList schema
- ItemList with LocalBusiness entries

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: Google OAuth, Custom JWT
- **State Management**: React Context API
- **API Client**: Axios
- **Image Uploads**: Cloudinary
- **Deployment**: Vercel
- **Backend**: Node.js/Express (Railway)
- **Database**: PostgreSQL with Drizzle ORM

## 📁 Project Structure

```
frontend-nextjs/
├── app/                          # Next.js App Router
│   ├── city/                     # City pages
│   │   ├── [slug]/              # Dynamic city route
│   │   ├── toronto/             # Toronto SSR pages
│   │   ├── vancouver/           # Vancouver SSR pages
│   │   ├── calgary/             # Calgary SSR pages
│   │   ├── montreal/            # Montreal SSR pages
│   │   ├── ottawa/              # Ottawa SSR pages
│   │   ├── los-angeles/         # Los Angeles SSR pages
│   │   ├── new-york-city/       # New York City SSR pages
│   │   ├── miami/               # Miami SSR pages
│   │   ├── chicago/             # Chicago SSR pages
│   │   └── phoenix/             # Phoenix SSR pages
│   ├── business/                # Business detail pages
│   ├── admin/                   # Admin dashboard
│   ├── business-dashboard/      # Business owner dashboard
│   ├── quote/                   # Quote request pages
│   └── ...                      # Other app routes
├── components/                   # React components
│   ├── Header.tsx               # Navigation header with auth
│   ├── Footer.tsx               # Footer component
│   ├── BusinessCard.tsx         # Business listing card
│   ├── BusinessFormModal.tsx    # Create/edit business modal
│   ├── ServiceManagementModal.tsx # Add/edit service modal (NEW)
│   ├── GeneralQuoteModal.tsx    # Quote request modal
│   ├── ThemeToggle.tsx          # Dark mode toggle
│   ├── GoogleAuthButton.tsx     # Google OAuth button
│   └── ...                      # Other components
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx          # Authentication context
│   └── ThemeContext.tsx         # Dark mode theme context
├── lib/                          # Utilities and helpers
│   ├── api.ts                   # API client functions
│   └── cloudinary.ts            # Cloudinary configuration
├── types/                        # TypeScript type definitions
│   └── index.ts                 # Global types
└── public/                       # Static assets

```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend repository)

### Installation

1. Clone the repository:
```bash
cd frontend-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build & Deploy

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel deploy
```

The project is configured for automatic deployment to Vercel on push to main branch.

## 🎨 Branding

**Logo**: BuzzGram
- Font: Bold system font stack
- "Buzz" color: `#111827` (light mode), `#FFFFFF` (dark mode)
- "Gram" color: `#FF6B35` (custom orange)
- Tagline: "Discover Local Businesses"

**Color Palette**:
- Primary Orange: `#FF6B35`
- Dark Background: `#0F1419`
- Dark Card: `#1A1F26`
- Dark Border: `#2D3748`

## 📊 Categories & Subcategories

### Beauty Services (Category ID: 10)
- Nail Salons (ID: 11)
- Lash Extensions (ID: 12)
- Makeup Artists (ID: 13)
- Hair Salons (ID: 14)

### Food Services (Category ID: 11)
- Bakery (ID: 15)
- Catering Services (ID: 16)
- Private Chefs (ID: 17)

### Event Services (Category ID: 12)
- Event Decor (ID: 18)
- Event Planning (ID: 19)
- Event Photography (ID: 20)

## 🔗 API Integration

Backend API Base URL: `https://backend-production-f30d.up.railway.app/api`

### Key Endpoints

**Public Endpoints**
- `GET /cities` - List all cities
- `GET /cities/by-slug/:slug` - Get city by slug
- `GET /categories` - List all categories
- `GET /subcategories` - List all subcategories
- `GET /businesses` - List businesses (with filters: cityId, categoryId, subcategoryId, search, includeInactive)
- `GET /businesses/by-slug/:slug` - Get business by slug
- `GET /businesses/:id` - Get business details

**Authentication**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/google` - Google OAuth login
- `GET /auth/me` - Get current user
- `PUT /auth/change-password` - Change password
- `DELETE /auth/delete-account` - Delete account

**Admin Endpoints** (requires admin role)
- `POST /admin/businesses` - Create business
- `PUT /admin/businesses/:id` - Update business
- `DELETE /admin/businesses/:id` - Delete business
- `POST /admin/businesses/:businessId/services` - Add service
- `PUT /admin/businesses/:businessId/services/:id` - Update service
- `DELETE /admin/businesses/:businessId/services/:id` - Delete service
- `GET /admin/stats` - Get platform statistics
- `GET /admin/users` - List all users

**Quotes**
- `POST /general-quotes` - Submit general quote request
- `POST /quote-requests` - Submit business-specific quote request
- `GET /general-quotes/my-quotes` - Get user's quotes

**Favorites**
- `GET /favorites` - Get user's favorites
- `POST /favorites/:businessId` - Add favorite
- `DELETE /favorites/:businessId` - Remove favorite
- `GET /favorites/check/:businessId` - Check if favorited

**Reviews**
- `GET /reviews/business/:businessId` - Get reviews for business
- `POST /reviews` - Create review
- `POST /reviews/:reviewId/reply` - Reply to review (business owner)

## 🧪 Testing

```bash
npm run test
```

## 📝 Environment Variables

Required environment variables:

```env
# API
NEXT_PUBLIC_API_URL=https://backend-production-f30d.up.railway.app

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🌐 Deployment

The application is deployed on **Vercel** at: `https://buzz-gram-next-js.vercel.app`

Automatic deployments are configured for:
- Production: `main` branch
- Preview: Pull requests

## 📄 License

This project is proprietary and confidential.

## 👥 Contributing

This is a private project. Contact the project owner for contribution guidelines.

## 🔄 Recent Changes

### February 2026

**Admin Service Management (Feb 17)**
- Added ServiceManagementModal component for adding/editing services
- Collapsible service list in admin dashboard with service count
- Add, edit, and delete services for any business
- Real-time updates with React Query cache invalidation
- Service fields: serviceName (required), price (optional), duration (optional)

**Instagram Handle Display Fix (Feb 17)**
- Fixed double @@ bug in business cards (@@hairbycle0 → @hairbycle0)
- Database stores handles with @ prefix, display shows as-is
- Edit form strips @ when loading for editing
- Updated BusinessCard.tsx and BusinessFormModal.tsx

**Menu Label for Food Category (Feb 17)**
- Food category businesses now show "Menu" instead of "Services"
- Updated business detail page tab and section heading
- Conditional rendering based on category name

**Subcategory Routing Fix (Feb 17)**
- Fixed Chef subcategory showing no businesses (slug mismatch: "chefs" → "chef")
- Fixed Event Planning subcategory (was mapped to photography ID)
- Updated all 10 city subcategory page configurations

**Business Status Filtering (Feb 17)**
- Admin dashboard now passes `includeInactive=true` to view paused businesses
- Public pages only show active businesses automatically
- Paused businesses no longer visible to customers

**Services Display Fix (Feb 17)**
- Service count now displays correctly in admin dashboard
- Backend includes services relation in business queries
- Shows service details with edit/delete buttons

### January 2026

**SSR Implementation**
- Implemented server-side rendering for all 10 cities
- Added comprehensive SEO metadata and structured data
- Created 90+ static pages for categories and subcategories

## 🐛 Known Issues

None currently reported.

## 📞 Support

For support, contact the development team.

---

Built with ❤️ using [Next.js](https://nextjs.org) and [Tailwind CSS](https://tailwindcss.com)
