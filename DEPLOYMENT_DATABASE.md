# Database Setup for Vercel Deployment

This guide will help you set up a persistent database for your Nykaa Clone project on Vercel.

## Current Status
- ✅ Local development uses SQLite (persistent file-based database)
- ✅ Code supports both SQLite and PostgreSQL
- ⏳ Production needs Vercel Postgres setup

## Step 1: Set up Vercel Postgres Database

### Option 1: Using Vercel Dashboard (Recommended)
1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project (`nykaa-clone`)
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose your region (preferably same as your deployment region)
7. Click **Create**

### Option 2: Using Vercel CLI
```bash
vercel env add POSTGRES_URL
# Enter the PostgreSQL connection string when prompted
```

## Step 2: Environment Variables Configuration

After creating the database, Vercel will automatically add these environment variables to your project:
- `POSTGRES_URL` - Main connection string
- `POSTGRES_PRISMA_URL` - Prisma-compatible connection string
- `POSTGRES_URL_NON_POOLING` - Non-pooling connection string
- `POSTGRES_USER` - Database username
- `POSTGRES_HOST` - Database host
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name

## Step 3: Database Migration

Your app will automatically:
1. Detect the production environment
2. Use PostgreSQL instead of SQLite
3. Create all necessary tables
4. Seed initial data on first run

## Step 4: Deploy and Test

1. **Commit and push your changes:**
```bash
git add .
git commit -m "feat: add PostgreSQL support for production"
git push origin main
```

2. **Deploy to Vercel:**
```bash
vercel --prod
```

3. **Test the deployment:**
- Visit your deployed URL
- Check that products and categories are loading
- Try the admin panel functionality
- Test the import feature

## Step 5: Database Management

### Viewing Database Contents
You can view your database contents using:
- Vercel Dashboard > Storage > [Your Database] > Data
- Any PostgreSQL client with the connection string

### Database Backup
Vercel Postgres includes automatic backups, but you can also:
1. Export data via Vercel Dashboard
2. Use `pg_dump` with the connection string

## Alternative Database Options

If you prefer other database services, you can use:

### 1. **PlanetScale** (MySQL)
- Create account at planetscale.com
- Create database
- Get connection string
- Update database-config.ts to support MySQL

### 2. **Supabase** (PostgreSQL)
- Create account at supabase.com
- Create project
- Get PostgreSQL connection string
- Use existing PostgreSQL configuration

### 3. **Neon** (PostgreSQL)
- Create account at neon.tech
- Create database
- Get connection string
- Use existing PostgreSQL configuration

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Set**
   - Check Vercel Dashboard > Settings > Environment Variables
   - Ensure all POSTGRES_* variables are present

2. **Connection Errors**
   - Verify the POSTGRES_URL format
   - Check firewall/security group settings

3. **Migration Errors**
   - Check Vercel Function logs
   - Verify database permissions

4. **Data Not Persisting**
   - Confirm using POSTGRES_URL (not SQLite)
   - Check database connection in logs

### Viewing Logs
```bash
vercel logs --follow
```

## Manual Database Setup (if needed)

If automatic migration fails, you can manually create tables using any PostgreSQL client:

```sql
-- Copy the CREATE TABLE statements from database-config.ts
-- Execute them in your PostgreSQL database
```

## Cost Considerations

- Vercel Postgres pricing: https://vercel.com/docs/storage/vercel-postgres/usage-and-pricing
- Free tier: 60 hours of database time per month
- Pro tier: $0.25/hour after free tier

## Security Notes

- Database credentials are automatically managed by Vercel
- Use environment variables, never hardcode credentials
- Enable connection pooling for better performance
- Consider read replicas for high-traffic applications

## Next Steps

After database setup:
1. Monitor database performance
2. Set up monitoring/alerts
3. Plan for database scaling
4. Implement proper backup strategy
