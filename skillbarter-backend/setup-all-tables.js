const { sequelize } = require('./config/db');

const setupAllTables = async () => {
  try {
    console.log('🔧 Setting up all required tables...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create user_skills table
    console.log('📋 Creating user_skills table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS user_skills (
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
    
    // Create friend_requests table
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
    
    // Verify tables exist
    const [tables] = await sequelize.query("SHOW TABLES");
    const tableNames = tables.map(table => Object.values(table)[0]);
    console.log('📊 Available tables after setup:', tableNames);
    
    // Check required tables
    const requiredTables = ['users', 'skills', 'user_skills', 'friend_requests'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length === 0) {
      console.log('🎉 All required tables are present!');
    } else {
      console.log('⚠️ Missing tables:', missingTables);
    }
    
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
};

const runSetup = async () => {
  try {
    await setupAllTables();
    process.exit(0);
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
};

runSetup();