const express = require('express');
const { protect } = require('../middleware/auth');
const { query: dbQuery } = require('../config/mysql-database');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', async (req, res, next) => {
  try {
    // Return mock stats for now
    res.json({
      success: true,
      data: {
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        lowStockProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    next(error);
  }
});

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Private
router.get('/recent-orders', async (req, res, next) => {
  try {
    // Return empty array for now
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Recent orders error:', error);
    next(error);
  }
});

// @desc    Get top products
// @route   GET /api/dashboard/top-products
// @access  Private
router.get('/top-products', async (req, res, next) => {
  try {
    // Return empty array for now
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Top products error:', error);
    next(error);
  }
});

module.exports = router;
