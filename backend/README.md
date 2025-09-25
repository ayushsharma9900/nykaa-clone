# Dashtar E-commerce Backend API

A comprehensive backend API for an e-commerce dashboard built with Node.js, Express, and MongoDB. This API powers the Dashtar dashboard with features for order management, product catalog, customer management, and analytics.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Order Management**: Complete CRUD operations for orders with status tracking
- **Product Management**: Product catalog with inventory management
- **Customer Management**: Customer profiles with order history and analytics
- **Dashboard Analytics**: Sales metrics, revenue data, and performance charts
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Centralized error handling with detailed error responses
- **Security**: Rate limiting, CORS, helmet protection, and password hashing

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and configure the following:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dashtar
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   BCRYPT_ROUNDS=12
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Seed the database with sample data**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:5000`

## 🔐 Authentication

### Default Users
After running the seed script, you can login with:

- **Admin**: `admin@dashtar.com` / `password123`
- **Manager**: `manager@dashtar.com` / `password123`  
- **Staff**: `staff@dashtar.com` / `password123`

### API Authentication
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Dashboard Analytics
- `GET /api/dashboard/overview` - Dashboard overview metrics
- `GET /api/dashboard/order-stats` - Order statistics
- `GET /api/dashboard/weekly-sales` - Weekly sales chart data
- `GET /api/dashboard/best-selling-products` - Best selling products

### Orders
- `GET /api/orders` - Get all orders (with pagination and filtering)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Cancel order

### Products
- `GET /api/products` - Get all products (with pagination and search)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `PATCH /api/products/:id/stock` - Update product stock
- `PATCH /api/products/:id/toggle-status` - Toggle product status
- `GET /api/products/meta/categories` - Get product categories
- `GET /api/products/alerts/low-stock` - Get low stock alerts
- `DELETE /api/products/:id` - Delete product

### Customers
- `GET /api/customers` - Get all customers (with pagination and filtering)
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `PATCH /api/customers/:id/toggle-status` - Toggle customer status
- `GET /api/customers/analytics/overview` - Customer analytics
- `GET /api/customers/:id/orders` - Get customer order history
- `PATCH /api/customers/:id/loyalty-points` - Update loyalty points
- `DELETE /api/customers/:id` - Delete customer

### Health Check
- `GET /api/health` - API health status

## 🎯 Data Models

### User
- Admin, Manager, and Staff roles
- JWT authentication with bcrypt password hashing
- Role-based access control

### Customer  
- Personal information and contact details
- Order history and spending analytics
- Loyalty points system
- Customer tier classification

### Product
- Product details with categories and pricing
- Inventory management with stock tracking
- Sales analytics and ratings
- SKU-based identification

### Order
- Complete order lifecycle management
- Multiple payment methods (cash, card, credit)
- Order status tracking (pending, processing, delivered, cancelled)
- Automatic invoice number generation

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers for Express
- **Input Validation**: express-validator for request sanitization
- **Role-based Access**: Different permission levels

## 📊 Dashboard Data

The seed script creates sample data that matches the dashboard shown in the images:

- **Sales Metrics**: Today's orders ($470.00), Yesterday's orders ($0.00)
- **Monthly Data**: This month ($25,551.49), Last month ($7,991.39)
- **Order Statistics**: 1,177 total orders, 29 pending, 6 processing, 41 delivered
- **Product Categories**: Head Shoulders Shampoo, Mint, Pantene hair-care, Dark & Lovely Conditioner
- **Recent Orders**: Sample orders with realistic customer names and amounts

## 🔧 Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Project Structure
```
backend/
├── config/
│   └── database.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Customer.js
│   ├── Product.js
│   └── Order.js
├── routes/
│   ├── auth.js
│   ├── dashboard.js
│   ├── orders.js
│   ├── products.js
│   └── customers.js
├── scripts/
│   └── seedData.js
├── .env
├── server.js
└── package.json
```

## 🚦 API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Validation errors array"]
}
```

## 📈 Performance Optimizations

- MongoDB indexing on frequently queried fields
- Efficient aggregation pipelines for analytics
- Pagination for large datasets
- Selective field projection to reduce payload size
- Connection pooling for database operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.
