const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { pool } = require('../config/mysql-database');

// Get all settings
router.get('/', protect, async (req, res) => {
  try {
    // Determine user_id - use NULL for development mock user
    const userId = (req.user.id === 'dev-admin-user') ? null : req.user.id;
    
    const [rows] = await pool.execute(`
      SELECT * FROM admin_settings WHERE user_id = ? OR user_id IS NULL
    `, [userId]);

    // Convert rows to settings object structure
    const settings = {
      general: {},
      notifications: {},
      payment: {},
      shipping: {},
      security: {}
    };

    rows.forEach(row => {
      if (!settings[row.section]) {
        settings[row.section] = {};
      }
      
      let value = row.value;
      // Parse JSON values
      try {
        value = JSON.parse(row.value);
      } catch (e) {
        // Keep as string if not valid JSON
      }
      
      settings[row.section][row.key] = value;
    });

    res.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// Save settings
router.put('/', protect, async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Settings data is required'
      });
    }

    // Determine user_id - use NULL for development mock user to avoid FK constraint
    const userId = (req.user.id === 'dev-admin-user') ? null : req.user.id;

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete existing settings for this user (or global settings if dev user)
      if (userId) {
        await connection.execute(
          'DELETE FROM admin_settings WHERE user_id = ?', 
          [userId]
        );
      } else {
        // For dev user, delete global settings instead
        await connection.execute(
          'DELETE FROM admin_settings WHERE user_id IS NULL'
        );
      }

      // Insert new settings
      for (const [section, sectionData] of Object.entries(settings)) {
        for (const [key, value] of Object.entries(sectionData)) {
          let valueString = value;
          if (typeof value === 'object') {
            valueString = JSON.stringify(value);
          }

          await connection.execute(`
            INSERT INTO admin_settings (user_id, section, \`key\`, value, updated_at) 
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
            value = VALUES(value), updated_at = NOW()
          `, [userId, section, key, valueString]);
        }
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: 'Settings saved successfully'
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }

  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save settings'
    });
  }
});

// Reset settings to defaults
router.post('/reset', protect, async (req, res) => {
  try {
    const { section } = req.body;

    if (section) {
      // Reset specific section
      await pool.execute(
        'DELETE FROM admin_settings WHERE user_id = ? AND section = ?',
        [req.user.id, section]
      );
    } else {
      // Reset all settings
      await pool.execute(
        'DELETE FROM admin_settings WHERE user_id = ?',
        [req.user.id]
      );
    }

    res.json({
      success: true,
      message: section ? `${section} settings reset successfully` : 'All settings reset successfully'
    });

  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings'
    });
  }
});

module.exports = router;
