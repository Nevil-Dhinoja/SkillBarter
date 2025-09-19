const { sequelize } = require('./config/db');

const testDatabase = async () => {
  try {
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Check what tables exist
    const [tables] = await sequelize.query("SHOW TABLES");
    const tableNames = tables.map(table => Object.values(table)[0]);
    console.log('📊 Available tables:', tableNames);
    
    // Check user_skills table structure if it exists
    if (tableNames.includes('user_skills')) {
      console.log('🔍 Checking user_skills table structure...');
      const [columns] = await sequelize.query("DESCRIBE user_skills");
      console.log('📋 user_skills columns:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? `KEY: ${col.Key}` : ''}`);
      });
    } else {
      console.log('❌ user_skills table does not exist');
    }
    
    // Check friend_requests table structure if it exists
    if (tableNames.includes('friend_requests')) {
      console.log('🔍 Checking friend_requests table structure...');
      const [columns] = await sequelize.query("DESCRIBE friend_requests");
      console.log('📋 friend_requests columns:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? `KEY: ${col.Key}` : ''}`);
      });
    } else {
      console.log('❌ friend_requests table does not exist');
    }
    
    // Test a simple query on users table
    if (tableNames.includes('users')) {
      console.log('🔍 Testing users table query...');
      const [users] = await sequelize.query("SELECT user_id, full_name, email FROM users LIMIT 1");
      console.log('👤 Sample user:', users[0] || 'No users found');
    }
    
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    process.exit(0);
  }
};

testDatabase();