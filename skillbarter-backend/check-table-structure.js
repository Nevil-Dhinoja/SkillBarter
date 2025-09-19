const { sequelize } = require('./config/db');

async function checkTableStructure() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    console.log('🔍 Checking table structures...\n');
    
    // Get list of all tables
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log('📋 Available tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    console.log('\n🔍 Checking detailed structure for key tables...\n');
    
    // Check specific tables that are mentioned in the error
    const tablesToCheck = ['users', 'chats', 'matches', 'credits', 'reviews', 'messages', 'user_skills_teach', 'user_skills_learn', 'quizzes', 'quiz_results', 'performance'];
    
    for (const tableName of tablesToCheck) {
      try {
        console.log(`📋 Table: ${tableName}`);
        const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);
        columns.forEach(col => {
          console.log(`   - ${col.Field} (${col.Type}) ${col.Key ? '[' + col.Key + ']' : ''} ${col.Extra ? '[' + col.Extra + ']' : ''}`);
        });
        
        // Check existing foreign keys
        const [foreignKeys] = await sequelize.query(`
          SELECT 
            CONSTRAINT_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
          FROM information_schema.KEY_COLUMN_USAGE 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = '${tableName}' 
          AND REFERENCED_TABLE_NAME IS NOT NULL
        `);
        
        if (foreignKeys.length > 0) {
          console.log('   Foreign Keys:');
          foreignKeys.forEach(fk => {
            console.log(`     - ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} (${fk.CONSTRAINT_NAME})`);
          });
        }
        
        console.log('');
      } catch (error) {
        console.log(`   ⚠️ Table ${tableName} not found or error: ${error.message}\n`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
checkTableStructure()
  .then(() => {
    console.log('✅ Table structure check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Process failed:', error);
    process.exit(1);
  });