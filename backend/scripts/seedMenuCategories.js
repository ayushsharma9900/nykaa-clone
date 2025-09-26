require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const sampleCategories = [
  {
    name: 'Makeup',
    slug: 'makeup',
    description: 'All makeup products including lipsticks, foundation, and more',
    menuOrder: 1,
    showInMenu: true,
    menuLevel: 0,
    isActive: true
  },
  {
    name: 'Skincare',
    slug: 'skincare',
    description: 'Complete skincare range for all skin types',
    menuOrder: 2,
    showInMenu: true,
    menuLevel: 0,
    isActive: true
  },
  {
    name: 'Haircare',
    slug: 'haircare',
    description: 'Hair products for healthy and beautiful hair',
    menuOrder: 3,
    showInMenu: true,
    menuLevel: 0,
    isActive: true
  },
  {
    name: 'Fragrance',
    slug: 'fragrance',
    description: 'Premium fragrances and perfumes',
    menuOrder: 4,
    showInMenu: true,
    menuLevel: 0,
    isActive: true
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Personal care essentials',
    menuOrder: 5,
    showInMenu: true,
    menuLevel: 0,
    isActive: true
  },
  {
    name: 'Men',
    slug: 'men',
    description: 'Grooming products for men',
    menuOrder: 6,
    showInMenu: true,
    menuLevel: 0,
    isActive: true
  },
  {
    name: 'Bath & Body',
    slug: 'bath-body',
    description: 'Body care products and bath essentials',
    menuOrder: 7,
    showInMenu: false,  // This one is hidden to test visibility toggle
    menuLevel: 0,
    isActive: true
  }
];

const seedCategories = async () => {
  try {
    // Clear existing categories (optional)
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert sample categories
    const categories = await Category.insertMany(sampleCategories);
    console.log(`Seeded ${categories.length} categories successfully`);
    
    // Display the created categories
    categories.forEach(category => {
      console.log(`- ${category.name} (Order: ${category.menuOrder}, Visible: ${category.showInMenu})`);
    });

  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedCategories();
  mongoose.connection.close();
  console.log('Database connection closed');
};

runSeed();
