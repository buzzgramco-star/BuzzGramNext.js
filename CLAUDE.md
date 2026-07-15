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
│   ├── faq/                      # FAQ page (moved off homepage Jun 30)
│   ├── for-businesses/           # Vendor acquisition page (live on production; FAQPage schema)
│   ├── event-plans/[token]/      # Public shared event plan view (from AI event planner)
│   ├── admin/                    # Admin dashboard
│   ├── business-dashboard/       # Business owner dashboard (includes service management)
│   ├── quote/                    # Quote request pages
│   ├── login/                    # Login page (includes 2FA code step)
│   ├── register/                 # Registration page
│   ├── forgot-password/          # Request password reset email
│   ├── reset-password/           # Set new password via emailed token
│   ├── verify-email/             # Email verification landing page
│   └── profile/                  # User profile (includes 2FA setup/disable)
├── components/                   # React components
│   ├── Header.tsx                # Navigation header with auth
│   ├── Footer.tsx                # Footer with links
│   ├── BusinessCard.tsx          # Business listing card
│   ├── BusinessFormModal.tsx     # Create/edit business modal
│   ├── ServiceManagementModal.tsx # Add/edit service modal (supports optional owner callbacks)
│   ├── GeneralQuoteModal.tsx     # General quote request modal
│   ├── ThemeToggle.tsx           # Dark mode toggle
│   ├── GoogleAuthButton.tsx      # Google OAuth button
│   ├── AIChatSearch.tsx          # AI chat (homepage hero + floating popup; SSE streaming, events, history)
│   ├── FloatingAIChat.tsx        # Floating AI chat launcher used on city pages
│   ├── Reveal.tsx                # Scroll-into-view fade-up wrapper (fires once, reduced-motion safe)
│   └── homepage/                 # Homepage sections (HeroSection, AIDemoPreview, FloatingUseCases, …)
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

## Recent Changes (July 2026)

