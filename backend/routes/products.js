const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { query: dbQuery } = require('../config/mysql-database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Helper function to get product images
const getProductImages = async (productId) => {
  const images = await dbQuery(
    'SELECT url, alt, sortOrder FROM product_images WHERE productId = ? ORDER BY sortOrder ASC',
    [productId]
  );
  return images.map(img => img.url);
};

// @desc    Get all products for admin (including inactive)
// @route   GET /api/products/admin/all
// @access  Private (admin and manager only)
router.get('/admin/all', protect, authorize('manager', 'admin'), [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('category').optional().isString().withMessage('Category must be a string')
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
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (req.query.status === 'active') {
      whereClause += ' AND isActive = ?';
      params.push(1); // Use 1 instead of true for MySQL
    } else if (req.query.status === 'inactive') {
      whereClause += ' AND isActive = ?';
      params.push(0); // Use 0 instead of false for MySQL
    }
    
    if (req.query.category) {
      // Handle both category name and slug
      const categoryParam = req.query.category;
      
      // Map common slugs to category names
      const slugToNameMap = {
        'makeup': 'Makeup',
        'skincare': 'Skincare', 
        'hair-care': 'Hair Care',
        'fragrance': 'Fragrance',
        'personal-care': 'Personal Care',
        'mens-grooming': "Men's Grooming",
        'baby-care': 'Baby Care',
        'wellness': 'Wellness'
      };
      
      const categoryName = slugToNameMap[categoryParam.toLowerCase()] || categoryParam;
      whereClause += ' AND category = ?';
      params.push(categoryName);
    }
    
    if (req.query.search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get products
    const sql = `
      SELECT 
        id,
        name,
        description,
        category,
        price,
        costPrice,
        stock,
        sku,
        isActive,
        tags,
        weight,
        dimensions,
        totalSold,
        averageRating,
        reviewCount,
        createdAt,
        updatedAt
      FROM products 
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const products = await dbQuery(sql, [...params, limit, offset]);

    // Get images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await getProductImages(product.id);
        return {
          ...product,
          images
        };
      })
    );

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const [countResult] = await dbQuery(countSql, params);
    const totalProducts = countResult.total;
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: productsWithImages,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    next(error);
  }
});

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private
router.get('/alerts/low-stock', protect, async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const limit = parseInt(req.query.limit) || 20;

    const products = await dbQuery(`
      SELECT 
        id,
        name,
        sku,
        stock,
        category,
        isActive
      FROM products 
      WHERE stock <= ? AND isActive = 1
      ORDER BY stock ASC
      LIMIT ?
    `, [threshold, limit]);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    next(error);
  }
});

// @desc    Get product categories
// @route   GET /api/products/meta/categories
// @access  Private
router.get('/meta/categories', protect, async (req, res, next) => {
  try {
    const categories = await dbQuery(`
      SELECT DISTINCT category as name, COUNT(*) as productCount
      FROM products 
      WHERE isActive = 1
      GROUP BY category
      ORDER BY category ASC
    `);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    next(error);
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (admin and manager only)
router.post('/', protect, authorize('manager', 'admin'), [
  body('name').isString().isLength({ min: 1, max: 255 }).withMessage('Name must be 1-255 characters'),
  body('description').isString().withMessage('Description must be a string'),
  body('category').isString().isLength({ min: 1, max: 100 }).withMessage('Category must be 1-100 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('sku').isString().isLength({ min: 1, max: 50 }).withMessage('SKU must be 1-50 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('tags').optional().custom((value) => {
    if (typeof value === 'string' || Array.isArray(value)) {
      return true;
    }
    throw new Error('Tags must be a string or array');
  }),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('dimensions').optional().isString().withMessage('Dimensions must be a string'),
  body('averageRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('reviewCount').optional().isInt({ min: 0 }).withMessage('Review count must be a non-negative integer'),
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

    const {
      name, description, category, price, costPrice = 0, stock, sku,
      isActive = true, tags = [], weight = 0, dimensions = '', images = [],
      averageRating = 0, reviewCount = 0
    } = req.body;

    // Process tags - convert to JSON string for storage
    let tagsJson = '';
    if (Array.isArray(tags)) {
      tagsJson = JSON.stringify(tags.filter(tag => tag && tag.trim().length > 0));
    } else if (typeof tags === 'string' && tags.trim()) {
      tagsJson = JSON.stringify([tags.trim()]);
    } else {
      tagsJson = JSON.stringify([]);
    }

    // Insert product
    const insertResult = await dbQuery(`
      INSERT INTO products (
        name, description, category, price, costPrice, stock, sku,
        isActive, tags, weight, dimensions, averageRating, reviewCount, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [name, description, category, price, costPrice, stock, sku, isActive, tagsJson, weight, dimensions, averageRating, reviewCount]);

    const productId = insertResult.insertId;

    // Insert images if provided
    if (images.length > 0) {
      const imageInserts = images.map((url, index) => [
        productId, url, `${name} - Image ${index + 1}`, index + 1
      ]);
      
      // Use proper bulk insert syntax for mysql2
      const placeholders = imageInserts.map(() => '(?, ?, ?, ?)').join(', ');
      const flatValues = imageInserts.flat();
      
      await dbQuery(`
        INSERT INTO product_images (productId, url, alt, sortOrder)
        VALUES ${placeholders}
      `, flatValues);
    }

    // Fetch and return created product
    const [createdProduct] = await dbQuery(`
      SELECT 
        id, name, description, category, price, costPrice, stock, sku,
        isActive, tags, weight, dimensions, totalSold, averageRating,
        reviewCount, createdAt, updatedAt
      FROM products 
      WHERE id = ?
    `, [productId]);

    // Get product images
    const productImages = await getProductImages(productId);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        ...createdProduct,
        images: productImages
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'A product with this SKU already exists'
      });
    }
    next(error);
  }
});

