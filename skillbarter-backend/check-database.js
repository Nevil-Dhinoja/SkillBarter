const { testConnection } = require('./config/db');
const { db } = require('./models');

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking database connection...');
    await testConnection();
    
    console.log('\n📊 Checking table structures...');
    
    // Get database connection
    const sequelize = db.sequelize;
    
    // Check if skills table exists
    const [skillsTableExists] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'skills'
    `);
    
    console.log('Skills table exists:', skillsTableExists[0].count > 0);
    
    if (skillsTableExists[0].count > 0) {
      // Show skills table structure
      const [skillsStructure] = await sequelize.query('DESCRIBE skills');
      console.log('\nSkills table structure:');
      console.table(skillsStructure);
    }
    
    // Check if user_skills table exists
    const [userSkillsTableExists] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'user_skills'
    `);
    
    console.log('\nUser_skills table exists:', userSkillsTableExists[0].count > 0);
    
    if (userSkillsTableExists[0].count > 0) {
      // Show user_skills table structure
      const [userSkillsStructure] = await sequelize.query('DESCRIBE user_skills');
      console.log('\nUser_skills table structure:');
      console.table(userSkillsStructure);
    }
    
    // List all tables in database
    const [allTables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `);
    
    console.log('\nAll tables in database:');
    allTables.forEach(table => console.log('  -', table.table_name));
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDatabaseStructure();