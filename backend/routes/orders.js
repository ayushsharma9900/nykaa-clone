const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all orders with pagination, filtering, and sorting
// @route   GET /api/orders
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  query('paymentMethod').optional().isIn(['cash', 'card', 'credit']).withMessage('Invalid payment method'),
  query('sortBy').optional().isIn(['orderDate', 'total', 'invoiceNumber']).withMessage('Invalid sort field'),
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
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    if (req.query.search) {
      filter.$or = [
        { invoiceNumber: { $regex: req.query.search, $options: 'i' } },
        { customerName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortBy = req.query.sortBy || 'orderDate';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Get orders
    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .populate('items.product', 'name images')
      .sort(sort)
      .skip(skip)
      .limit(limit);

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

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('items.product', 'name sku images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (staff and above)
router.post('/', authorize('staff', 'manager', 'admin'), [
  body('customerId').isMongoId().withMessage('Valid customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
  body('paymentMethod').isIn(['cash', 'card', 'credit']).withMessage('Invalid payment method'),
  body('tax').optional().isNumeric().withMessage('Tax must be a number'),
  body('shipping').optional().isNumeric().withMessage('Shipping must be a number'),
  body('discount').optional().isNumeric().withMessage('Discount must be a number')
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

    const { customerId, items, paymentMethod, tax = 0, shipping = 0, discount = 0, notes, shippingAddress } = req.body;

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Process items and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });

      subtotal += itemTotal;
    }

    // Generate invoice number
    const invoiceNumber = await Order.generateInvoiceNumber();

    // Create order
    const order = await Order.create({
      invoiceNumber,
      customer: customerId,
      customerName: customer.name,
      items: orderItems,
      subtotal,
      tax: parseFloat(tax),
      shipping: parseFloat(shipping),
      discount: parseFloat(discount),
      paymentMethod,
      notes,
      shippingAddress
    });

    // Update product stock and sales count
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity,
            totalSold: item.quantity
          }
        }
      );
    }

    // Update customer statistics
    await Customer.findByIdAndUpdate(
      customerId,
      {
        $inc: {
          totalOrders: 1,
          totalSpent: order.total
        },
        $set: {
          lastOrderDate: new Date(),
          averageOrderValue: (customer.totalSpent + order.total) / (customer.totalOrders + 1)
        }
      }
    );

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email')
      .populate('items.product', 'name sku');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (staff and above)
router.patch('/:id/status', authorize('staff', 'manager', 'admin'), [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('trackingNumber').optional().isString().withMessage('Tracking number must be a string'),
  body('deliveryDate').optional().isISO8601().withMessage('Invalid delivery date format')
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

    const { status, trackingNumber, deliveryDate } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (deliveryDate) updateData.deliveryDate = new Date(deliveryDate);
    if (status === 'delivered' && !deliveryDate) {
      updateData.deliveryDate = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customer', 'name email');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update order (comprehensive update)
// @route   PUT /api/orders/:id
// @access  Private (staff and above)
router.put('/:id', authorize('staff', 'manager', 'admin'), [
  body('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid payment status'),
  body('customerName').optional().isString().notEmpty().withMessage('Customer name cannot be empty'),
  body('customerEmail').optional().isEmail().withMessage('Invalid customer email'),
  body('customerPhone').optional().isString().withMessage('Customer phone must be a string'),
  body('shippingAddress.street').optional().isString().withMessage('Street address must be a string'),
  body('shippingAddress.city').optional().isString().withMessage('City must be a string'),
  body('shippingAddress.state').optional().isString().withMessage('State must be a string'),
  body('shippingAddress.zipCode').optional().isString().withMessage('ZIP code must be a string'),
  body('shippingAddress.country').optional().isString().withMessage('Country must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('trackingNumber').optional().isString().withMessage('Tracking number must be a string')
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

    const order = await Order.findById(req.params.id).populate('customer');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const {
      status,
      paymentStatus,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      notes,
      trackingNumber
    } = req.body;

    // Build update object
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (notes !== undefined) updateData.notes = notes;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    
    // Handle shipping address update
    if (shippingAddress) {
      updateData.shippingAddress = {
        ...order.shippingAddress,
        ...shippingAddress
      };
    }

    // Set delivery date if status is changed to delivered
    if (status === 'delivered' && order.status !== 'delivered') {
      updateData.deliveryDate = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customer', 'name email phone')
     .populate('items.product', 'name sku images');

    // If customer information is updated, also update the customer record
    if (customerEmail !== undefined || customerPhone !== undefined) {
      const customerUpdates = {};
      if (customerEmail !== undefined) customerUpdates.email = customerEmail;
      if (customerPhone !== undefined) customerUpdates.phone = customerPhone;
      
      if (Object.keys(customerUpdates).length > 0) {
        await Customer.findByIdAndUpdate(order.customer._id, customerUpdates);
      }
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete order (cancel)
// @route   DELETE /api/orders/:id
// @access  Private (manager and admin only)
router.delete('/:id', authorize('manager', 'admin'), async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel delivered orders'
      });
    }

    // Restore product stock if order is cancelled
    if (order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: item.quantity,
              totalSold: -item.quantity
            }
          }
        );
      }

      // Update customer statistics
      await Customer.findByIdAndUpdate(
        order.customer,
        {
          $inc: {
            totalOrders: -1,
            totalSpent: -order.total
          }
        }
      );
    }

    // Update order status to cancelled instead of deleting
    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
