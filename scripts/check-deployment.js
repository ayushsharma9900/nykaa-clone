#!/usr/bin/env node

/**
 * Deployment Configuration Checker
 * Validates environment variables and database configuration for Vercel deployment
 */

const chalk = require('chalk');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(chalk.blue.bold('🚀 Nykaa Clone - Deployment Configuration Checker\n'));

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error(chalk.red('❌ Please run this script from the project root directory'));
  process.exit(1);
}

// Check package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(chalk.green(`✅ Project: ${packageJson.name} (${packageJson.version})`));

// Check environment variables
console.log(chalk.yellow('\n📋 Environment Variables:'));

const requiredEnvVars = {
  'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL || 'Not set',
  'NEXT_PUBLIC_APP_NAME': process.env.NEXT_PUBLIC_APP_NAME || 'Not set',
  'POSTGRES_URL': process.env.POSTGRES_URL || 'Not set (will use fallback)',
  'VERCEL': process.env.VERCEL || 'Not set (local environment)',
  'NODE_ENV': process.env.NODE_ENV || 'Not set'
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  const isSet = value !== 'Not set' && !value.includes('(will use fallback)');
  const icon = isSet ? '✅' : '⚠️';
  const color = isSet ? 'green' : 'yellow';
  console.log(chalk[color](`${icon} ${key}: ${value}`));
});

// Check database configuration
console.log(chalk.yellow('\n🗄️  Database Configuration:'));

const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const hasPostgresUrl = !!process.env.POSTGRES_URL;
const usePostgres = isVercel && hasPostgresUrl;

console.log(chalk.cyan(`📍 Environment: ${isVercel ? 'Production/Vercel' : 'Local Development'}`));
console.log(chalk.cyan(`🔗 Database Type: ${usePostgres ? 'PostgreSQL' : isVercel ? 'Fallback Data' : 'SQLite'}`));

if (isVercel && !hasPostgresUrl) {
  console.log(chalk.yellow('⚠️  Running in production without database - fallback system active'));
  console.log(chalk.blue('💡 To use database: Set POSTGRES_URL environment variable'));
}

// Check fallback data
console.log(chalk.yellow('\n📊 Fallback Data System:'));

const fallbackDataPath = path.join(__dirname, '..', 'src', 'lib', 'fallback-data.ts');
if (fs.existsSync(fallbackDataPath)) {
  console.log(chalk.green('✅ Fallback data file exists'));
  
  const fallbackData = fs.readFileSync(fallbackDataPath, 'utf8');
  const productsMatch = fallbackData.match(/export const fallbackProducts = \[(.*?)\];/s);
  const categoriesMatch = fallbackData.match(/export const fallbackCategories = \[(.*?)\];/s);
  
  if (productsMatch) {
    const productCount = (fallbackData.match(/{ id: 'prod-/g) || []).length;
    console.log(chalk.green(`✅ ${productCount} fallback products configured`));
  }
  
  if (categoriesMatch) {
    const categoryCount = (fallbackData.match(/id: 'cat-/g) || []).length;
    console.log(chalk.green(`✅ ${categoryCount} fallback categories configured`));
  }
} else {
  console.log(chalk.red('❌ Fallback data file not found'));
}

// Check key files
console.log(chalk.yellow('\n📁 Key Files:'));

const keyFiles = [
  'src/app/api/products/route.ts',
  'src/app/api/categories/route.ts',
  'src/lib/database-config.ts',
  'src/lib/database.ts',
  'src/lib/fallback-data.ts',
  'vercel.json'
];

keyFiles.forEach(file => {
  const exists = fs.existsSync(file);
  const icon = exists ? '✅' : '❌';
  const color = exists ? 'green' : 'red';
  console.log(chalk[color](`${icon} ${file}`));
});

// Deployment recommendations
console.log(chalk.yellow('\n🎯 Deployment Recommendations:'));

if (!process.env.POSTGRES_URL && isVercel) {
  console.log(chalk.blue('📝 1. Set up PostgreSQL database on Vercel:'));
  console.log(chalk.gray('   - Go to Vercel Dashboard > Storage > Create Database'));
  console.log(chalk.gray('   - Select PostgreSQL and connect to your project'));
  console.log(chalk.gray('   - Or manually set POSTGRES_URL environment variable'));
}

console.log(chalk.blue('📝 2. Current fallback system provides:'));
console.log(chalk.gray('   - 80 products across 5 main categories'));
console.log(chalk.gray('   - 8 categories with full metadata'));
console.log(chalk.gray('   - Search, filtering, and pagination'));

console.log(chalk.blue('📝 3. To test deployment:'));
console.log(chalk.gray('   - Deploy to Vercel (will use fallback data)'));
console.log(chalk.gray('   - Check /api/products and /api/categories endpoints'));
console.log(chalk.gray('   - Verify products and categories show on homepage'));

console.log(chalk.green.bold('\n🎉 Configuration check complete!'));

if (isVercel && !hasPostgresUrl) {
  console.log(chalk.yellow.bold('⚠️  Production deployment will use fallback data (80 products, 8 categories)'));
  console.log(chalk.blue('💡 This is working as intended until database is configured'));
} else if (usePostgres) {
  console.log(chalk.green.bold('✅ Production deployment will use PostgreSQL database'));
} else {
  console.log(chalk.green.bold('✅ Local development will use SQLite database'));
}
