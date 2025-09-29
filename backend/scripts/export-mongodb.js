const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Customer = require('../models/Customer');

// Create exports directory
const exportDir = path.join(__dirname, '../exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

async function exportCollection(Model, filename) {
  try {
    console.log(`Exporting ${filename}...`);
    const data = await Model.find({}).lean();
    
    // Convert ObjectIds to strings and format dates
    const cleanData = data.map(item => {
      const cleanItem = { ...item };
      
      // Convert _id to string
      if (cleanItem._id) {
        cleanItem.id = cleanItem._id.toString();
        delete cleanItem._id;
      }
      
      // Convert other ObjectIds to strings
      Object.keys(cleanItem).forEach(key => {
        if (cleanItem[key] && typeof cleanItem[key] === 'object' && cleanItem[key].constructor.name === 'ObjectId') {
          cleanItem[key] = cleanItem[key].toString();
        }
        
        // Handle arrays of objects (like order items)
        if (Array.isArray(cleanItem[key])) {
          cleanItem[key] = cleanItem[key].map(subItem => {
            if (typeof subItem === 'object' && subItem !== null) {
              const cleanSubItem = { ...subItem };
              Object.keys(cleanSubItem).forEach(subKey => {
                if (cleanSubItem[subKey] && typeof cleanSubItem[subKey] === 'object' && cleanSubItem[subKey].constructor.name === 'ObjectId') {
                  cleanSubItem[subKey] = cleanSubItem[subKey].toString();
                }
              });
              return cleanSubItem;
            }
            return subItem;
          });
        }
        
        // Format dates
        if (cleanItem[key] instanceof Date) {
          cleanItem[key] = cleanItem[key].toISOString();
        }
      });
      
      return cleanItem;
    });
    
    fs.writeFileSync(path.join(exportDir, `${filename}.json`), JSON.stringify(cleanData, null, 2));
    console.log(`✓ Exported ${cleanData.length} ${filename} records`);
    return cleanData.length;
  } catch (error) {
    console.error(`Error exporting ${filename}:`, error.message);
    return 0;
  }
}

async function exportAllData() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nykaa-clone';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    // Export all collections
    const results = {};
    results.users = await exportCollection(User, 'users');
    results.products = await exportCollection(Product, 'products');
    results.orders = await exportCollection(Order, 'orders');
    results.categories = await exportCollection(Category, 'categories');
    results.customers = await exportCollection(Customer, 'customers');
    
    // Create summary
    const summary = {
      exportDate: new Date().toISOString(),
      totalRecords: Object.values(results).reduce((sum, count) => sum + count, 0),
      collections: results
    };
    
    fs.writeFileSync(path.join(exportDir, 'export-summary.json'), JSON.stringify(summary, null, 2));
    
    console.log('\n✓ Export completed successfully!');
    console.log(`Total records exported: ${summary.totalRecords}`);
    console.log(`Export location: ${exportDir}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
}

exportAllData();
