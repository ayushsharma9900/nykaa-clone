# Menu Management System Guide

## Overview

The Menu Management system allows you to control the navigation menu that appears on your website's header through an intuitive admin interface with drag-and-drop functionality.

## 🔗 How It's Connected

### Frontend Header ↔ Admin Panel Connection
- **Frontend Header**: Uses the Menu Management API to display navigation items
- **Admin Panel**: Manages menu items through drag-and-drop interface
- **Real-time Sync**: Changes in admin panel immediately affect the frontend menu

### System Architecture
```
Frontend Header (useMenuItems) → Menu Management API → MongoDB Categories
                                        ↕
Admin Panel (MenuManager) → Menu Management API → MongoDB Categories
```

## 🎯 Features

### ✅ What You Can Do

1. **Drag & Drop Reordering**
   - Drag menu items up/down to change their order
   - Changes are automatically saved to the database
   - Order is immediately reflected on the frontend

2. **Visibility Control**
   - Toggle menu items on/off using the eye icon
   - Hidden items won't appear in the frontend navigation
   - Items can be active but hidden from menu

3. **Search & Filter**
   - Search through menu items by name, description, or slug
   - Filter functionality built-in

4. **Real-time Feedback**
   - Visual indicators for active/inactive and visible/hidden states
   - Success/error messages for all operations
   - Loading states during operations

5. **Category Sync**
   - "Sync Categories" button ensures consistency
   - Syncs menu settings with main categories table
   - Useful after bulk changes or data imports

## 🚀 How to Use

### Step 1: Access Menu Management
1. Navigate to `/admin/menu-management` in your admin panel
2. You'll see all available menu categories

### Step 2: Reorder Items
1. Click and drag items using the grip handle (four horizontal bars)
2. Drop items in the desired position
3. Changes are automatically saved

### Step 3: Control Visibility
1. Click the eye icon to show/hide items from the menu
2. Blue dot = visible in menu, Gray dot = hidden from menu
3. Green dot = active category, Red dot = inactive category

### Step 4: Sync Changes (Optional)
1. Click "Sync Categories" to ensure database consistency
2. This updates the main categories table with menu settings
3. Recommended after major changes

## 🔧 Technical Details

### API Endpoints
- `GET /api/menu-management/menu-items` - Fetch menu items
- `PUT /api/menu-management/reorder` - Update item order
- `PUT /api/menu-management/toggle-visibility/:id` - Toggle visibility
- `POST /api/menu-management/sync-categories` - Sync with main categories

### Database Schema
Each menu item has these key fields:
- `menuOrder`: Controls the display order (0-based)
- `showInMenu`: Controls visibility in frontend menu
- `isActive`: Controls if category is active
- `menuLevel`: Supports hierarchical menus (future feature)

### Frontend Integration
- Header component uses `useMenuItems` hook
- Automatically filters for `showInMenu: true` and `isActive: true`
- Sorts by `menuOrder` ascending
- Refreshes automatically when menu changes

## 🎨 Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🟢 Green dot | Category is active |
| 🔴 Red dot | Category is inactive |
| 🔵 Blue dot | Visible in menu |
| ⚪ Gray dot | Hidden from menu |
| 📱 Grip bars | Drag handle for reordering |
| 👁️ Eye icon | Toggle visibility |
| ✏️ Pencil icon | Edit item |
| 🗑️ Trash icon | Delete item |

## ⚠️ Important Notes

1. **Active & Visible**: Items must be both `isActive: true` AND `showInMenu: true` to appear in frontend
2. **Order Matters**: Lower `menuOrder` values appear first in the menu
3. **Real-time Updates**: Frontend menu updates immediately when admin changes are made
4. **Database Consistency**: Use "Sync Categories" if you notice inconsistencies

## 🔍 Troubleshooting

### Menu Items Not Appearing
- Check if item is both active (green dot) and visible (blue dot)
- Verify frontend server is running on port 3000
- Check browser console for API errors

### Drag & Drop Not Working
- Ensure backend server is running on port 5001
- Check for JavaScript errors in browser console
- Verify network connection between frontend and backend

### Changes Not Saving
- Check network connection
- Verify backend server is responding
- Look for error messages in the admin interface

## 🌟 Best Practices

1. **Logical Order**: Arrange menu items in order of importance/usage
2. **Consistent Naming**: Use clear, descriptive category names
3. **Regular Sync**: Use "Sync Categories" after bulk operations
4. **Test Changes**: Always check frontend after making changes
5. **Backup First**: Consider database backup before major changes

## 🚦 Quick Start Checklist

- [ ] Both servers running (Frontend: 3000, Backend: 5001)
- [ ] Database contains sample categories
- [ ] Admin panel accessible at `/admin/menu-management`
- [ ] Frontend header displaying menu items
- [ ] Drag & drop functionality working
- [ ] Visibility toggles working
- [ ] Changes reflected on frontend immediately

---

**Need Help?** Check the console logs for detailed error messages, or verify that both development servers are running properly.