// @desc    Get all products (public endpoint for homepage)
// @route   GET /api/products
// @access  Private
router.get('/', protect, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('inStock').optional().isBoolean().withMessage('inStock must be boolean'),
  query('sortBy').optional().isIn(['name', 'price', 'createdAt', 'totalSold', 'averageRating']).withMessage('Invalid sort field'),
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
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Build WHERE clause (only active products for public)
    let whereClause = 'WHERE isActive = ?';
    const params = [1]; // Use 1 instead of true for MySQL
    
    if (req.query.category) {
      // Handle both category name and slug
      const categoryParam = req.query.category;
      
      // Map common slugs to category names
      const slugToNameMap = {
        'makeup': 'Makeup',
        'skincare': 'Skincare', 
        'hair-care': 'Hair Care',
        'fragrance': 'Fragrance',
        'personal-care': 'Personal Care',
        'mens-grooming': "Men's Grooming",
        'baby-care': 'Baby Care',
        'wellness': 'Wellness'
      };
      
      const categoryName = slugToNameMap[categoryParam.toLowerCase()] || categoryParam;
      whereClause += ' AND category = ?';
      params.push(categoryName);
    }
    
    if (req.query.search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (req.query.minPrice) {
      whereClause += ' AND price >= ?';
      params.push(parseFloat(req.query.minPrice));
    }
    
    if (req.query.maxPrice) {
      whereClause += ' AND price <= ?';
      params.push(parseFloat(req.query.maxPrice));
    }
    
    if (req.query.inStock === 'true') {
      whereClause += ' AND stock > 0';
    }

    // Build ORDER BY clause
    let orderBy = 'ORDER BY createdAt DESC';
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder || 'desc';
      orderBy = `ORDER BY ${req.query.sortBy} ${sortOrder.toUpperCase()}`;
    }

    // Get products
    const sql = `
      SELECT 
        id,
        name,
        description,
        category,
        price,
        costPrice,
        stock,
        sku,
        isActive,
        tags,
        weight,
        dimensions,
        totalSold,
        averageRating,
        reviewCount,
        createdAt,
        updatedAt
      FROM products 
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const finalParams = [...params, limit, offset];
    console.log('🔍 SQL Query:', sql);
    console.log('🔍 Parameters:', finalParams);
    const products = await dbQuery(sql, finalParams);

    // Get images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await getProductImages(product.id);
        return {
          ...product,
          images
        };
      })
    );

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const [countResult] = await dbQuery(countSql, params); // params don't include limit/offset
    const totalProducts = countResult.total;
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: productsWithImages,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    next(error);
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (admin and manager only)
router.put('/:id', protect, authorize('manager', 'admin'), [
  body('name').optional().isString().isLength({ min: 1, max: 255 }).withMessage('Name must be 1-255 characters'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('category').optional().isString().isLength({ min: 1, max: 100 }).withMessage('Category must be 1-100 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('sku').optional().isString().isLength({ min: 1, max: 50 }).withMessage('SKU must be 1-50 characters'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('tags').optional().custom((value) => {
    if (typeof value === 'string' || Array.isArray(value)) {
      return true;
    }
    throw new Error('Tags must be a string or array');
  }),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('dimensions').optional().isString().withMessage('Dimensions must be a string'),
  body('averageRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  body('reviewCount').optional().isInt({ min: 0 }).withMessage('Review count must be a non-negative integer'),
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

    const productId = req.params.id;
    
    // Check if product exists
    const [existingProduct] = await dbQuery(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    );

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = [
      'name', 'description', 'category', 'price', 'costPrice', 
      'stock', 'sku', 'isActive', 'tags', 'weight', 'dimensions',
      'averageRating', 'reviewCount'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        
        // Handle tags specially - convert to JSON string
        if (field === 'tags') {
          const tags = req.body[field];
          let tagsJson = '';
          if (Array.isArray(tags)) {
            tagsJson = JSON.stringify(tags.filter(tag => tag && tag.trim().length > 0));
          } else if (typeof tags === 'string' && tags.trim()) {
            tagsJson = JSON.stringify([tags.trim()]);
          } else {
            tagsJson = JSON.stringify([]);
          }
          updateValues.push(tagsJson);
        } else {
          updateValues.push(req.body[field]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    // Add updatedAt timestamp
    updateFields.push('updatedAt = NOW()');
    updateValues.push(productId);

    const updateSql = `
      UPDATE products 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await dbQuery(updateSql, updateValues);

    // Handle image updates if provided
    if (req.body.images && Array.isArray(req.body.images)) {
      // Delete existing images
      await dbQuery('DELETE FROM product_images WHERE productId = ?', [productId]);
      
      // Insert new images if any provided
      const validImages = req.body.images.filter(url => url && typeof url === 'string' && url.trim().length > 0);
      if (validImages.length > 0) {
        const imageInserts = validImages.map((url, index) => [
          productId, url.trim(), `${req.body.name || 'Product'} - Image ${index + 1}`, index + 1
        ]);
        
        // Use proper bulk insert syntax for mysql2
        const placeholders = imageInserts.map(() => '(?, ?, ?, ?)').join(', ');
        const flatValues = imageInserts.flat();
        
        await dbQuery(`
          INSERT INTO product_images (productId, url, alt, sortOrder)
          VALUES ${placeholders}
        `, flatValues);
      }
    }

    // Fetch and return updated product
    const [updatedProduct] = await dbQuery(`
      SELECT 
        id,
        name,
        description,
        category,
        price,
        costPrice,
        stock,
        sku,
        isActive,
        tags,
        weight,
        dimensions,
        totalSold,
        averageRating,
        reviewCount,
        createdAt,
        updatedAt
      FROM products 
      WHERE id = ?
    `, [productId]);

    // Get product images
    const images = await getProductImages(updatedProduct.id);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: {
        ...updatedProduct,
        images
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'A product with this SKU already exists'
      });
    }
    next(error);
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const [product] = await dbQuery(`
      SELECT 
        id,
        name,
        description,
        category,
        price,
        costPrice,
        stock,
        sku,
        isActive,
        tags,
        weight,
        dimensions,
        totalSold,
        averageRating,
        reviewCount,
        createdAt,
        updatedAt
      FROM products 
      WHERE id = ?
    `, [req.params.id]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get product images
    const images = await getProductImages(product.id);
    
    res.json({
      success: true,
      data: {
        ...product,
        images
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    next(error);
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const [existingProduct] = await dbQuery(
      'SELECT id, name FROM products WHERE id = ?',
      [productId]
    );

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product images first
    await dbQuery('DELETE FROM product_images WHERE productId = ?', [productId]);
    
    // Delete the product
    await dbQuery('DELETE FROM products WHERE id = ?', [productId]);
    
    res.json({
      success: true,
      message: `Product "${existingProduct.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    next(error);
  }
});

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private (admin and manager only)
router.patch('/:id/stock', protect, authorize('manager', 'admin'), [
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

    const productId = req.params.id;
    const { stock } = req.body;
    
    // Check if product exists
    const [existingProduct] = await dbQuery(
      'SELECT id, name FROM products WHERE id = ?',
      [productId]
    );

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update stock
    await dbQuery(
      'UPDATE products SET stock = ?, updatedAt = NOW() WHERE id = ?',
      [stock, productId]
    );
    
    res.json({
      success: true,
      message: `Stock updated to ${stock} for "${existingProduct.name}"`
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    next(error);
  }
});

// @desc    Bulk update product inventory
// @route   PATCH /api/products/bulk/inventory
// @access  Private (admin and manager only)
router.patch('/bulk/inventory', protect, authorize('manager', 'admin'), [
  body('updates').isArray({ min: 1 }).withMessage('updates must be a non-empty array'),
  body('updates.*.productId').isString().withMessage('productId must be a string'),
  body('updates.*.stock').isInt({ min: 0 }).withMessage('stock must be a non-negative integer')
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
    
    // Prepare bulk update query
    const cases = updates.map(() => 'WHEN id = ? THEN ?').join(' ');
    const productIds = updates.map(u => u.productId);
    const values = updates.flatMap(u => [u.productId, u.stock]);
    
    const placeholders = productIds.map(() => '?').join(',');
    const result = await dbQuery(`
      UPDATE products 
      SET stock = CASE ${cases} END,
          updatedAt = NOW()
      WHERE id IN (${placeholders})
    `, [...values, ...productIds]);
    
    res.json({
      success: true,
      message: `${result.affectedRows} products inventory updated successfully`
    });
  } catch (error) {
    console.error('Error bulk updating inventory:', error);
    next(error);
  }
});

// @desc    Bulk update product status (activate/deactivate)
// @route   PATCH /api/products/bulk/status
// @access  Private (admin and manager only)
router.patch('/bulk/status', protect, authorize('manager', 'admin'), [
  body('productIds').isArray({ min: 1 }).withMessage('productIds must be a non-empty array'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
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
    
    // Update products
    const placeholders = productIds.map(() => '?').join(',');
    const result = await dbQuery(
      `UPDATE products SET isActive = ?, updatedAt = NOW() WHERE id IN (${placeholders})`,
      [isActive, ...productIds]
    );
    
    res.json({
      success: true,
      message: `${result.affectedRows} products ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error bulk updating product status:', error);
    next(error);
  }
});

// @desc    Bulk delete products
// @route   DELETE /api/products/bulk
// @access  Private (admin only)
router.delete('/bulk', protect, authorize('admin'), [
  body('productIds').isArray({ min: 1 }).withMessage('productIds must be a non-empty array')
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
    
    // Delete product images first
    const placeholders = productIds.map(() => '?').join(',');
    await dbQuery(`DELETE FROM product_images WHERE productId IN (${placeholders})`, productIds);
    
    // Delete products
    const result = await dbQuery(
      `DELETE FROM products WHERE id IN (${placeholders})`,
      productIds
    );
    
    res.json({
      success: true,
      message: `${result.affectedRows} products deleted successfully`
    });
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    next(error);
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../..', 'public', 'images', 'uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Please upload only image files'), false);
    }
  }
});

// @desc    Upload single product image
// @route   POST /api/products/upload/image
// @access  Private (admin and manager only)
router.post('/upload/image', protect, authorize('manager', 'admin'), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imageUrl = `/images/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    next(error);
  }
});

// @desc    Upload multiple product images
// @route   POST /api/products/upload/images
// @access  Private (admin and manager only)
router.post('/upload/images', protect, authorize('manager', 'admin'), upload.array('images', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadedImages = req.files.map(file => ({
      url: `/images/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));
    
    res.json({
      success: true,
      data: uploadedImages,
      message: `${uploadedImages.length} images uploaded successfully`
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    next(error);
  }
});

