const { sequelize } = require('./config/db');
const { db } = require('./models');

const testSkillsAPI = async () => {
  try {
    console.log('🔍 Testing Skills API components...');
    
    // 1. Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // 2. Check if tables exist
    const [tables] = await sequelize.query("SHOW TABLES");
    const tableNames = tables.map(table => Object.values(table)[0]);
    console.log('📊 Available tables:', tableNames);
    
    // 3. Check user_skills table structure
    if (tableNames.includes('user_skills')) {
      console.log('📋 user_skills table structure:');
      const [columns] = await sequelize.query("DESCRIBE user_skills");
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
      });
      
      // Test if we can query user_skills
      const [userSkills] = await sequelize.query("SELECT * FROM user_skills LIMIT 1");
      console.log('🔍 Sample user_skills data:', userSkills[0] || 'No data found');
    } else {
      console.log('❌ user_skills table does not exist!');
    }
    
    // 4. Check skills table
    if (tableNames.includes('skills')) {
      const [skills] = await sequelize.query("SELECT * FROM skills LIMIT 3");
      console.log('🎯 Sample skills:', skills);
    }
    
    // 5. Test Sequelize models
    console.log('🏗️ Testing Sequelize models...');
    console.log('UserSkill model:', !!db.UserSkill);
    console.log('Skill model:', !!db.Skill);
    console.log('User model:', !!db.User);
    
    // 6. Test a simple model query
    try {
      const skillCount = await db.Skill.count();
      console.log('📊 Total skills in database:', skillCount);
      
      if (db.UserSkill) {
        const userSkillCount = await db.UserSkill.count();
        console.log('📊 Total user skills in database:', userSkillCount);
      }
    } catch (modelError) {
      console.error('❌ Model query error:', modelError.message);
    }
    
    console.log('🎉 Skills API test completed!');
    
  } catch (error) {
    console.error('❌ Skills API test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    process.exit(0);
  }
};

testSkillsAPI();