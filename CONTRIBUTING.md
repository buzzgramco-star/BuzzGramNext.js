# Contributing to BuzzGram Frontend

Thank you for contributing to BuzzGram! This guide will help you get started with development.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Backend API running locally or access to production API

### Initial Setup

1. Clone the repository and navigate to frontend:
```bash
cd frontend-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure `.env.local` with your values:
   - Set `NEXT_PUBLIC_API_URL` to backend URL
   - Add Cloudinary credentials (if testing image uploads)
   - Add Google Client ID (if testing Google OAuth)

5. Start development server:
```bash
npm run dev
```

6. Open http://localhost:3000

## 📋 Development Workflow

### Branch Strategy

- `main` - Production branch (auto-deploys to Vercel)
- `develop` - Development branch (staging)
- `feature/feature-name` - Feature branches
- `fix/bug-name` - Bug fix branches

### Creating a Feature

1. Create a new branch from `develop`:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

2. Make your changes

3. Test thoroughly (see Testing section)

4. Commit your changes (see Commit Guidelines)

5. Push and create Pull Request:
```bash
git push origin feature/your-feature-name
```

## 🎨 Code Style

### TypeScript

- **Use TypeScript** for all new files
- **Define types** - Avoid `any`, use proper interfaces
- **Import types** from `/types/index.ts`

```typescript
// ✅ Good
import { Business, Category } from '@/types';

interface Props {
  businesses: Business[];
  onSelect: (id: number) => void;
}

// ❌ Bad
const props: any = { ... };
```

### React Components

- **Use functional components** with hooks
- **Use client components** only when needed (`"use client"`)
- **Default to server components** for better SEO
- **Extract reusable logic** into custom hooks

```typescript
// ✅ Good - Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ✅ Good - Client Component (when needed)
"use client";

import { useState } from 'react';

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### File Naming

- **Components**: PascalCase (`BusinessCard.tsx`, `Header.tsx`)
- **Utilities**: camelCase (`api.ts`, `cloudinary.ts`)
- **Pages**: lowercase (`page.tsx`, `layout.tsx`)
- **Types**: PascalCase interfaces (`Business`, `Category`)

### Styling

- **Use Tailwind CSS** for all styling
- **Follow dark mode patterns** - Always add `dark:` variants
- **Mobile-first** - Start with mobile, add `md:` and `lg:` breakpoints
- **Consistent spacing** - Use Tailwind spacing scale (p-4, mb-6, etc.)

```tsx
// ✅ Good
<div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg p-4 md:p-6">

// ❌ Bad - Missing dark mode, inline styles
<div style={{ padding: '20px' }} className="bg-white">
```

### Color Palette

Use BuzzGram's official colors:

- **Primary Orange**: `#FF6B35` (use `text-[#FF6B35]` or `bg-orange-600`)
- **Dark Background**: `#0F1419` (`bg-dark-bg`)
- **Dark Card**: `#1A1F26` (`bg-dark-card`)
- **Dark Border**: `#2D3748` (`border-dark-border`)

## 🏗️ Project Structure

### Where to Add Files

```
app/
├── city/[slug]/          # Add new cities here
├── business/             # Business detail pages
├── admin/                # Admin dashboard pages
├── business-dashboard/   # Business owner pages
└── ...

components/               # Add reusable components here
├── Header.tsx
├── Footer.tsx
├── BusinessCard.tsx
└── ...

lib/                      # Add utilities here
├── api.ts                # API client functions
└── cloudinary.ts

types/
└── index.ts              # Add TypeScript types here
```

### Adding a New City with SSR

1. Create city directory: `app/city/your-city-name/`
2. Create category pages: `[category]/page.tsx`, `[category]/layout.tsx`, `[category]/CategoryClient.tsx`
3. Create subcategory pages: `[category]/[subcategory]/page.tsx`, `[category]/[subcategory]/layout.tsx`, `[category]/[subcategory]/SubcategoryClient.tsx`
4. Update city metadata with correct city ID and state/province code
5. Test all routes and structured data

### Adding a New Component

1. Create component in `/components/YourComponent.tsx`
2. Add TypeScript props interface
3. Include dark mode support
4. Make it responsive (mobile-first)
5. Export from component file

