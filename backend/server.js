const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/mysql-database');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const orderRoutes = require('./routes/orders');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const categoryRoutes = require('./routes/categories');
const menuManagementRoutes = require('./routes/menuManagement');
const settingsRoutes = require('./routes/settings');

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Serve static files from public directory
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu-management', menuManagementRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { pool } = require('./config/mysql-database');
    const connection = await pool.getConnection();
    connection.release();
    
    res.status(200).json({
      status: 'OK',
      message: 'Nykaa Clone Backend API is running',
      database: {
        status: 'connected',
        type: 'MySQL'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(200).json({
      status: 'OK',
      message: 'Nykaa Clone Backend API is running',
      database: {
        status: 'disconnected',
        type: 'MySQL',
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown handling
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGQUIT', gracefulShutdown);

async function gracefulShutdown(signal) {
  console.log(`\n${signal} signal received.`);
  console.log('Gracefully shutting down server...');
  
  server.close(async () => {
    console.log('Express server closed.');
    
    try {
      // Close database connection
      const { closePool } = require('./config/mysql-database');
      await closePool();
      console.log('MySQL connection pool closed.');
      console.log('Server shutdown complete.');
      process.exit(0);
    } catch (error) {
      console.error('Error closing MySQL connection:', error);
      process.exit(1);
    }
  });
  
  // Force close server after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}
