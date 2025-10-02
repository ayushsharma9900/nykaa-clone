# Vercel Database Setup Guide

## Current Issue

The Nykaa clone is deployed on Vercel but products and categories are not showing because the database is not properly configured in the production environment.

## Database Configuration

The application uses a dual database setup:
- **Local Development**: SQLite database (`database/kayaalife.db`)
- **Production (Vercel)**: PostgreSQL database

## Root Cause

On Vercel, the application checks for:
1. `process.env.VERCEL` (automatically set by Vercel)
2. `process.env.POSTGRES_URL` (needs to be configured manually)

Since `POSTGRES_URL` is missing, the app tries to use SQLite in a serverless environment, which fails. The updated code now properly handles this case and triggers the fallback system.

## Solutions

### Option 1: Set up PostgreSQL Database (Recommended)

1. **Create a PostgreSQL database** using one of these services:
   - Vercel Postgres (recommended)
   - Neon
   - Supabase
   - Railway
   - PlanetScale

2. **Add environment variable to Vercel**:
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add: `POSTGRES_URL` with your database connection string

3. **Deploy the application** to trigger database initialization

### Option 2: Use Vercel Postgres (Easy Setup)

1. In your Vercel dashboard:
   - Go to Storage tab
   - Click "Create Database"
   - Select "Postgres"
   - Connect to your project

2. Vercel will automatically set the `POSTGRES_URL` environment variable

### Option 3: Use Fallback System (Current Implementation)

The application now includes a comprehensive fallback system:
- **80 products** across 5 main categories
- **8 categories** with full product counts
- Full search, filtering, and pagination support
- Automatic activation when database is unavailable

## Fallback System Details

### Products Available (80 total):
- **Skincare**: 16 products (cleansers, serums, moisturizers, sunscreens)
- **Makeup**: 16 products (foundations, lipsticks, eyeshadows, mascaras)
- **Hair Care**: 16 products (shampoos, conditioners, treatments, oils)
- **Fragrance**: 16 products (eau de parfum, eau de toilette from luxury brands)
- **Personal Care**: 16 products (body wash, soaps, lotions, oral care)

### Categories Available (8 total):
- Skincare
- Makeup  
- Hair Care
- Fragrance
- Personal Care
- Men's Grooming
- Baby Care
- Wellness

## Testing the Fix

1. **Local Testing**: Run `npm run dev` - should use SQLite
2. **Production Testing**: Deploy to Vercel - should use fallback data if no PostgreSQL
3. **With Database**: Add `POSTGRES_URL` and redeploy - should use live database

## Database Schema

The application automatically creates these tables when PostgreSQL is available:
- `categories` - Product categories with metadata
- `products` - Main product information
- `product_images` - Product image references
- `orders` - Order management (future use)

## Environment Variables

### Required for Production Database:
```
POSTGRES_URL=postgresql://username:password@host:port/database
```

### Optional:
```
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_APP_NAME=kaayalife
NEXT_PUBLIC_ENV=production
```

## Current Status

✅ **Fixed**: Corrupted fallback code in products API
✅ **Fixed**: Database configuration for serverless environments
✅ **Ready**: Comprehensive fallback data system (80 products, 8 categories)
⏳ **Pending**: PostgreSQL database setup on Vercel

The application will now work on Vercel with the fallback data system, showing all 80 products and 8 categories even without a database connection.
