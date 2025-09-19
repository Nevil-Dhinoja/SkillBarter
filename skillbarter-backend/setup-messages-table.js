const { syncDatabase, db } = require('./models/index');

async function setupMessagesTable() {
  try {
    console.log('🔄 Setting up messages table...');

    // Sync the database
    await syncDatabase();
    
    // Check if Message model is available
    if (!db.Message) {
      console.log('⚠️  Message model not found, table may not exist yet');
      console.log('✅ Database sync completed - messages table should now be available');
      return;
    }
    
    // Check if messages table exists and has data
    const messageCount = await db.Message.count();
    console.log(`📊 Messages table ready. Current message count: ${messageCount}`);
    
    console.log('✅ Messages table setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up messages table:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

setupMessagesTable();