```typescript
// /components/YourComponent.tsx
interface YourComponentProps {
  title: string;
  onAction: () => void;
}

export default function YourComponent({ title, onAction }: YourComponentProps) {
  return (
    <div className="bg-white dark:bg-dark-card p-4 rounded-lg">
      <h2 className="text-gray-900 dark:text-white">{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

## 🧪 Testing

### Before Committing

1. **Run build** to check for TypeScript errors:
```bash
npm run build
```

2. **Test dark mode** - Toggle theme and verify all components

3. **Test responsive** - Check mobile, tablet, desktop breakpoints

4. **Test SSR** - View page source to verify metadata and structured data

5. **Check console** - No errors or warnings

### Testing SEO/Structured Data

1. Run production build:
```bash
npm run build
npm start
```

2. View page source (right-click → View Page Source)

3. Verify:
   - Meta tags (title, description, og:tags)
   - JSON-LD structured data (CollectionPage, FAQPage, etc.)
   - Correct city names (no "Toronto" on Vancouver pages!)

4. Test with Google's Rich Results Test:
   - https://search.google.com/test/rich-results

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Formatting, missing semicolons, etc. (not CSS)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

### Examples

```bash
# Good commit messages
git commit -m "feat(city): add Phoenix SSR pages with structured data"
git commit -m "fix(metadata): correct city names in dynamic route layout"
git commit -m "refactor(api): extract business fetching into reusable function"
git commit -m "docs(readme): update cities list with Phoenix and Chicago"

# Bad commit messages
git commit -m "fix stuff"
git commit -m "updates"
git commit -m "WIP"
```

### What to Include in Commits

- **Atomic commits** - One logical change per commit
- **Related files** - Group related changes together
- **No secrets** - Never commit `.env.local`, API keys, passwords
- **No generated files** - Don't commit `node_modules/`, `.next/`, `dist/`

## 🔍 Pull Request Process

### Before Creating PR

1. **Rebase on latest develop**:
```bash
git checkout develop
git pull origin develop
git checkout your-branch
git rebase develop
```

2. **Run full build**:
```bash
npm run build
```

3. **Test thoroughly** (see Testing section)

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring

## Changes Made
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Tested dark mode
- [ ] Tested SSR/SEO (if applicable)
- [ ] Build passes (`npm run build`)

## Screenshots (if applicable)
Add screenshots for UI changes
```

### Review Process

1. **Self-review** - Review your own code first
2. **Request review** - Assign reviewers
3. **Address feedback** - Make requested changes
4. **Get approval** - Wait for approval from reviewer
5. **Merge** - Squash and merge into develop

## 🚫 Common Mistakes to Avoid

### ❌ Don't Do This

1. **Hardcoding city names** in shared layouts
```typescript
// ❌ Bad
const cityName = 'Toronto'; // Wrong for all other cities!

// ✅ Good
const cityName = city?.name || slug;
```

2. **Using `any` type**
```typescript
// ❌ Bad
const business: any = { ... };

// ✅ Good
import { Business } from '@/types';
const business: Business = { ... };
```

3. **Forgetting dark mode**
```tsx
// ❌ Bad
<div className="bg-white text-gray-900">

// ✅ Good
<div className="bg-white dark:bg-dark-card text-gray-900 dark:text-white">
```

4. **Client components everywhere**
```typescript
// ❌ Bad - Unnecessary client component
"use client";
export default function StaticPage() { ... }

// ✅ Good - Server component by default
export default async function StaticPage() { ... }
```

5. **Committing secrets**
```bash
# ❌ Bad
git add .env.local

# ✅ Good - .env.local is in .gitignore
git add .env.example
```

6. **Not testing mobile**
- Always test responsive design
- Use Chrome DevTools device toolbar
- Test on actual mobile device if possible

## 🆘 Getting Help

### Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Backend API Docs**: See `/Users/Mustafa/backend/README.md`

### Common Issues

**Build fails with TypeScript errors**
- Check that all types are properly imported from `/types`
- Ensure no `any` types without explicit annotation
- Run `npm run build` to see exact errors

**Dark mode not working**
- Ensure you added `dark:` variants for all color classes
- Check ThemeContext is properly configured
- Test by toggling theme in browser

**API calls failing**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check backend is running
- Check CORS configuration in backend

**Metadata not showing**
- Ensure `generateMetadata()` is exported from page.tsx or layout.tsx
- Check that you're using server components (not "use client")
- Build and view page source to verify

## 📞 Contact

For questions or support, contact the development team.

---

Happy coding! 🚀
