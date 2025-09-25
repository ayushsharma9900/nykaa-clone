const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all customers with pagination, filtering, and search
// @route   GET /api/customers
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  query('minSpent').optional().isNumeric().withMessage('Min spent must be a number'),
  query('maxSpent').optional().isNumeric().withMessage('Max spent must be a number'),
  query('sortBy').optional().isIn(['name', 'totalSpent', 'totalOrders', 'createdAt', 'lastOrderDate']).withMessage('Invalid sort field'),
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
    
    if (req.query.gender) {
      filter.gender = req.query.gender;
    }
    
    if (req.query.minSpent || req.query.maxSpent) {
      filter.totalSpent = {};
      if (req.query.minSpent) filter.totalSpent.$gte = parseFloat(req.query.minSpent);
      if (req.query.maxSpent) filter.totalSpent.$lte = parseFloat(req.query.maxSpent);
    }
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Get customers
    const customers = await Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const totalCustomers = await Customer.countDocuments(filter);
    const totalPages = Math.ceil(totalCustomers / limit);

    res.json({
      success: true,
      data: customers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCustomers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single customer with order history
// @route   GET /api/customers/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get customer's recent orders
    const recentOrders = await Order.find({ customer: req.params.id })
      .sort({ orderDate: -1 })
      .limit(10)
      .select('invoiceNumber orderDate total status paymentMethod');

    res.json({
      success: true,
      data: {
        customer,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (staff and above)
router.post('/', authorize('staff', 'manager', 'admin'), [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim().isMobilePhone().withMessage('Valid phone number required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('address.street').optional().trim().notEmpty().withMessage('Street cannot be empty if provided'),
  body('address.city').optional().trim().notEmpty().withMessage('City cannot be empty if provided'),
  body('address.state').optional().trim().notEmpty().withMessage('State cannot be empty if provided'),
  body('address.country').optional().trim().notEmpty().withMessage('Country cannot be empty if provided'),
  body('address.zipCode').optional().trim().notEmpty().withMessage('Zip code cannot be empty if provided'),
  body('preferredPaymentMethod').optional().isIn(['cash', 'card', 'credit']).withMessage('Invalid payment method')
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

    // Check if customer with email already exists
    const existingCustomer = await Customer.findOne({ email: req.body.email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (staff and above)
router.put('/:id', authorize('staff', 'manager', 'admin'), [
  body('name').optional().trim().notEmpty().withMessage('Customer name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim().isMobilePhone().withMessage('Valid phone number required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.country').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('preferredPaymentMethod').optional().isIn(['cash', 'card', 'credit']).withMessage('Invalid payment method'),
  body('notes').optional().trim()
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

    // Check if email already exists (excluding current customer)
    if (req.body.email) {
      const existingCustomer = await Customer.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Customer with this email already exists'
        });
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Toggle customer active status
// @route   PATCH /api/customers/:id/toggle-status
// @access  Private (manager and admin only)
router.patch('/:id/toggle-status', authorize('manager', 'admin'), async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.isActive = !customer.isActive;
    await customer.save();

    res.json({
      success: true,
      message: `Customer ${customer.isActive ? 'activated' : 'deactivated'} successfully`,
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get customer analytics
// @route   GET /api/customers/analytics
// @access  Private
router.get('/analytics/overview', async (req, res, next) => {
  try {
    // Total customers
    const totalCustomers = await Customer.countDocuments({ isActive: true });
    
    // New customers this month
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    
    const newCustomersThisMonth = await Customer.countDocuments({
      isActive: true,
      createdAt: { $gte: thisMonthStart }
    });

    // Customer distribution by tier (based on spending)
    const customerTiers = await Customer.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          tier: {
            $cond: {
              if: { $gte: ['$totalSpent', 5000] },
              then: 'Premium',
              else: {
                $cond: {
                  if: { $gte: ['$totalSpent', 1000] },
                  then: 'Gold',
                  else: {
                    $cond: {
                      if: { $gte: ['$totalSpent', 500] },
                      then: 'Silver',
                      else: 'Bronze'
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: '$tier',
          count: { $sum: 1 },
          totalSpent: { $sum: '$totalSpent' }
        }
      }
    ]);

    // Top customers by spending
    const topCustomers = await Customer.find({ isActive: true })
      .sort({ totalSpent: -1 })
      .limit(10)
      .select('name email totalSpent totalOrders');

    // Average order value across all customers
    const avgStats = await Customer.aggregate([
      { $match: { isActive: true, totalOrders: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgOrderValue: { $avg: '$averageOrderValue' },
          avgLifetimeValue: { $avg: '$totalSpent' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        newCustomersThisMonth,
        customerTiers,
        topCustomers,
        averageOrderValue: avgStats[0]?.avgOrderValue || 0,
        averageLifetimeValue: avgStats[0]?.avgLifetimeValue || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get customer order history
// @route   GET /api/customers/:id/orders
// @access  Private
router.get('/:id/orders', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'processing', 'delivered', 'cancelled']).withMessage('Invalid status')
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

    // Check if customer exists
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { customer: req.params.id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Get orders
    const orders = await Order.find(filter)
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('invoiceNumber orderDate total status paymentMethod items');

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add loyalty points to customer
// @route   PATCH /api/customers/:id/loyalty-points
// @access  Private (staff and above)
router.patch('/:id/loyalty-points', authorize('staff', 'manager', 'admin'), [
  body('points').isInt().withMessage('Points must be an integer'),
  body('reason').optional().trim().notEmpty().withMessage('Reason cannot be empty if provided')
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

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $inc: { loyaltyPoints: req.body.points } },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: `${req.body.points > 0 ? 'Added' : 'Deducted'} ${Math.abs(req.body.points)} loyalty points`,
      data: customer
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete customer (soft delete by setting isActive to false)
// @route   DELETE /api/customers/:id
// @access  Private (admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
