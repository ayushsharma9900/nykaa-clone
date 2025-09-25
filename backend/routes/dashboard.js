const express = require('express');
const moment = require('moment');
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const router = express.Router();

// All dashboard routes are protected
router.use(protect);

// @desc    Get dashboard overview metrics
// @route   GET /api/dashboard/overview
// @access  Private
router.get('/overview', async (req, res, next) => {
  try {
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');
    const thisMonthStart = moment().startOf('month');
    const lastMonthStart = moment().subtract(1, 'month').startOf('month');
    const lastMonthEnd = moment().subtract(1, 'month').endOf('month');

    // Today's orders
    const todayOrders = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: today.toDate() },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: '$total' },
          cashSales: {
            $sum: {
              $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$total', 0]
            }
          },
          cardSales: {
            $sum: {
              $cond: [{ $eq: ['$paymentMethod', 'card'] }, '$total', 0]
            }
          },
          creditSales: {
            $sum: {
              $cond: [{ $eq: ['$paymentMethod', 'credit'] }, '$total', 0]
            }
          }
        }
      }
    ]);

    // Yesterday's orders
    const yesterdayOrders = await Order.aggregate([
      {
        $match: {
          orderDate: { 
            $gte: yesterday.toDate(),
            $lt: today.toDate()
          },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          cashSales: {
            $sum: {
              $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$total', 0]
            }
          },
          cardSales: {
            $sum: {
              $cond: [{ $eq: ['$paymentMethod', 'card'] }, '$total', 0]
            }
          },
          creditSales: {
            $sum: {
              $cond: [{ $eq: ['$paymentMethod', 'credit'] }, '$total', 0]
            }
          }
        }
      }
    ]);

    // This month's sales
    const thisMonthSales = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: thisMonthStart.toDate() },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' }
        }
      }
    ]);

    // Last month's sales
    const lastMonthSales = await Order.aggregate([
      {
        $match: {
          orderDate: { 
            $gte: lastMonthStart.toDate(),
            $lte: lastMonthEnd.toDate()
          },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' }
        }
      }
    ]);

    // All-time sales
    const allTimeSales = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' }
        }
      }
    ]);

    const todayData = todayOrders[0] || { totalOrders: 0, totalSales: 0, cashSales: 0, cardSales: 0, creditSales: 0 };
    const yesterdayData = yesterdayOrders[0] || { totalSales: 0, cashSales: 0, cardSales: 0, creditSales: 0 };
    const thisMonthData = thisMonthSales[0] || { totalSales: 0 };
    const lastMonthData = lastMonthSales[0] || { totalSales: 0 };
    const allTimeData = allTimeSales[0] || { totalSales: 0 };

    res.json({
      success: true,
      data: {
        todayOrders: {
          total: todayData.totalSales.toFixed(2),
          cash: todayData.cashSales.toFixed(2),
          card: todayData.cardSales.toFixed(2),
          credit: todayData.creditSales.toFixed(2)
        },
        yesterdayOrders: {
          total: yesterdayData.totalSales.toFixed(2),
          cash: yesterdayData.cashSales.toFixed(2),
          card: yesterdayData.cardSales.toFixed(2),
          credit: yesterdayData.creditSales.toFixed(2)
        },
        thisMonth: thisMonthData.totalSales.toFixed(2),
        lastMonth: lastMonthData.totalSales.toFixed(2),
        allTimeSales: allTimeData.totalSales.toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get order statistics
// @route   GET /api/dashboard/order-stats
// @access  Private
router.get('/order-stats', async (req, res, next) => {
  try {
    // Get order counts by status
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' }
        }
      }
    ]);

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Format the response
    const stats = {
      totalOrders,
      pending: 0,
      pendingValue: 0,
      processing: 0,
      delivered: 0,
      cancelled: 0
    };

    orderStats.forEach(stat => {
      if (stat._id === 'pending') {
        stats.pending = stat.count;
        stats.pendingValue = stat.totalValue.toFixed(2);
      } else if (stat._id === 'processing') {
        stats.processing = stat.count;
      } else if (stat._id === 'delivered') {
        stats.delivered = stat.count;
      } else if (stat._id === 'cancelled') {
        stats.cancelled = stat.count;
      }
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get weekly sales data for chart
// @route   GET /api/dashboard/weekly-sales
// @access  Private
router.get('/weekly-sales', async (req, res, next) => {
  try {
    const startDate = moment().subtract(6, 'days').startOf('day');
    
    const weeklySales = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate.toDate() },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$orderDate'
              }
            }
          },
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Fill in missing dates with zero values
    const salesData = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().subtract(6 - i, 'days').format('YYYY-MM-DD');
      const existingData = weeklySales.find(item => item._id.date === date);
      
      salesData.push({
        date: moment(date).format('YYYY-MM-DD'),
        sales: existingData ? existingData.sales : 0,
        orders: existingData ? existingData.orders : 0
      });
    }

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get best selling products
// @route   GET /api/dashboard/best-selling-products
// @access  Private
router.get('/best-selling-products', async (req, res, next) => {
  try {
    const bestSellingProducts = await Product.find({ isActive: true })
      .sort({ totalSold: -1 })
      .limit(4)
      .select('name category totalSold');

    // Calculate percentages
    const totalSold = bestSellingProducts.reduce((sum, product) => sum + product.totalSold, 0);
    
    const productsWithPercentage = bestSellingProducts.map(product => ({
      name: product.name,
      category: product.category,
      totalSold: product.totalSold,
      percentage: totalSold > 0 ? ((product.totalSold / totalSold) * 100).toFixed(1) : 0
    }));

    res.json({
      success: true,
      data: productsWithPercentage
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
