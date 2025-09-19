const { testConnection } = require('./config/db');
const { syncDatabase } = require('./models/index');

async function setupDatabase() {
  try {
    console.log('🔗 Testing database connection...');
    await testConnection();
    
    console.log('🔄 Syncing database models...');
    await syncDatabase();
    
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    process.exit(0);
  }
}

setupDatabase();