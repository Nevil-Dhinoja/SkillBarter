const { sequelize } = require('./config/db');

async function testCascadeDelete() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    console.log('🔍 Testing CASCADE DELETE functionality...');
    
    // Check current foreign key constraints
    const [constraints] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME,
        DELETE_RULE,
        UPDATE_RULE
      FROM information_schema.REFERENTIAL_CONSTRAINTS rc
      JOIN information_schema.KEY_COLUMN_USAGE kcu 
        ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME 
        AND rc.TABLE_NAME = kcu.TABLE_NAME
      WHERE rc.CONSTRAINT_SCHEMA = DATABASE()
      AND rc.REFERENCED_TABLE_NAME = 'users'
      ORDER BY rc.TABLE_NAME, kcu.COLUMN_NAME
    `);
    
    console.log('\\n📋 Current foreign key constraints referencing users table:');
    constraints.forEach(constraint => {
      const cascadeStatus = constraint.DELETE_RULE === 'CASCADE' ? '✅ CASCADE' : '❌ ' + constraint.DELETE_RULE;
      console.log(`   ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME} -> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME} (${cascadeStatus})`);
    });
    
    const cascadeCount = constraints.filter(c => c.DELETE_RULE === 'CASCADE').length;
    const totalCount = constraints.length;
    
    console.log(`\\n📊 Summary: ${cascadeCount}/${totalCount} constraints have CASCADE DELETE enabled`);
    
    if (cascadeCount === totalCount) {
      console.log('🎉 All foreign key constraints have CASCADE DELETE enabled!');
      console.log('🛡️ When you delete a user, all related data will be automatically deleted.');
    } else {
      console.log('⚠️ Some constraints still need CASCADE DELETE setup.');
    }
    
  } catch (error) {
    console.error('❌ Error testing CASCADE DELETE:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testCascadeDelete()
  .then(() => {
    console.log('\\n✅ Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\\n❌ Test failed:', error);
    process.exit(1);
  });