const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { query: dbQuery } = require('../config/mysql-database');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all categories for menu (active only)
// @route   GET /api/categories/menu
// @access  Public (but protected by middleware)
router.get('/menu', [
  query('showAll').optional().isBoolean().withMessage('showAll must be boolean')
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

    console.log('🔍 Menu items request - showAll:', req.query.showAll);

    // Build SQL query
    const sql = `
      SELECT 
        id,
        name,
        slug,
        description,
        image,
        isActive,
        sortOrder,
        menuOrder,
        showInMenu,
        menuLevel,
        parentId,
        createdAt,
        updatedAt,
        (SELECT COUNT(*) FROM products WHERE category = categories.name) as productCount
      FROM categories
     WHERE showInMenu = ? ORDER BY menuOrder ASC, menuLevel ASC, name ASC
    `;
    
    console.log('📋 Using SQL: ', sql);
    console.log('📋 With params:', [ true ]);

    const categories = await dbQuery(sql, [true]);
    
    console.log(`📊 Found ${categories.length} categories`);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    next(error);
  }
});

// @desc    Get all categories with pagination and filtering
// @route   GET /api/categories
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('active').optional().isBoolean().withMessage('Active must be boolean'),
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
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (req.query.active !== undefined) {
      whereClause += ' AND isActive = ?';
      params.push(req.query.active === 'true');
    }
    
    if (req.query.search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get categories with product counts
    const sql = `
      SELECT 
        id,
        name,
        slug,
        description,
        image,
        isActive,
        sortOrder,
        menuOrder,
        showInMenu,
        menuLevel,
        parentId,
        createdAt,
        updatedAt,
        (SELECT COUNT(*) FROM products WHERE category = categories.name AND isActive = 1) as productCount
      FROM categories 
      ${whereClause}
      ORDER BY sortOrder ASC, createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const categories = await dbQuery(sql, [...params, limit, offset]);

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM categories ${whereClause}`;
    const [countResult] = await dbQuery(countSql, params);
    const totalCategories = countResult.total;
    const totalPages = Math.ceil(totalCategories / limit);

    res.json({
      success: true,
      data: categories,
      pagination: {
        currentPage: page,
        totalPages,
        totalCategories,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    next(error);
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        id,
        name,
        slug,
        description,
        image,
        isActive,
        sortOrder,
        menuOrder,
        showInMenu,
        menuLevel,
        parentId,
        createdAt,
        updatedAt,
        (SELECT COUNT(*) FROM products WHERE category = categories.name AND isActive = 1) as productCount
      FROM categories 
      WHERE id = ?
    `;

    const [category] = await dbQuery(sql, [req.params.id]);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    next(error);
  }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (admin and manager only)
router.post('/', authorize('manager', 'admin'), [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('slug').trim().notEmpty().withMessage('Category slug is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('sortOrder').optional().isInt().withMessage('sortOrder must be integer'),
  body('menuOrder').optional().isInt().withMessage('menuOrder must be integer'),
  body('showInMenu').optional().isBoolean().withMessage('showInMenu must be boolean'),
  body('menuLevel').optional().isInt().withMessage('menuLevel must be integer')
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

    const { v4: uuidv4 } = require('uuid');
    const categoryId = uuidv4();

    const {
      name,
      slug,
      description,
      image,
      isActive = true,
      sortOrder = 0,
      menuOrder = 0,
      showInMenu = true,
      menuLevel = 0,
      parentId
    } = req.body;

    // Check if category name or slug already exists
    const existingCategory = await dbQuery(
      'SELECT id FROM categories WHERE name = ? OR slug = ?',
      [name, slug]
    );

    if (existingCategory.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category name or slug already exists'
      });
    }

    const sql = `
      INSERT INTO categories (
        id, name, slug, description, image, isActive, 
        sortOrder, menuOrder, showInMenu, menuLevel, parentId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await dbQuery(sql, [
      categoryId, name, slug, description, image, isActive,
      sortOrder, menuOrder, showInMenu, menuLevel, parentId
    ]);

    // Get the created category
    const [newCategory] = await dbQuery(
      'SELECT * FROM categories WHERE id = ?',
      [categoryId]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    next(error);
  }
});

// @desc    Get all categories for admin (including inactive)
// @route   GET /api/categories/admin/all
// @access  Private (admin and manager only)
router.get('/admin/all', authorize('manager', 'admin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const categories = await dbQuery(`
      SELECT 
        id,
        name,
        slug,
        description,
        image,
        isActive,
        sortOrder,
        menuOrder,
        showInMenu,
        menuLevel,
        parentId,
        createdAt,
        updatedAt,
        (SELECT COUNT(*) FROM products WHERE category = categories.name) as productCount,
        (SELECT COUNT(*) FROM products WHERE category = categories.name AND isActive = 1) as activeProductCount
      FROM categories 
      ORDER BY sortOrder ASC, createdAt DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const [countResult] = await dbQuery('SELECT COUNT(*) as total FROM categories');
    const totalCategories = countResult.total;
    const totalPages = Math.ceil(totalCategories / limit);

    res.json({
      success: true,
      data: categories,
      pagination: {
        currentPage: page,
        totalPages,
        totalCategories,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    next(error);
  }
});

// @desc    Get category statistics
// @route   GET /api/categories/meta/stats
// @access  Private
router.get('/meta/stats', async (req, res, next) => {
  try {
    const [statsResult] = await dbQuery(`
      SELECT 
        COUNT(*) as totalCategories,
        SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as activeCategories,
        SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as inactiveCategories
      FROM categories
    `);

    const [productStatsResult] = await dbQuery(`
      SELECT 
        COUNT(*) as totalProducts,
        SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as totalActiveProducts
      FROM products
    `);

    res.json({
      success: true,
      data: {
        totalCategories: statsResult.totalCategories || 0,
        activeCategories: statsResult.activeCategories || 0,
        inactiveCategories: statsResult.inactiveCategories || 0,
        totalProducts: productStatsResult.totalProducts || 0,
        totalActiveProducts: productStatsResult.totalActiveProducts || 0
      }
    });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    next(error);
  }
});

module.exports = router;
