# Next.js Migration Testing Checklist

**Status**: In Progress
**Date**: January 19, 2026
**Environment**: Local Development (http://localhost:3000)
**Backend**: Local (http://localhost:3001)

---

## Critical User Flows

### 1. Public User Flow
- [ ] **Homepage** (/)
  - [ ] City grid loads and displays all cities
  - [ ] Auto-redirect to last city works (if previously visited)
  - [ ] Dark mode toggle works
  - [ ] Footer links work

- [ ] **City Page** (/city/36 - Toronto)
  - [ ] Businesses load and display correctly
  - [ ] Search functionality works
  - [ ] Category filtering works
  - [ ] Business cards show correct data
  - [ ] Pagination works
  - [ ] Click business card → navigates to business detail
  - [ ] Header shows on city page

- [ ] **Business Detail Page** (/business/[id])
  - [ ] Business details display correctly
  - [ ] Reviews load and display
  - [ ] Photos/images display
  - [ ] Contact info shows correctly
  - [ ] Map/location info works
  - [ ] "Request Quote" button works

- [ ] **Blog Pages**
  - [ ] Blog listing (/blog) - posts load without 404
  - [ ] Category filtering works
  - [ ] Blog detail (/blog/[slug]) - content displays

### 2. Authentication Flow
- [ ] **Register Page** (/register)
  - [ ] Form validation works
  - [ ] User can register
  - [ ] Email verification flow works
  - [ ] Redirects appropriately after registration

- [ ] **Login Page** (/login)
  - [ ] Email/password login works
  - [ ] Google OAuth works
  - [ ] Error messages display correctly
  - [ ] Redirects to dashboard after login
  - [ ] "Remember me" cookie persists

- [ ] **Email Verification** (/verify-email)
  - [ ] Token verification works
  - [ ] Success message displays
  - [ ] Redirects to login after verification

- [ ] **Logout**
  - [ ] Logout clears cookie
  - [ ] Redirects to homepage
  - [ ] User dropdown closes

### 3. Regular User Flow (Logged In)
- [ ] **User Dashboard** (/dashboard)
  - [ ] User info displays correctly
  - [ ] Favorites load and display
  - [ ] Quote requests load and display
  - [ ] General quotes load and display
  - [ ] Collapsible sections work
  - [ ] "Remove favorite" works
  - [ ] Navigation works

- [ ] **Favorites Page** (/favorites)
  - [ ] All favorited businesses display
  - [ ] Unfavorite button works
  - [ ] Empty state shows when no favorites

- [ ] **Profile Page** (/profile)
  - [ ] User info displays
  - [ ] Profile data is correct

- [ ] **Settings Page** (/settings)
  - [ ] Change password works
  - [ ] Theme toggle works
  - [ ] Account deletion works (with confirmation)

- [ ] **Quote Request Flow**
  - [ ] Quote landing page (/quote) loads
  - [ ] Multi-category selection works (1-5 categories)
  - [ ] Subcategories appear when category selected
  - [ ] Form validation works
  - [ ] Submit quote request works
  - [ ] Success message displays

### 4. Business Owner Flow
- [ ] **Business Signup** (/business-signup)
  - [ ] Form loads with all fields
  - [ ] Category/subcategory dropdowns work
  - [ ] Submit registration works
  - [ ] Success message displays

- [ ] **Claim Business** (/claim-business)
  - [ ] Search for business works
  - [ ] Select business works
  - [ ] Submit claim works
  - [ ] Success message displays

- [ ] **Business Owner Dashboard** (/business-dashboard)
  - [ ] ⚠️ Requires role='business_owner' - user must log out and back in after approval
  - [ ] Owned businesses display
  - [ ] Quote requests display
  - [ ] Reviews display
  - [ ] Reply to reviews works
  - [ ] Edit reply works
  - [ ] Delete reply works
  - [ ] Collapsible sections work

- [ ] **Edit Business** (/edit-business/[id])
  - [ ] Business data pre-fills
  - [ ] Form validation works
  - [ ] Update business info works
  - [ ] Upload photos works
  - [ ] Success message displays

### 5. Admin Flow
- [ ] **Admin Dashboard** (/admin)
  - [ ] ⚠️ Requires role='admin'
  - [ ] Stats cards display numbers (not 0s)
    - Total Businesses: 1000
    - Total Users: 6
    - Quotes Received: 9
  - [ ] Business search works
  - [ ] User management works
  - [ ] Delete/pause businesses works
  - [ ] Delete/pause users works
  - [ ] Approve/reject business claims works
  - [ ] Approve/reject business registrations works
  - [ ] Blog management works (create/edit/delete)
  - [ ] Review management works (hide/delete)

---

## Technical Testing

### Authentication & Authorization
- [ ] Protected routes redirect to /login when not authenticated
- [ ] Admin routes redirect to / when not admin
- [ ] Business owner routes redirect to / when not business owner
- [ ] JWT token persists in cookie
- [ ] Token refresh works
- [ ] Logout clears all auth state

### Data Fetching
- [ ] React Query caching works
- [ ] Loading spinners display during fetch
- [ ] Error messages display on API failure
- [ ] Retry logic works on network errors
- [ ] Data invalidation works after mutations

### Forms
- [ ] All form validations work
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] Form resets after submission
- [ ] Disabled buttons prevent double-submission

### Dark Mode
- [ ] Toggle switches between light/dark
- [ ] Theme persists across page reloads
- [ ] Theme persists in localStorage
- [ ] All pages render correctly in both modes
- [ ] No hydration mismatches

### Navigation
- [ ] All Next.js Links work
- [ ] Browser back/forward buttons work
- [ ] Router.push() programmatic navigation works
- [ ] Query parameters persist correctly
- [ ] URL structure matches old Vite app

---

## Known Issues to Verify Fixed

- [x] ~~Blog page 404 error~~ - Fixed: Backend needed restart
- [x] ~~Business owner dashboard access~~ - Fixed: Role updates on approval
- [x] ~~Admin dashboard stats showing 0~~ - Fixed: Added error handling
- [x] ~~CORS errors~~ - Fixed: .env.local pointed to local backend
- [x] ~~Missing Header on city page~~ - Fixed: Added Header component
- [x] ~~Quote landing page 404~~ - Fixed: Renamed route to /quote

---

## Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Performance
- [ ] Pages load within 2 seconds
- [ ] No console errors
- [ ] No console warnings (except expected)
- [ ] Images load properly
- [ ] No memory leaks in dev tools

---

## Next Steps After Testing
1. Fix any issues discovered during testing
2. Deploy to separate Vercel project for staging
3. Test on staging with production backend
4. Switch production domain to Next.js app

---

## Testing Notes
- Local backend must be running on port 3001
- Use test accounts:
  - Admin: Check database for admin user
  - Business Owner: buzzgramco@gmail.com, mustafanazary95@gmail.com, swiftshopcanada@gmail.com
  - Regular User: Create new test user

**Business Owners**: Must log out and back in after approval to get new JWT with 'business_owner' role.
