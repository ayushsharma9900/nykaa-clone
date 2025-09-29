-- Create admin_settings table for storing admin panel settings
CREATE TABLE IF NOT EXISTS admin_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    section VARCHAR(50) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_section_key (user_id, section, `key`)
);

-- Insert default settings for general admin settings
-- These will be used as fallbacks when user-specific settings don't exist
INSERT IGNORE INTO admin_settings (user_id, section, `key`, value) VALUES
-- General Settings
(NULL, 'general', 'siteName', '"Kaaya Beauty"'),
(NULL, 'general', 'siteDescription', '"Your ultimate destination for beauty and cosmetics"'),
(NULL, 'general', 'contactEmail', '"support@kaaya.com"'),
(NULL, 'general', 'contactPhone', '"+91 9876543210"'),
(NULL, 'general', 'currency', '"INR"'),
(NULL, 'general', 'timezone', '"Asia/Kolkata"'),
(NULL, 'general', 'language', '"en"'),

-- Notification Settings
(NULL, 'notifications', 'emailNotifications', 'true'),
(NULL, 'notifications', 'smsNotifications', 'false'),
(NULL, 'notifications', 'orderUpdates', 'true'),
(NULL, 'notifications', 'lowStockAlerts', 'true'),
(NULL, 'notifications', 'newCustomerAlerts', 'true'),
(NULL, 'notifications', 'dailyReports', 'true'),
(NULL, 'notifications', 'weeklyReports', 'false'),

-- Payment Settings
(NULL, 'payment', 'razorpay', '{"enabled": true, "keyId": "rzp_test_***", "keySecret": "***"}'),
(NULL, 'payment', 'paypal', '{"enabled": false, "clientId": "", "clientSecret": ""}'),
(NULL, 'payment', 'stripe', '{"enabled": false, "publishableKey": "", "secretKey": ""}'),
(NULL, 'payment', 'cod', '{"enabled": true, "minAmount": 0, "maxAmount": 5000}'),

-- Shipping Settings
(NULL, 'shipping', 'freeShippingThreshold', '999'),
(NULL, 'shipping', 'standardShipping', '{"enabled": true, "rate": 99, "estimatedDays": "3-7"}'),
(NULL, 'shipping', 'expressShipping', '{"enabled": true, "rate": 199, "estimatedDays": "1-2"}'),
(NULL, 'shipping', 'zones', '[{"name": "Metro Cities", "rate": 99, "days": "2-4"}, {"name": "Tier 2 Cities", "rate": 149, "days": "4-7"}, {"name": "Remote Areas", "rate": 199, "days": "7-14"}]'),

-- Security Settings
(NULL, 'security', 'twoFactorAuth', 'false'),
(NULL, 'security', 'sessionTimeout', '30'),
(NULL, 'security', 'loginAttempts', '5'),
(NULL, 'security', 'passwordExpiry', '90'),
(NULL, 'security', 'requireStrongPassword', 'true');
