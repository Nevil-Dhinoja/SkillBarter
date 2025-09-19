const { sequelize } = require('./config/db');

const createFriendRequestsTable = async () => {
  try {
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
    
    console.log('✅ friend_requests table created successfully');
  } catch (error) {
    console.error('❌ Error creating friend_requests table:', error);
    throw error;
  }
};

const setupFriendRequestsTable = async () => {
  try {
    console.log('🔧 Setting up friend_requests table...');
    await createFriendRequestsTable();
    console.log('🎉 Friend requests table setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
};

// Run the setup
setupFriendRequestsTable();