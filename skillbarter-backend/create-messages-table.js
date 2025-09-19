const { sequelize } = require('./config/db');

async function createMessagesTable() {
  try {
    console.log('🔄 Creating messages table...');

    // Create messages table manually
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message_text TEXT NOT NULL,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_sender_receiver (sender_id, receiver_id),
        INDEX idx_sent_at (sent_at),
        FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Messages table created successfully!');
    
    // Check if table exists and get count
    const [results] = await sequelize.query('SELECT COUNT(*) as count FROM messages');
    const messageCount = results[0].count;
    console.log(`📊 Messages table ready. Current message count: ${messageCount}`);
    
  } catch (error) {
    console.error('❌ Error creating messages table:', error.message);
  } finally {
    process.exit(0);
  }
}

createMessagesTable();