### IMPORTANT — Branch State Ahead of AI Launch (as of Jul 15, 2026)
- **`main` (production, buzzgram.co)**: pre-AI site **plus** the `/for-businesses` page and its dependencies (`FloatingUseCases`, `Reveal`, `AIDemoPreview`), the mobile overflow fixes, the "Other" signup option, the `listed` visibility flag, and (as of Jul 15) a homepage pause — see below. **No AI chat.**
- **`app/page.tsx` has FULLY DIVERGED between the two branches — they are not the same file evolving over time, they're two different homepages.** `main`'s version is the older one: `force-dynamic`, server-side IP detection via `x-detected-city` header, sections `HeroSection`/`CategoryShowcase`/`QuickValueProps`/`CitiesGridMatrix`/`FAQ`/`FinalCTA`. It was **never updated** with the "Homepage Static Rendering" or "Demo Merged Into Chat" work below — those entries describe `feature/ai-search`'s homepage only. Don't assume "the homepage" means the same file on both branches — check which branch before touching it. (Discovered Jul 15 while building the coming-soon pause below; a public API smoke-test caught it, not code inspection.)
- **`feature/ai-search` (preview)**: everything — AI chat, event planner, all homepage changes (static, `WhyBuzzGram`/`BrowseCategories`/pill field), plus identical copies of the shared files that are also on main (`/for-businesses`, `FloatingUseCases`, `Reveal`, mobile fixes, `listed` support). Shared files are kept byte-identical on both branches so the launch merge is conflict-free.
- Production updates ship by copying specific files onto a branch off `main` in a worktree, building, and pushing — never by merging the feature branch (that's the launch step).

### Homepage Coming-Soon Pause (Jul 15, 2026) — LIVE ON PRODUCTION
`main`'s `app/page.tsx` is gated behind a single `const COMING_SOON = true` at the top of the file. When true, `HomePage()` returns early with a `ComingSoonPage()` — real `<Header/>` (Login/Sign Up still reachable) and `<Footer/>` (all existing links, including For Businesses), a "Launching soon" message, and a CTA into `/for-businesses` — **before** any of the existing data-fetching (`getCities`/`getCategories`/`getSubcategories`) or IP-header logic runs. `export const dynamic = 'force-dynamic'` and the full original homepage body are untouched below the early return.
- **Scope is homepage-only.** Every other route (city pages, business pages, `/for-businesses`, `/business-signup`, login, dashboards, admin) is unaffected — verified directly against production (200s on all of them) after deploying this.
- **Revert**: flip `COMING_SOON` to `false`, commit, push to `main`. Nothing else to change — the original homepage code path is still there, just currently unreached.
- Page-level `metadata` export also branches on the flag ("BuzzGram — Launching Soon" vs the normal SEO title/description).
- Built and verified via the worktree-off-`main` pattern (see Branch State note); confirmed live with direct curl checks against `buzzgram.co`, not just the build output.

### AI-Only Business Cards: Instagram Link + "From $X" Pricing (Jul 15, 2026) — feature branch only
Companion to the backend's `listed` visibility flag and CSV import (see backend CLAUDE.md). In `MiniBusinessCard` (`components/AIChatSearch.tsx`):
- **`hasProfile = business.listed !== false`** — when false, the card's bottom link goes straight to `business.instagramUrl` (new tab, "View Instagram" label) instead of `/business/[slug]`, since AI-only imports have no public profile page yet. `listed` undefined (older API responses) behaves as listed, matching the backend default.
- **"From $X" price line**, styled like the homepage demo — takes the **minimum `priceNumeric` across the full flat `services` array**, not just top-level entries. Verified against seeded test data that this matters: the AI search response returns services as a flat list (parent group + variations as siblings linked only by `parentServiceId`, not a nested tree), and pricing on imported businesses almost always lives on the variation, not the parent group name — a top-level-only search found nothing for most of them.
- Added `listed?: boolean` to the `Business` type and `priceNumeric?: number | null` to `BusinessService` (`types/index.ts`).

### Manual Event-Type Picker Parked for Launch (Jul 14, 2026) — feature branch only
The "🎉 Plan event" dropdown button in the chat input bar (pick a type → instant checklist, no typing) is hidden behind `MANUAL_EVENT_PICKER_ENABLED = false` in `AIChatSearch.tsx`. Scope is only this manual shortcut UI — the AI's own conversational planning detection (typing "help me plan my wedding" → checklist + event) is untouched and still fully active, matching the unchanged homepage demo/marketing copy. Flip the flag back to `true` to restore; no other changes needed.

### For-Businesses Vendor Acquisition Page (Jul 13–14, 2026) — LIVE ON PRODUCTION
`app/for-businesses/page.tsx` — static pitch page for home-based/Instagram vendors, AI-first with "launching soon" framing:
- **Two-column hero (lg+)**: pitch/CTA left, live `AIDemoPreview` right with demand pills pinned to the box edges (`FloatingUseCases` `orbit` variant, cycling every ~4s from a 12-request pool). Mobile stacks pitch → demo → `UseCaseTicker`
- Sections: pain points, "BuzzGram difference" (text-only — demo lives in hero), 6-feature grid, "Free to list. Customers pay you directly." banner (deliberately present-tense — no permanent 0%-commission promise), how-it-works, FAQ with **FAQPage JSON-LD**, final CTA
- FAQ includes "not beauty/food/events?" answer backed by the signup form's "Other / not listed" category option (`categoryId: 'other'` → email-only backend endpoint)
- Funnel: homepage hero owner link, FinalCTA button, footer "For Businesses" link → `/for-businesses` → `/business-signup`. In sitemap at 0.9
- Copy is deliberately terse (~30-40% cut Jul 14); scroll reveals on cards/sections

### New Shared Components (Jul 13–14, 2026)
- **`components/homepage/FloatingUseCases.tsx`**: ambient use-case pills. `variant='field'` (spread across hero margins — homepage, preview only) or `'orbit'` (pinned around one box — for-businesses hero). `interactive` makes pills dispatch a `buzzgram:prefill` CustomEvent that `AIChatSearch` listens for to pre-fill the chat. Cycles pills when pool > slots (non-interactive only). Desktop-only (`hidden lg:block`); dark mode uses bright text + orange border + glow. Exports **`UseCaseTicker`**: mobile marquee variant, in-flow, pauses on touch, static+flickable under reduced-motion
- **`components/Reveal.tsx`**: IntersectionObserver fade-up on scroll into view; fires once; `delay` staggers siblings; reduced-motion shows instantly. Used on card grids/sections of homepage + for-businesses

### AI Chat Conversion & UX (Jul 12–14, 2026) — feature branch only
- **Rate-limit 429 is a conversion moment**: guests get an orange signup/login card ("Keep the conversation going — free") instead of red error text; logged-in users get a "resets tomorrow" note + browse link. No retry button on rate limits (would just 429 again). Fires `rate_limit_hit` / `rate_limit_signup_click` events. New `isRateLimit` flag on ChatMessage
- **Mobile placeholder fix**: long placeholders wrapped into the input's bottom controls at 375px — short variants below `sm` via matchMedia + `placeholder:` nowrap/ellipsis guard

### Homepage (Jul 12–14, 2026) — feature branch only
- Subcategory pills in `BrowseCategories` are real crawlable links (`/city/[city]/[cat]/[sub]`); card restructured with an overlay `<Link>` because nested anchors are invalid HTML. Dropped pills for nonexistent subcategories (Skincare, Meal Prep, Desserts, Specialty, Entertainment — they would have 404'd)
- `FinalCTA` "Start Discovering" reads persisted `buzzgram-city` from localStorage (Toronto fallback)
- `WhyBuzzGram` card copy tightened; clickable pill field + ticker in hero (see FloatingUseCases)

### Mobile Overflow Fixes (Jul 13, 2026) — LIVE ON PRODUCTION
Playwright audit at 375px found ~100px horizontal scroll on every page:
- **Footer link row never wrapped** (site-wide offender) — now `flex-wrap`
- **CookieConsent** stacked horizontally — now vertical on mobile
- **AIDemoPreview vendor row** propagated min-content width — `max-w-full` + `min-w-0` containment
- Audit method worth repeating before releases: headless Chrome at 375px, compare `scrollWidth` vs `clientWidth`, walk offending elements

### Demo Merged Into Chat + How-It-Works Strip (Jul 7, 2026)
- `AIDemoPreview` no longer renders as a standalone box — it plays **inside `AIChatSearch` as its empty state**, behind a new opt-in `demo` prop (only the homepage hero passes it; `FloatingAIChat` and city pages are unaffected)
- Demo dissolves on first interaction: focusing the textarea dismisses it; **tapping the demo pre-fills its current query** into the real input (focused, resized, ready to send)
- Demo queries personalize with the selected city (e.g. "nail tech in Toronto under $60"), loop pauses on hover, `prefers-reduced-motion` renders a static completed frame, vendor cards are white for contrast, progress dots are dark-mode safe
- Hero: removed the old demo box + "Now try it yourself" divider; added a **3-step how-it-works strip** under the chat (Say what you need → AI searches your city → Connect directly)
- Note: demo vendors are still fictional — swapping in real businesses is a known TODO

### Homepage Static Rendering + Crawlable City Links (Jul 7, 2026) — feature branch only
- **Removed `force-dynamic` from `app/page.tsx`** — it existed for server-side IP city detection that was never built (detection is client-side in AIChatSearch via ipapi.co). Homepage is now statically rendered and served from Vercel's CDN. Removed the dead `detectedCity` prop from HeroSection.
- **City pills in `BrowseCategories` are now real `<Link href="/city/[slug]">` elements** with `prefetch={false}` and an intercepted click that preserves the old behavior (pill switches the category-card destinations). All 10 city links now appear in the prerendered HTML for crawlers — previously they were `<button>`s and Google only saw the 3 Toronto category links.
- **IMPORTANT**: do not re-add `force-dynamic` to this (feature branch) homepage; nothing in it varies per request. **This never happened on `main`** — production's homepage kept `force-dynamic` and IP-header detection the whole time (see Branch State note above and the Jul 15 coming-soon entry below).

## Recent Changes (June 2026)

### Homepage Revamp (Jun 30, 2026)
- FAQ moved off the homepage to a standalone `/faq` page (footer link added)
- `HowItWorks` section removed from the homepage (component file remains; `/how-it-works` page exists)
- Copy humanized across all homepage sections (em dashes removed, broader subheadline)
- `AIDemoPreview` added: animated chat simulation (3 rotating scenarios: nails, wedding planning, birthday cake) — initially a standalone section, moved inside the hero, then merged into the chat itself on Jul 7 (see above)

### Email OTP Two-Factor Authentication (Jun 26, 2026)
- Login page gains a second step: when the backend responds `requires2FA`, user enters the 6-digit emailed code
- Profile page: enable 2FA (setup → emailed code → confirm), disable 2FA (requires password)
- New `lib/api.ts` functions: `verify2FACode`, `setup2FA`, `confirm2FA`, `disable2FA`, `resend2FACode` (hit `/auth/2fa/*`)
- `AuthContext` updated to handle the two-step login flow

### AI Event Planning UI (Jun 24–26, 2026)
All in `components/AIChatSearch.tsx` unless noted:
- **Event panel** above the thread for the latest active event: label, date, progress bar (`found/total` checklist categories), expandable checklist chips showing saved vendor per category
- **Manual "Plan Event" picker** in the input bar — `EVENT_TYPES` (wedding, bridal shower, baby shower, gender reveal, birthday, bachelorette, sweet 16, graduation), each with an `EVENT_CHECKLISTS` category list; visible to guests but prompts sign-in
- **Save vendor to plan** from result cards; share links via `createEventShareLink` → public page `app/event-plans/[token]/page.tsx`
- **`CATEGORY_KEYWORDS` / `matchesEventCategory`**: stem-based matching between checklist categories and DB subcategory names ("Bakery" matches "Home Bakers") — exact string equality fails, keep this in mind when adding categories
- Vendor carousel auto-triggers after event creation; event scoping fixed to the latest active event only

### SSE Streaming + Response Cache (Jun 19, 2026)
- AI responses now **stream token-by-token** over Server-Sent Events — `callAIStream` in AIChatSearch consumes the stream and renders progressively, then processes the final `done` event for structured data (businesses, followUps, checklist)
- Pairs with a backend in-memory response cache (see backend CLAUDE.md)

### Floating Chat on City Pages (Jun 12–18, 2026)
- New `components/FloatingAIChat.tsx` — floating launcher button that opens AIChatSearch in a popup; added to all city pages
- `CityPageClient` switched from inline chat to the floating popup (Jun 18) for UI consistency
- Instagram DM links added to AI responses

### Conversation History Overhaul (Jun 13–14, 2026)
Replaced the original per-city conversation storage (documented under Jun 11 below) with **user-scoped conversation history**:
- Logged-in users: multiple named conversations via `/api/conversations` (list/create/update/delete) — `getConversations`, `getConversationById`, `createConversation`, `updateConversation`, `deleteConversation` in `lib/api.ts`
- History panel inside the chat: list conversations with title/message count/date, load one, delete, "+ New chat"
- Each conversation stores its `citySlug`; loading a conversation restores its city
- Selected city persists in `localStorage` (`buzzgram-city`) across remounts; guest chats persist in `sessionStorage`
- IP city detection hardened: fallback service + `METRO_ALIASES` (suburbs map to supported cities, e.g. Mississauga → Toronto); auto-detects city from message text when none selected
- Retry button on failed AI messages; errors filtered out of saved history

### AI Chat Search Feature — feature/ai-search branch (Jun 11, 2026)

#### New Component: `components/AIChatSearch.tsx`
- Full LLM-style multi-turn chatbot for discovering local businesses
- **City selector**: dropdown (chevron rotation, checkmark on selected, closes on outside click/touch). Auto-detects city from IP via `ipapi.co/json/` (3s timeout, silent fail) on homepage. On city pages, `initialCitySlug` prop pre-selects the city.
- **Conversation thread**: user bubbles (orange, right-aligned) + AI bubbles (icon + label + text + checklist + carousels + follow-up chips)
- **Grouped results**: `groupBusinesses()` groups AI results by `subcategory.name` → fallback to `category.name`. Each group renders as a `CarouselRow`.
- **CarouselRow**: horizontally scrollable row of `MiniBusinessCard` tiles. Left/right arrow buttons (`hidden sm:flex`), auto-hide at scroll ends via `onScroll` + `setTimeout(sync, 50)`. `scrollBy(±220)`, cards fixed `w-48`.
- **MiniBusinessCard**: compact inline card (not `BusinessCard`) — `w-48`, `p-3`, shows name + Instagram handle + city. Links to `/business/[slug]`.
- **Conversation persistence**:
  - Logged-in users: saved to DB via `GET/PUT/DELETE /api/ai-conversations/:citySlug`. Max 5 conversations × 20 messages per user. Auto-deletes oldest when cap hit — shows toast notification.
  - Guests: `sessionStorage` keyed by `buzzgram-chat-[citySlug]`. Survives back-navigation within the tab.
  - Load triggered when `selectedCity` resolves (guarded by `loadedCityRef` to prevent double-load).
  - Save triggered immediately after each AI reply inside `setMessages` callback.
  - Clear chat: wipes DB (logged-in) or sessionStorage (guest).
- **Toast**: fixed bottom-center, 4s auto-dismiss, shown when oldest conversation is auto-deleted.
- **Textarea**: auto-resizes up to 160px, Enter submits, Shift+Enter newlines.
- **Rate limit handling**: 429 response shows appropriate message (different for guest vs logged-in).
- **Example prompts**: shown on empty state as clickable chips.
- **Follow-up chips**: AI returns `followUps[]` — clicking sends the suggestion as a new message.
- **Planning checklist**: shown for `type: "planning"` responses (e.g. wedding planning).
- **Clear chat**: resets messages + deletes stored conversation.

#### Modified: `components/homepage/HeroSection.tsx`
- Removed old search bar (`useState`, `useRouter`, `handleSearch`, `<form>`)
- Added `<AIChatSearch />` in a `max-w-2xl mx-auto mb-8` wrapper

#### Modified: `app/city/[slug]/CityPageClient.tsx`
- Removed `searchInput` state, sync useEffect, debounced URL update useEffect, mobile search input
- Added `<AIChatSearch initialCitySlug={city.slug} />` between breadcrumbs and filters

#### New API functions in `lib/api.ts`
```typescript
getAIConversation(citySlug)      // GET /api/ai-conversations/:citySlug → messages[]
saveAIConversation(citySlug, messages)  // PUT → { autoDeleted: boolean }
deleteAIConversation(citySlug)   // DELETE
```

### AI Chat City Dropdown & Hero Copy (Jun 15, 2026)

#### City Dropdown in `components/AIChatSearch.tsx`
Replaced the static city name text with an interactive dropdown for manual city switching:
- `cityDropdownOpen` state + `cityDropdownRef` ref
- `useEffect` on `cityDropdownRef` closes the dropdown on click/touch outside
- Button shows city name + pin icon + chevron that rotates 180° when open
- Clicking a city calls `setSelectedCity(city)`, clears `activeFocusedSlug`, closes dropdown
- Active city shows orange text + checkmark icon
- Dropdown hidden when `cities.length === 0` (still loading)

#### Hero marketing copy in `components/homepage/HeroSection.tsx`
- **Eyebrow badge**: "AI-Powered Business Discovery" → "Meet the AI that knows your city"
- **Subtitle**: "The best local talent isn't on Google — they're home-based and Instagram-only. BuzzGram AI is the first of its kind: just describe what you need and it instantly surfaces the hidden nail techs, bakers, lash artists, photographers and event planners in your city."
- **Social proof strip**:
  - "Home-based & Instagram businesses" → "Businesses you won't find anywhere else"
  - "10 cities" → "10 cities & growing"
  - "Beauty · Food · Events" → "Beauty · Food · Events · and more"

### AI Data Capture — Phases 2–4 (Jun 17, 2026)

#### Phase 2 — Session tracking + event tracking in `components/AIChatSearch.tsx`
- `SESSION_KEY = 'buzzgram-session-id'` constant — localStorage key for the analytics session UUID
- `sessionId` state (`useState<string | null>(null)`)
- Session init `useEffect` (runs once on mount): calls `POST /api/ai-sessions` with `existingSessionId` from localStorage if present. Stores/updates `buzzgram-session-id` in localStorage. Silent fail — tracking must never break the chat.
- `trackEvent` useCallback: fire-and-forget `POST /api/ai-events` with `{ sessionId, eventType, payload }`. Silent fail.
- `sessionId` passed with every `POST /api/ai-search` call (both `sendMessage` and `retryMessage`)
- `CarouselRow.onSelect` now calls `trackEvent('business_click', { businessSlug: slug })` before `sendMessage`
- Follow-up chip `onClick` calls `trackEvent('followup_click', { text: suggestion })` before `sendMessage`

#### Phase 3 — Thumbs up/down feedback in `components/AIChatSearch.tsx`
- `ratings` state: `Record<string, 'up' | 'down'>` — keyed by `msg.id`
- `handleRating(msgId, rating)` useCallback: toggles off if same rating clicked again; fires `trackEvent('thumbs_up' | 'thumbs_down', { messageId })` on new rating
- `setRatings({})` called in both `handleClearChat` and `handleNewChat`
- Thumbs buttons rendered after follow-up chips on every completed, non-error assistant message
- Visual states: grey (unrated) → green thumbs up / red thumbs down when selected
- Dependency array: `[ratings, trackEvent]`

#### Phase 4 — AI Analytics in Admin Dashboard

**`lib/api.ts`**
- Added `getAIStats()` — `GET /admin/ai-stats` — returns sessions, queries, events, topQueries, topBusinesses, sessionsByCity, avgResponseMs

**`app/admin/page.tsx`**
- Added `showAIStats` state and `{ data: aiStats, isLoading: aiStatsLoading }` useQuery (lazy — only fetches when expanded)
- Stats grid changed from `xl:grid-cols-5` to `lg:grid-cols-3` to accommodate 6th card cleanly
- **AI Analytics stat card** (indigo): shows total sessions + today count, expands on click
- **Expanded section** contains:
  - 4 summary cards: Sessions (with 24h/7d breakdowns), Queries, Satisfaction % (thumbs_up / total ratings), Avg Response Time
  - Session Sources: Guest vs Authenticated counts
  - Interaction Events: business_click, followup_click, thumbs_up, thumbs_down counts
  - Sessions by City table
  - Top 10 Queries table (with count)
  - Most Clicked Businesses table (slug + click count)
- `downloadAIStatsCSV()` function: builds a multi-section CSV client-side from `aiStats` (no backend call). CSV includes Summary, Session Sources, Interaction Events, Sessions by City, Top Queries, Most Clicked Businesses.
- **Export CSV** button in section header — only visible once data has loaded

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
NEXT_PUBLIC_AI_PREVIEW_KEY=...  # PREVIEW ENVIRONMENT ONLY — sent as X-Preview-Key on /api/ai-search for unlimited team testing; must NEVER be set on Production (would disable AI rate limits for everyone)
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
- Vercel deployments are automatic on git push to main; pushes to feature branches create preview deployments only
- Homepage must stay statically rendered — no `force-dynamic`, no per-request logic in `app/page.tsx` (city detection is client-side in AIChatSearch). **This rule only applies to `feature/ai-search`'s homepage — `main`'s `app/page.tsx` is a different, older file that still has `force-dynamic` and was never migrated.** Check which branch before assuming which rule applies (see Branch State note under Recent Changes).
- The AI demo (`AIDemoPreview`) only renders inside AIChatSearch when the `demo` prop is passed — currently homepage hero only
- `main`'s `app/page.tsx` currently has `COMING_SOON = true` (Jul 15, 2026) — check that flag before assuming what the live homepage shows or touching that file
