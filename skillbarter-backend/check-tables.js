const { sequelize } = require('./config/db');

async function checkTableStructure() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Check users table structure
    const [results] = await sequelize.query("DESCRIBE users");
    console.log('\nUsers table structure:');
    console.table(results);
    
    // Check if otp_verifications table exists
    try {
      const [otpResults] = await sequelize.query("DESCRIBE otp_verifications");
      console.log('\nOTP Verifications table structure:');
      console.table(otpResults);
    } catch (error) {
      console.log('\nOTP Verifications table does not exist');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTableStructure();