const { sequelize } = require('./config/db');

const fixDatabaseIssues = async () => {
  try {
    console.log('🔧 Fixing database issues...');
    
    // 1. Create friend_requests table if it doesn't exist
    console.log('📋 Creating friend_requests table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_request (sender_id, receiver_id)
      )
    `);
    
    // 2. Check if required tables exist
    const [tables] = await sequelize.query("SHOW TABLES");
    const tableNames = tables.map(table => Object.values(table)[0]);
    
    console.log('📊 Available tables:', tableNames);
    
    const requiredTables = ['users', 'skills', 'user_skills', 'friend_requests'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables:', missingTables);
      
      // Create user_skills table if missing
      if (missingTables.includes('user_skills')) {
        console.log('📋 Creating user_skills table...');
        await sequelize.query(`
          CREATE TABLE user_skills (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            skill_id INT NOT NULL,
            skill_type ENUM('teach', 'learn') NOT NULL,
            verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_skill (user_id, skill_id, skill_type)
          )
        `);
      }
    }
    
    // 3. Verify authentication works
    console.log('🔐 Testing database connection...');
    await sequelize.authenticate();
    
    console.log('✅ All database issues fixed successfully!');
    console.log('🎉 Ready to run the server!');
    
  } catch (error) {
    console.error('❌ Error fixing database issues:', error);
    throw error;
  }
};

const runFix = async () => {
  try {
    await fixDatabaseIssues();
    process.exit(0);
  } catch (error) {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  }
};

// Run the fix
runFix();