# Admin Panel API Fixes

This document outlines the fixes and improvements made to the admin panel backend API.

## Fixed Issues

### 1. Route Ordering Issues
- **Problem**: Meta routes (`/meta/categories`, `/alerts/low-stock`) were placed after parameterized routes (`/:id`), causing conflicts.
- **Fix**: Moved all meta routes before parameterized routes to prevent conflicts.

### 2. Dynamic Category Management
- **Problem**: Product model had hardcoded category enum, preventing dynamic category management.
- **Fix**: Removed enum constraint from Product model and added validation to check against active categories in the Category collection.

### 3. Missing Admin-Specific Endpoints
- **Problem**: No dedicated endpoints for admins to view all products/categories (including inactive ones).
- **Fix**: Added new admin-specific endpoints.

### 4. Missing Bulk Operations
- **Problem**: No bulk activation/deactivation or deletion operations.
- **Fix**: Added bulk operation endpoints for both products and categories.

## New/Fixed Endpoints

### Products

#### Admin Endpoints
- `GET /api/products/admin/all` - Get all products (including inactive) for admin management
  - **Query params**: `page`, `limit`, `category`, `status` (active/inactive), `search`
  - **Access**: Manager, Admin

#### Meta Endpoints (Fixed)
- `GET /api/products/meta/categories` - Get categories with product stats
  - Now uses dynamic categories from Category collection
- `GET /api/products/alerts/low-stock` - Get low stock products

#### Bulk Operations (New)
- `PATCH /api/products/bulk/status` - Bulk activate/deactivate products
  - **Body**: `{ productIds: [], isActive: boolean }`
  - **Access**: Manager, Admin
  
- `DELETE /api/products/bulk` - Bulk delete products (soft delete)
  - **Body**: `{ productIds: [] }`
  - **Access**: Admin only

#### Fixed Validation
- Product creation/update now validates categories against active Category collection
- Added support for `images` array in product creation/update

### Categories

#### Admin Endpoints
- `GET /api/categories/admin/all` - Get all categories (including inactive) for admin management
  - **Query params**: `page`, `limit`, `status` (active/inactive), `search`
  - **Access**: Manager, Admin

#### Fixed Stats Endpoint
- `GET /api/categories/meta/stats` - Get category statistics (fixed route path)

#### Bulk Operations (New)
- `PATCH /api/categories/bulk/status` - Bulk activate/deactivate categories
  - **Body**: `{ categoryIds: [], isActive: boolean }`
  - **Access**: Manager, Admin
  
- `DELETE /api/categories/bulk` - Bulk delete categories
  - **Body**: `{ categoryIds: [] }`
  - **Access**: Admin only
  - **Note**: Prevents deletion of categories that have products

## Usage Examples

### Bulk Activate Products
```bash
PATCH /api/products/bulk/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "productIds": ["64a1b2c3d4e5f6g7h8i9j0k1", "64a1b2c3d4e5f6g7h8i9j0k2"],
  "isActive": true
}
```

### Get All Categories for Admin
```bash
GET /api/categories/admin/all?page=1&limit=20&status=active&search=shampoo
Authorization: Bearer <token>
```

### Bulk Delete Categories
```bash
DELETE /api/categories/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryIds": ["64a1b2c3d4e5f6g7h8i9j0k1", "64a1b2c3d4e5f6g7h8i9j0k2"]
}
```

## Error Handling Improvements

- Better validation error messages
- Category existence validation for products
- Prevention of category deletion when products exist
- Proper HTTP status codes for different error scenarios

## Breaking Changes

- Product model no longer has hardcoded category enum
- Categories are now validated against the Category collection
- Some endpoint paths have been reorganized for consistency

## Testing Recommendations

1. Test product creation with valid/invalid categories
2. Test bulk operations with various scenarios
3. Test admin endpoints with different user roles
4. Verify category deletion prevention when products exist
5. Test route ordering with meta routes vs parameterized routes
