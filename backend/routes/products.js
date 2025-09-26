const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');
const Product = require('../models/Product');

const router = express.Router();

// All routes are protected
router.use(protect);

// Meta routes (must come before parameterized routes)
// @desc    Get product categories
// @route   GET /api/products/meta/categories
// @access  Private
router.get('/meta/categories', async (req, res, next) => {
  try {
    // Get dynamic categories from Category collection
    const Category = require('../models/Category');
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    
    // Get product count for each category
    const categoryStats = await Product.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    const categoriesWithStats = categories.map(category => {
      const stats = categoryStats.find(stat => stat._id === category.name) || { count: 0, totalStock: 0, avgPrice: 0 };
      return {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        isActive: category.isActive,
        productCount: stats.count,
        totalStock: stats.totalStock,
        averagePrice: stats.avgPrice ? parseFloat(stats.avgPrice.toFixed(2)) : 0
      };
    });

    res.json({
      success: true,
      data: categoriesWithStats
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private
router.get('/alerts/low-stock', [
  query('threshold').optional().isInt({ min: 1 }).withMessage('Threshold must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const threshold = parseInt(req.query.threshold) || 10;
    const limit = parseInt(req.query.limit) || 20;

    const lowStockProducts = await Product.find({
      isActive: true,
      stock: { $lte: threshold, $gt: 0 }
    })
    .sort({ stock: 1 })
    .limit(limit)
    .select('name sku stock category price');

    res.json({
      success: true,
      data: lowStockProducts,
      threshold
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all products for admin (including inactive)
// @route   GET /api/products/admin/all
// @access  Private (admin and manager only)
router.get('/admin/all', authorize('manager', 'admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object (don't filter by isActive for admin)
    const filter = {};
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.status === 'active') {
      filter.isActive = true;
    } else if (req.query.status === 'inactive') {
      filter.isActive = false;
    }
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get products
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all products with pagination, filtering, and search
// @route   GET /api/products
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('minPrice').optional().isNumeric().withMessage('Min price must be a number'),
  query('maxPrice').optional().isNumeric().withMessage('Max price must be a number'),
  query('inStock').optional().isBoolean().withMessage('In stock must be boolean'),
  query('sortBy').optional().isIn(['name', 'price', 'totalSold', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    if (req.query.inStock === 'true') {
      filter.stock = { $gt: 0 };
    } else if (req.query.inStock === 'false') {
      filter.stock = { $eq: 0 };
    }
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Build sort object
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Get products
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// BULK OPERATIONS (must come before parameterized routes)

// @desc    Bulk update product status
// @route   PATCH /api/products/bulk/status
// @access  Private (manager and admin only)
router.patch('/bulk/status', authorize('manager', 'admin'), [
  body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required'),
  body('isActive').isBoolean().withMessage('isActive must be boolean')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { productIds, isActive } = req.body;

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { isActive }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} products ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk delete products (soft delete)
// @route   DELETE /api/products/bulk
// @access  Private (admin only)
router.delete('/bulk', authorize('admin'), [
  body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { productIds } = req.body;

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { isActive: false }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} products deleted successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk update product inventory
// @route   PATCH /api/products/bulk/inventory
// @access  Private (manager and admin only)
router.patch('/bulk/inventory', authorize('manager', 'admin'), [
  body('updates').isArray({ min: 1 }).withMessage('Updates array is required'),
  body('updates.*.productId').isMongoId().withMessage('Valid product ID is required'),
  body('updates.*.stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { updates } = req.body;
    let successCount = 0;
    let failureCount = 0;
    const results = [];

    for (const update of updates) {
      try {
        const product = await Product.findByIdAndUpdate(
          update.productId,
          { stock: update.stock },
          { new: true, runValidators: true }
        );

        if (product) {
          successCount++;
          results.push({
            productId: update.productId,
            success: true,
            name: product.name,
            newStock: product.stock
          });
        } else {
          failureCount++;
          results.push({
            productId: update.productId,
            success: false,
            error: 'Product not found'
          });
        }
      } catch (error) {
        failureCount++;
        results.push({
          productId: update.productId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk inventory update completed: ${successCount} successful, ${failureCount} failed`,
      data: {
        successCount,
        failureCount,
        results
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk change product category
// @route   PATCH /api/products/bulk/category
// @access  Private (manager and admin only)
router.patch('/bulk/category', authorize('manager', 'admin'), [
  body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required'),
  body('category').trim().notEmpty().withMessage('Category is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { productIds, category } = req.body;

    // Check if category exists and is active
    const Category = require('../models/Category');
    const categoryExists = await Category.findOne({ name: category, isActive: true });
    if (!categoryExists) {
      // Get list of available categories for helpful error message
      const availableCategories = await Category.find({ isActive: true }, 'name').lean();
      const categoryNames = availableCategories.map(cat => cat.name).join(', ');
      
      return res.status(400).json({
        success: false,
        message: `Invalid category "${category}". Category does not exist or is inactive. Available categories: ${categoryNames}`
      });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { category }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} products moved to ${category} category successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        category
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk update product prices
// @route   PATCH /api/products/bulk/pricing
// @access  Private (manager and admin only)
router.patch('/bulk/pricing', authorize('manager', 'admin'), [
  body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required'),
  body('priceChange').isObject().withMessage('Price change configuration is required'),
  body('priceChange.type').isIn(['percentage', 'fixed']).withMessage('Price change type must be percentage or fixed'),
  body('priceChange.value').isNumeric().withMessage('Price change value must be numeric')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { productIds, priceChange } = req.body;
    let successCount = 0;
    let failureCount = 0;
    const results = [];

    const products = await Product.find({ _id: { $in: productIds } });

    for (const product of products) {
      try {
        let newPrice;
        let newCostPrice;

        if (priceChange.type === 'percentage') {
          const multiplier = 1 + (parseFloat(priceChange.value) / 100);
          newPrice = Math.round(product.price * multiplier * 100) / 100;
          newCostPrice = Math.round(product.costPrice * multiplier * 100) / 100;
        } else {
          newPrice = product.price + parseFloat(priceChange.value);
          newCostPrice = product.costPrice + parseFloat(priceChange.value);
        }

        // Ensure prices don't go below 0
        newPrice = Math.max(0, newPrice);
        newCostPrice = Math.max(0, newCostPrice);

        await Product.findByIdAndUpdate(
          product._id,
          { price: newPrice, costPrice: newCostPrice },
          { runValidators: true }
        );

        successCount++;
        results.push({
          productId: product._id,
          success: true,
          name: product.name,
          oldPrice: product.price,
          newPrice,
          oldCostPrice: product.costPrice,
          newCostPrice
        });
      } catch (error) {
        failureCount++;
        results.push({
          productId: product._id,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk pricing update completed: ${successCount} successful, ${failureCount} failed`,
      data: {
        successCount,
        failureCount,
        results,
        priceChange
      }
    });
  } catch (error) {
    next(error);
  }
});

// UPLOAD ROUTES (must come before parameterized routes)

// @desc    Upload single product image
// @route   POST /api/products/upload/image
// @access  Private (manager and admin only)
router.post('/upload/image', authorize('manager', 'admin'), (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname
      }
    });
  });
});

// @desc    Upload multiple product images
// @route   POST /api/products/upload/images
// @access  Private (manager and admin only)
router.post('/upload/images', authorize('manager', 'admin'), (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }
    
    const uploadedImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname
    }));
    
    res.json({
      success: true,
      message: `${req.files.length} images uploaded successfully`,
      data: uploadedImages
    });
  });
});

// PARAMETERIZED ROUTES (must come after specific routes)

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (manager and admin only)
router.post('/', authorize('manager', 'admin'), [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('category').trim().notEmpty().withMessage('Product category is required'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('costPrice').isNumeric().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('weight').optional().isNumeric().withMessage('Weight must be a number'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if category exists and is active
    const Category = require('../models/Category');
    const category = await Category.findOne({ name: req.body.category, isActive: true });
    if (!category) {
      // Get list of available categories for helpful error message
      const availableCategories = await Category.find({ isActive: true }, 'name').lean();
      const categoryNames = availableCategories.map(cat => cat.name).join(', ');
      
      return res.status(400).json({
        success: false,
        message: `Invalid category "${req.body.category}". Category does not exist or is inactive. Available categories: ${categoryNames}`
      });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: req.body.sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (manager and admin only)
router.put('/:id', authorize('manager', 'admin'), [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Product description cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('price').optional().isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('costPrice').optional().isNumeric().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('sku').optional().trim().notEmpty().withMessage('SKU cannot be empty'),
  body('weight').optional().isNumeric().withMessage('Weight must be a number'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('images').optional().isArray().withMessage('Images must be an array')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if category exists and is active (if category is being updated)
    if (req.body.category) {
      const Category = require('../models/Category');
      const category = await Category.findOne({ name: req.body.category, isActive: true });
      if (!category) {
        // Get list of available categories for helpful error message
        const availableCategories = await Category.find({ isActive: true }, 'name').lean();
        const categoryNames = availableCategories.map(cat => cat.name).join(', ');
        
        return res.status(400).json({
          success: false,
          message: `Invalid category "${req.body.category}". Category does not exist or is inactive. Available categories: ${categoryNames}`
        });
      }
    }

    // Check if SKU already exists (excluding current product)
    if (req.body.sku) {
      const existingProduct = await Product.findOne({ 
        sku: req.body.sku,
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private (staff and above)
router.patch('/:id/stock', authorize('staff', 'manager', 'admin'), [
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: req.body.stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product stock updated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Toggle product active status
// @route   PATCH /api/products/:id/toggle-status
// @access  Private (manager and admin only)
router.patch('/:id/toggle-status', authorize('manager', 'admin'), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: product
    });
  } catch (error) {
    next(error);
  }
});



// @desc    Delete product (soft delete by setting isActive to false)
// @route   DELETE /api/products/:id
// @access  Private (admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    console.log('Delete request for product ID:', req.params.id);
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, runValidators: false } // Don't run validators for delete operation
    );

    if (!product) {
      console.log('Product not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('Product deleted successfully:', product.name);
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error.message);
    console.error('Error details:', error);
    next(error);
  }
});


module.exports = router;
