const { sequelize } = require('./config/db');

async function createOtpTable() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Create OTP verifications table
    const createTableQuery = `
      CREATE TABLE otp_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        otp_type ENUM('registration', 'password_reset') DEFAULT 'registration',
        expires_at DATETIME NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        attempts INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_type (email, otp_type),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB;
    `;
    
    await sequelize.query(createTableQuery);
    console.log('✅ OTP verifications table created successfully');
    
    // Verify table creation
    const [results] = await sequelize.query("DESCRIBE otp_verifications");
    console.log('\nOTP Verifications table structure:');
    console.table(results);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createOtpTable();