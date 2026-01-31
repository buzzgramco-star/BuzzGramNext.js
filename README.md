# BuzzGram - Local Business Directory Platform

BuzzGram is a modern local business directory platform that connects customers with verified businesses across major North American cities. Built with Next.js 16 and optimized for SEO with server-side rendering.

## 🌟 Features

- **Server-Side Rendering (SSR)** - Pre-rendered pages for optimal SEO performance
- **SEO Optimized** - Comprehensive structured data (Schema.org) for all city, category, and subcategory pages
- **Multi-City Support** - 10 major cities with dedicated SSR implementations
- **Dark Mode** - Full dark mode support with theme persistence
- **User Authentication** - Google OAuth and email/password authentication
- **Business Listings** - Browse businesses by city, category, and subcategory
- **Quote Requests** - General and business-specific quote request system
- **Business Dashboard** - For business owners to manage their listings
- **Admin Panel** - Manage businesses, quotes, and user accounts
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Real-time Search** - Search businesses within city pages
- **Favorites** - Save and manage favorite businesses
- **Instagram Integration** - View business portfolios directly from Instagram

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
│   ├── Header.tsx               # Navigation header
│   ├── Footer.tsx               # Footer component
│   ├── BusinessCard.tsx         # Business listing card
│   ├── GeneralQuoteModal.tsx    # Quote request modal
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
- Event Photography (ID: 20)
- Event Venues (ID: 20)

## 🔗 API Integration

Backend API Base URL: `https://backend-production-f30d.up.railway.app/api`

### Key Endpoints

- `GET /cities` - List all cities
- `GET /cities/by-slug/:slug` - Get city by slug
- `GET /categories` - List all categories
- `GET /subcategories` - List all subcategories
- `GET /businesses` - List businesses (with filters)
- `GET /businesses/:id` - Get business details
- `POST /general-quotes` - Submit general quote request
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/google` - Google OAuth login

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

## 🐛 Known Issues

None currently reported.

## 📞 Support

For support, contact the development team.

---

Built with ❤️ using [Next.js](https://nextjs.org) and [Tailwind CSS](https://tailwindcss.com)
