const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

// Get all menu items with hierarchical structure
router.get('/menu-items', protect, async (req, res) => {
  try {
    // Check if admin wants to see all categories (including hidden ones)
    const showAll = req.query.showAll === 'true';
    console.log('🔍 Menu items request - showAll:', showAll);
    
    // Build filter: for admin management (showAll=true), get all categories
    // For frontend menu display (default), only get visible categories
    const filter = showAll ? {} : { showInMenu: true };
    
    console.log('📋 Using filter:', filter);
    
    const categories = await Category.find(filter)
      .sort({ menuOrder: 1, menuLevel: 1, name: 1 })
      .populate('subcategories')
      .populate('productCount');
      
    console.log(`📊 Found ${categories.length} categories`);

    // Build hierarchical structure
    const menuItems = buildMenuHierarchy(categories);

    res.json({
      success: true,
      data: menuItems,
      meta: {
        total: categories.length,
        showingAll: showAll
      }
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update menu item order
router.put('/reorder', protect, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }

    // Update each category's menu order
    const updatePromises = items.map((item, index) => {
      return Category.findByIdAndUpdate(
        item.id,
        {
          menuOrder: index,
          menuLevel: item.level || 0,
          parentId: item.parentId || null,
          showInMenu: item.showInMenu !== false
        },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Menu order updated successfully'
    });
  } catch (error) {
    console.error('Reorder menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Toggle menu item visibility
router.put('/toggle-visibility/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { showInMenu } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { showInMenu: showInMenu },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: `Category ${showInMenu ? 'shown in' : 'hidden from'} menu`,
      data: category
    });
  } catch (error) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Add new menu item
router.post('/add-item', protect, async (req, res) => {
  try {
    const { name, description, parentId, menuLevel, image, isActive } = req.body;

    // Get the highest menu order for proper positioning
    const maxOrder = await Category.findOne(
      { parentId: parentId || null },
      {},
      { sort: { menuOrder: -1 } }
    );

    const newCategory = new Category({
      name,
      description,
      parentId: parentId || null,
      menuLevel: menuLevel || 0,
      menuOrder: (maxOrder?.menuOrder || 0) + 1,
      image: image || null,
      isActive: isActive !== false,
      showInMenu: true
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update menu item
router.put('/update-item/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be directly updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete menu item
router.delete('/delete-item/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has subcategories
    const subcategoriesCount = await Category.countDocuments({ parentId: id });
    
    if (subcategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories. Please delete or move subcategories first.'
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Sync menu items with regular categories table
router.post('/sync-categories', protect, async (req, res) => {
  try {
    console.log('🔄 Sync categories request received');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { syncActiveStatus } = req.body; // Optional parameter to control active status sync
    console.log('Sync active status:', syncActiveStatus);
    
    // Get all categories from menu management
    console.log('📋 Fetching all categories...');
    const menuItems = await Category.find({}).sort({ menuOrder: 1 });
    console.log(`📊 Found ${menuItems.length} categories to sync`);
    
    // Update all categories to match their menu settings
    const updatePromises = menuItems.map(async (item) => {
      const updateData = {
        sortOrder: item.menuOrder, // Always sync sortOrder with menuOrder
      };
      
      // Only sync active status if explicitly requested
      if (syncActiveStatus === true) {
        updateData.isActive = item.isActive && item.showInMenu;
      }
      
      return Category.findByIdAndUpdate(
        item._id,
        updateData,
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: syncActiveStatus 
        ? 'Categories synced with menu settings (including active status)'
        : 'Categories synced with menu order only',
      synced: menuItems.length,
      syncedActiveStatus: !!syncActiveStatus
    });
  } catch (error) {
    console.error('Sync categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get categories debug info (shows all categories with their status)
router.get('/debug/categories', protect, async (req, res) => {
  try {
    const allCategories = await Category.find({}).sort({ menuOrder: 1, name: 1 });
    
    const categoriesInfo = allCategories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      isActive: cat.isActive,
      showInMenu: cat.showInMenu,
      menuOrder: cat.menuOrder,
      sortOrder: cat.sortOrder,
      willShowInFrontend: cat.isActive && cat.showInMenu,
      status: {
        active: cat.isActive,
        visibleInMenu: cat.showInMenu,
        willDisplay: cat.isActive && cat.showInMenu
      }
    }));
    
    const totalCount = allCategories.length;
    const activeCount = allCategories.filter(cat => cat.isActive).length;
    const visibleInMenuCount = allCategories.filter(cat => cat.showInMenu).length;
    const displayableCount = allCategories.filter(cat => cat.isActive && cat.showInMenu).length;

    res.json({
      success: true,
      summary: {
        total: totalCount,
        active: activeCount,
        inactive: totalCount - activeCount,
        visibleInMenu: visibleInMenuCount,
        hiddenFromMenu: totalCount - visibleInMenuCount,
        displayableInFrontend: displayableCount
      },
      data: categoriesInfo
    });
  } catch (error) {
    console.error('Debug categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Helper function to build menu hierarchy
function buildMenuHierarchy(categories) {
  const categoryMap = {};
  const rootCategories = [];

  // Create a map of categories by ID
  categories.forEach(category => {
    categoryMap[category._id] = {
      ...category.toObject(),
      children: []
    };
  });

  // Build hierarchy
  categories.forEach(category => {
    const categoryData = categoryMap[category._id];
    
    if (category.parentId) {
      const parent = categoryMap[category.parentId];
      if (parent) {
        parent.children.push(categoryData);
      }
    } else {
      rootCategories.push(categoryData);
    }
  });

  // Sort children recursively
  function sortChildren(items) {
    items.sort((a, b) => a.menuOrder - b.menuOrder);
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        sortChildren(item.children);
      }
    });
  }

  sortChildren(rootCategories);
  return rootCategories;
}

module.exports = router;
