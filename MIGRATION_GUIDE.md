# MongoDB to MySQL Migration Guide

This guide walks you through the complete migration process from MongoDB to MySQL for your Nykaa Clone application.

## ✅ What's Been Completed

1. **Data Export**: Exported all MongoDB data to JSON files (104 total records)
2. **MySQL Dependencies**: Installed mysql2 package for Node.js
3. **Database Schema**: Created MySQL table structures matching your MongoDB models
4. **Data Conversion**: Converted JSON exports to MySQL-compatible SQL files
5. **Application Configuration**: Updated server.js to use MySQL instead of MongoDB

## 📁 Generated Files

```
backend/
├── config/
│   └── mysql-database.js          # MySQL connection configuration
├── exports/                       # Original MongoDB data in JSON format
│   ├── users.json                 # 3 users
│   ├── products.json              # 80 products  
│   ├── orders.json                # 8 orders
│   ├── categories.json            # 8 categories
│   ├── customers.json             # 5 customers
│   └── export-summary.json        # Export summary
├── sql-exports/                   # MySQL import files
│   ├── 00-master-import.sql       # Main import script
│   ├── 01-users.sql              # Users data
│   ├── 02-categories.sql         # Categories data
│   ├── 03-customers.sql          # Customers data
│   ├── 04-products.sql           # Products & images data
│   └── 05-orders.sql             # Orders & order items data
├── scripts/
│   ├── export-mongodb.js         # MongoDB export script
│   └── json-to-mysql.js          # JSON to MySQL conversion script
└── .env.example                   # Environment configuration template
```

## 🚀 Next Steps to Complete Migration

### Step 1: Setup MySQL Database

1. **Install MySQL** (if not already installed):
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or install via XAMPP: https://www.apachefriends.org/

2. **Create the database**:
   ```sql
   CREATE DATABASE nykaa_clone;
   USE nykaa_clone;
   ```

### Step 2: Import Data via phpMyAdmin

1. **Access phpMyAdmin**:
   - Open http://localhost/phpmyadmin in your browser
   - Login with your MySQL credentials

2. **Create Database**:
   - Click "New" in the left sidebar
   - Database name: `nykaa_clone`
   - Click "Create"

3. **Import Data**:
   - Select the `nykaa_clone` database
   - Click "Import" tab
   - Choose file: `backend/sql-exports/00-master-import.sql`
   - Click "Go"

   **Alternative**: Import each file individually in order:
   - `01-users.sql`
   - `02-categories.sql` 
   - `03-customers.sql`
   - `04-products.sql`
   - `05-orders.sql`

### Step 3: Configure Environment

1. **Create .env file**:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Update MySQL credentials** in `backend/.env`:
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=nykaa_clone
   MYSQL_PORT=3306
   ```

### Step 4: Update Your Application Code (Remaining Task)

You'll need to update your route files to use MySQL queries instead of Mongoose. Here's the pattern:

**Before (MongoDB/Mongoose):**
```javascript
const User = require('../models/User');
const users = await User.find({});
```

**After (MySQL):**
```javascript
const { query } = require('../config/mysql-database');
const users = await query('SELECT * FROM users WHERE isActive = ?', [true]);
```

### Step 5: Test the Migration

1. **Start your server**:
   ```bash
   cd backend
   npm start
   ```

2. **Check health endpoint**:
   ```bash
   curl http://localhost:5001/api/health
   ```

   Should return:
   ```json
   {
     "status": "OK",
     "message": "Nykaa Clone Backend API is running",
     "database": {
       "status": "connected",
       "type": "MySQL"
     }
   }
   ```

3. **Verify data in phpMyAdmin**:
   - Check that all tables have the expected data
   - Total records should match: 104 records across all tables

## 📊 Database Schema Summary

### Tables Created:
- **users** (3 records) - Admin/staff users
- **categories** (8 records) - Product categories  
- **customers** (5 records) - Customer data
- **products** (80 records) - Product catalog
- **product_images** - Product image URLs (normalized)
- **orders** (8 records) - Order information
- **order_items** - Individual order line items (normalized)

### Key Features:
- ✅ Foreign key relationships maintained
- ✅ JSON fields for complex data (address, dimensions, etc.)
- ✅ Proper indexes for performance
- ✅ Data types optimized for MySQL
- ✅ Auto-incrementing IDs where appropriate

## 🔧 Helper Commands

### Backup your MySQL database:
```bash
mysqldump -u root -p nykaa_clone > nykaa_clone_backup.sql
```

### Restore from backup:
```bash
mysql -u root -p nykaa_clone < nykaa_clone_backup.sql
```

### Check table status:
```sql
SELECT 
  TABLE_NAME,
  TABLE_ROWS,
  DATA_LENGTH,
  INDEX_LENGTH
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'nykaa_clone';
```

## 🚨 Important Notes

1. **Backup**: Keep your MongoDB data exports as backup
2. **Testing**: Test all API endpoints after migration
3. **Performance**: Monitor query performance and add indexes as needed
4. **Security**: Update your .env file with secure MySQL credentials
5. **Dependencies**: You can now remove mongoose from package.json if desired

## 🛠 Troubleshooting

### Common Issues:

1. **Connection Error**: Check MySQL service is running
2. **Authentication Failed**: Verify MySQL user/password in .env
3. **Database Not Found**: Ensure nykaa_clone database exists
4. **Foreign Key Errors**: Import tables in the correct order (use master script)

### Need Help?
- Check MySQL error logs
- Verify phpMyAdmin can connect to your database
- Test connection with a simple MySQL client

---

## ✅ Migration Checklist

- [x] Export MongoDB data
- [x] Install MySQL dependencies  
- [x] Create MySQL database schema
- [x] Convert data to MySQL format
- [x] Update server configuration
- [ ] Setup MySQL database
- [ ] Import data via phpMyAdmin
- [ ] Configure environment variables
- [ ] Update application routes/models
- [ ] Test all endpoints
- [ ] Remove MongoDB dependencies (optional)

Your data is now ready to be imported into MySQL via phpMyAdmin!
