const { pool } = require('../config/mysql-database');

async function createAdminSettingsTable() {
  try {
    console.log('Creating admin_settings table...');
    
    // Create the table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id VARCHAR(36),
        section VARCHAR(50) NOT NULL,
        \`key\` VARCHAR(100) NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_section_key (user_id, section, \`key\`)
      )
    `);

    console.log('✓ admin_settings table created successfully');

    // Insert default settings
    console.log('Inserting default settings...');
    
    const defaultSettings = [
      // General Settings
      [null, 'general', 'siteName', '"Kaaya Beauty"'],
      [null, 'general', 'siteDescription', '"Your ultimate destination for beauty and cosmetics"'],
      [null, 'general', 'contactEmail', '"support@kaaya.com"'],
      [null, 'general', 'contactPhone', '"+91 9876543210"'],
      [null, 'general', 'currency', '"INR"'],
      [null, 'general', 'timezone', '"Asia/Kolkata"'],
      [null, 'general', 'language', '"en"'],

      // Notification Settings
      [null, 'notifications', 'emailNotifications', 'true'],
      [null, 'notifications', 'smsNotifications', 'false'],
      [null, 'notifications', 'orderUpdates', 'true'],
      [null, 'notifications', 'lowStockAlerts', 'true'],
      [null, 'notifications', 'newCustomerAlerts', 'true'],
      [null, 'notifications', 'dailyReports', 'true'],
      [null, 'notifications', 'weeklyReports', 'false'],

      // Payment Settings
      [null, 'payment', 'razorpay', '{"enabled": true, "keyId": "rzp_test_***", "keySecret": "***"}'],
      [null, 'payment', 'paypal', '{"enabled": false, "clientId": "", "clientSecret": ""}'],
      [null, 'payment', 'stripe', '{"enabled": false, "publishableKey": "", "secretKey": ""}'],
      [null, 'payment', 'cod', '{"enabled": true, "minAmount": 0, "maxAmount": 5000}'],

      // Shipping Settings
      [null, 'shipping', 'freeShippingThreshold', '999'],
      [null, 'shipping', 'standardShipping', '{"enabled": true, "rate": 99, "estimatedDays": "3-7"}'],
      [null, 'shipping', 'expressShipping', '{"enabled": true, "rate": 199, "estimatedDays": "1-2"}'],
      [null, 'shipping', 'zones', '[{"name": "Metro Cities", "rate": 99, "days": "2-4"}, {"name": "Tier 2 Cities", "rate": 149, "days": "4-7"}, {"name": "Remote Areas", "rate": 199, "days": "7-14"}]'],

      // Security Settings
      [null, 'security', 'twoFactorAuth', 'false'],
      [null, 'security', 'sessionTimeout', '30'],
      [null, 'security', 'loginAttempts', '5'],
      [null, 'security', 'passwordExpiry', '90'],
      [null, 'security', 'requireStrongPassword', 'true']
    ];

    for (const setting of defaultSettings) {
      await pool.execute(
        'INSERT IGNORE INTO admin_settings (user_id, section, `key`, value) VALUES (?, ?, ?, ?)',
        setting
      );
    }

    console.log('✓ Default settings inserted successfully');
    console.log('Admin settings table setup completed!');

  } catch (error) {
    console.error('Error creating admin_settings table:', error);
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createAdminSettingsTable();
