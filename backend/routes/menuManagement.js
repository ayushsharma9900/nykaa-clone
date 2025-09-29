const express = require('express');
const { protect } = require('../middleware/auth');
const { query: dbQuery } = require('../config/mysql-database');

const router = express.Router();
// Don't protect all routes - menu-items should be public

// @desc    Get menu items (public endpoint for frontend menu)
// @route   GET /api/menu-management/menu-items
// @access  Public
router.get('/menu-items', async (req, res, next) => {
  try {
    const showAll = req.query.showAll === 'true';
    
    let sql = `
      SELECT 
        id as _id,
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
    `;
    
    const params = [];
    
    if (!showAll) {
      sql += ' WHERE showInMenu = ? AND isActive = ?';
      params.push(true, true);
    }
    
    sql += ' ORDER BY menuOrder ASC, menuLevel ASC, name ASC';
    
    const categories = await dbQuery(sql, params);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    next(error);
  }
});

// Protected routes below
router.use(protect);

// @desc    Sync categories from main categories table
// @route   POST /api/menu-management/sync-categories
// @access  Private
router.post('/sync-categories', async (req, res, next) => {
  try {
    // Get all categories from the main categories table
    const sql = `
      SELECT 
        id,
        name,
        slug,
        description,
        image,
        isActive,
        sortOrder,
        createdAt,
        updatedAt
      FROM categories
      ORDER BY sortOrder ASC, name ASC
    `;
    
    const categories = await dbQuery(sql);
    
    // Update menu-related fields for all categories
    const updateSql = `
      UPDATE categories 
      SET 
        showInMenu = ?,
        menuOrder = sortOrder,
        menuLevel = 0
      WHERE isActive = ?
    `;
    
    await dbQuery(updateSql, [true, true]);
    
    res.json({
      success: true,
      message: `Successfully synced ${categories.length} categories`,
      data: {
        totalCategories: categories.length,
        syncedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error syncing categories:', error);
    next(error);
  }
});

router.get('/', async (req, res) => {
  res.json({ success: true, data: [] });
});

module.exports = router;
