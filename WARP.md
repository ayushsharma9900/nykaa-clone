# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.
``

## Project Overview

This is a **Nykaa Clone** - a beauty and cosmetics e-commerce application built with modern web technologies. It's a Next.js 15 application using React 19, TypeScript, and Tailwind CSS, designed to replicate the functionality of the popular beauty retailer Nykaa.

## Tech Stack & Architecture

### Core Technologies
- **Next.js 15** with App Router (latest version with Turbopack support)
- **React 19** and **React DOM 19**
- **TypeScript 5** for type safety
- **Tailwind CSS 4** for styling with custom utilities
- **Prisma** (configured but schema not yet implemented)
- **NextAuth.js** for authentication
- **bcryptjs** for password hashing
- **jsonwebtoken** for JWT handling

### UI Libraries
- **@headlessui/react** - Unstyled, accessible UI components
- **@heroicons/react** - Beautiful hand-crafted SVG icons
- **lucide-react** - Additional icon library

### Development Tools
- **ESLint 9** with Next.js configuration
- **PostCSS** with Tailwind integration
- Custom Tailwind utilities for line clamping

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── products/          # Product listing page
│   ├── layout.tsx         # Root layout with header
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── admin/            # Admin-specific components
│   ├── layout/           # Layout components (Header)
│   └── ui/               # UI components (ProductCard)
├── data/                 # Static data and mock content
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
```

## Development Commands

### Essential Commands
```bash
# Development server with Turbopack (faster builds)
npm run dev

# Production build with Turbopack
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

### Database Commands (Prisma)
```bash
# Generate Prisma client (when schema exists)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

### TypeScript Commands
```bash
# Type checking
npx tsc --noEmit

# Watch mode type checking
npx tsc --noEmit --watch
```

## Core Architecture Concepts

### Data Management
- **Mock Data**: Currently uses static data in `src/data/products.ts`
- **Type Safety**: Comprehensive TypeScript interfaces in `src/types/index.ts`
- **Future Database**: Prisma ORM configured for database integration

### Component Architecture
- **Server Components**: Default for better performance (most pages)
- **Client Components**: Used when interactivity is needed (marked with 'use client')
- **Shared UI Components**: Reusable components in `src/components/ui/`

### Styling System
- **Tailwind CSS 4**: Utility-first CSS framework
- **Custom Utilities**: Line clamping utilities for text truncation
- **Design Tokens**: Pink/rose color scheme as primary brand color
- **Responsive Design**: Mobile-first approach with responsive breakpoints

### Key Features Implemented
1. **Product Catalog**: Comprehensive product listing with filtering and sorting
2. **Admin Dashboard**: Management interface for products, orders, and analytics
3. **Responsive Design**: Mobile-optimized layouts
4. **Search Functionality**: Product search interface (UI only)
5. **User Authentication**: NextAuth.js integration (authentication structure)

## Important Files & Their Purposes

### Configuration Files
- `next.config.ts` - Next.js configuration (minimal, ready for extensions)
- `tailwind.config.js` - Tailwind CSS configuration with custom utilities
- `tsconfig.json` - TypeScript configuration with path aliases
- `eslint.config.mjs` - ESLint configuration for Next.js and TypeScript

### Core Application Files
- `src/app/layout.tsx` - Root layout with fonts and header
- `src/app/page.tsx` - Homepage with hero, categories, featured products
- `src/types/index.ts` - Central type definitions for Product, User, Cart, Order
- `src/lib/utils.ts` - Utility functions for formatting, validation

### Key Components
- `src/components/layout/Header.tsx` - Main navigation with search, cart, user icons
- `src/components/ui/ProductCard.tsx` - Product display component with rating, pricing
- `src/app/admin/page.tsx` - Admin dashboard with stats, orders, product management
- `src/app/products/page.tsx` - Product listing with filters, sorting, and search

## Notes

- Testing: No test runner is configured (no test scripts in package.json). If you add one later, update this file with how to run all tests and a single test command.
- Database/Auth: prisma and next-auth are present in dependencies, but there is no prisma/ directory or schema.prisma. Skip prisma commands until a schema is added and environment variables are configured.
- External images: Product images load from Unsplash. To avoid Next/Image domain errors in builds, add the domain to next.config.ts images configuration when you enable strict remote patterns.
