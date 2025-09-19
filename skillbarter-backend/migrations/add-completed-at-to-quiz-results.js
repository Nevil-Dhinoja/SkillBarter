const { sequelize } = require('../config/db');

const addCompletedAtColumn = async () => {
  try {
    console.log('🔧 Adding completed_at column to quiz_results table...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Add completed_at column to quiz_results table
    console.log('📋 Adding completed_at column...');
    await sequelize.query(`
      ALTER TABLE quiz_results 
      ADD COLUMN completed_at TIMESTAMP NULL AFTER taken_at
    `);
    
    console.log('✅ Column added successfully!');
    
  } catch (error) {
    // Check if the column already exists
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ Column already exists, no action needed');
    } else {
      console.error('❌ Failed to add column:', error);
      throw error;
    }
  }
};

const runMigration = async () => {
  try {
    await addCompletedAtColumn();
    process.exit(0);
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigration();
}

module.exports = addCompletedAtColumn;