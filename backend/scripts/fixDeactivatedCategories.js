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

const fixDeactivatedCategories = async () => {
  try {
    console.log('Checking for categories that are inactive but should be active...\n');
    
    // Find all categories
    const allCategories = await Category.find({}).sort({ name: 1 });
    
    console.log('Current category status:');
    allCategories.forEach(cat => {
      console.log(`- ${cat.name}: Active=${cat.isActive}, ShowInMenu=${cat.showInMenu}`);
    });
    
    // Find categories that are inactive but could be reactivated
    const inactiveCategories = allCategories.filter(cat => !cat.isActive);
    
    if (inactiveCategories.length === 0) {
      console.log('\n✅ All categories are already active. No fix needed.');
    } else {
      console.log(`\n📝 Found ${inactiveCategories.length} inactive categories. Reactivating them...`);
      
      // Reactivate all categories (they can be active even if hidden from menu)
      const result = await Category.updateMany(
        { isActive: false },
        { isActive: true }
      );
      
      console.log(`✅ Reactivated ${result.modifiedCount} categories.`);
      
      // Show final status
      console.log('\nFinal status:');
      const updatedCategories = await Category.find({}).sort({ name: 1 });
      updatedCategories.forEach(cat => {
        console.log(`- ${cat.name}: Active=${cat.isActive}, ShowInMenu=${cat.showInMenu}`);
      });
    }
    
  } catch (error) {
    console.error('Error fixing categories:', error);
  }
};

const runFix = async () => {
  await connectDB();
  await fixDeactivatedCategories();
  mongoose.connection.close();
  console.log('\nDatabase connection closed');
};

runFix();