// @desc    Bulk change product category
// @route   PATCH /api/products/bulk/category
// @access  Private (admin and manager only)
router.patch('/bulk/category', protect, authorize('manager', 'admin'), [
  body('productIds').isArray({ min: 1 }).withMessage('productIds must be a non-empty array'),
  body('category').isString().isLength({ min: 1, max: 100 }).withMessage('Category must be 1-100 characters')
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
    
    // Update products category
    const placeholders = productIds.map(() => '?').join(',');
    const result = await dbQuery(
      `UPDATE products SET category = ?, updatedAt = NOW() WHERE id IN (${placeholders})`,
      [category, ...productIds]
    );
    
    res.json({
      success: true,
      message: `${result.affectedRows} products updated to category "${category}" successfully`
    });
  } catch (error) {
    console.error('Error bulk updating product category:', error);
    next(error);
  }
});

// @desc    Bulk update product pricing
// @route   PATCH /api/products/bulk/pricing
// @access  Private (admin and manager only)
router.patch('/bulk/pricing', protect, authorize('manager', 'admin'), [
  body('productIds').isArray({ min: 1 }).withMessage('productIds must be a non-empty array'),
  body('priceChange.type').isIn(['percentage', 'fixed']).withMessage('Price change type must be percentage or fixed'),
  body('priceChange.value').isFloat().withMessage('Price change value must be a number')
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
    const { type, value } = priceChange;
    
    let updateExpression;
    let params;
    
    if (type === 'percentage') {
      // Increase/decrease by percentage
      const multiplier = 1 + (value / 100);
      updateExpression = 'price = ROUND(price * ?, 2)';
      params = [multiplier, ...productIds];
    } else {
      // Fixed amount increase/decrease
      updateExpression = 'price = GREATEST(0, price + ?)';
      params = [value, ...productIds];
    }
    
    const placeholders = productIds.map(() => '?').join(',');
    const result = await dbQuery(
      `UPDATE products SET ${updateExpression}, updatedAt = NOW() WHERE id IN (${placeholders})`,
      params
    );
    
    res.json({
      success: true,
      message: `${result.affectedRows} products pricing updated successfully`
    });
  } catch (error) {
    console.error('Error bulk updating product pricing:', error);
    next(error);
  }
});

module.exports = router;
