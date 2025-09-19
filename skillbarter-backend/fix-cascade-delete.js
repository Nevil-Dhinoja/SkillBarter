const { sequelize } = require('./config/db');

async function checkAndFixCascadeDelete() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    console.log('🔍 Checking current CASCADE DELETE status...\n');
    
    // Check current foreign key constraints
    const [constraints] = await sequelize.query(`
      SELECT 
        rc.TABLE_NAME,
        kcu.COLUMN_NAME,
        rc.CONSTRAINT_NAME,
        rc.REFERENCED_TABLE_NAME,
        kcu.REFERENCED_COLUMN_NAME,
        rc.DELETE_RULE,
        rc.UPDATE_RULE
      FROM information_schema.REFERENTIAL_CONSTRAINTS rc
      JOIN information_schema.KEY_COLUMN_USAGE kcu 
        ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME 
        AND rc.TABLE_NAME = kcu.TABLE_NAME
        AND rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
      WHERE rc.CONSTRAINT_SCHEMA = DATABASE()
      AND rc.REFERENCED_TABLE_NAME = 'users'
      ORDER BY rc.TABLE_NAME, kcu.COLUMN_NAME
    `);
    
    console.log('📋 Current foreign key constraints referencing users table:');
    constraints.forEach(constraint => {
      const cascadeStatus = constraint.DELETE_RULE === 'CASCADE' ? '✅ CASCADE' : '❌ ' + constraint.DELETE_RULE;
      console.log(`   ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME} -> users.user_id (${cascadeStatus})`);
    });
    
    // Find constraints that need CASCADE DELETE
    const needsCascade = constraints.filter(c => c.DELETE_RULE !== 'CASCADE');
    
    if (needsCascade.length === 0) {
      console.log('\\n🎉 All foreign key constraints already have CASCADE DELETE enabled!');
      return;
    }
    
    console.log(`\\n⚠️ Found ${needsCascade.length} constraints that need CASCADE DELETE setup:`);
    needsCascade.forEach(constraint => {
      console.log(`   - ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME} (currently: ${constraint.DELETE_RULE})`);
    });
    
    console.log('\\n🔧 Fixing CASCADE DELETE constraints...');
    
    // Fix each constraint
    for (const constraint of needsCascade) {
      try {
        console.log(`\\n📝 Updating ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME}...`);
        
        // Drop existing constraint
        await sequelize.query(`ALTER TABLE ${constraint.TABLE_NAME} DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`);
        console.log(`   ✓ Dropped old constraint: ${constraint.CONSTRAINT_NAME}`);
        
        // Add new constraint with CASCADE DELETE
        const newConstraintName = `fk_${constraint.TABLE_NAME}_${constraint.COLUMN_NAME}_cascade`;
        await sequelize.query(`
          ALTER TABLE ${constraint.TABLE_NAME} 
          ADD CONSTRAINT ${newConstraintName}
          FOREIGN KEY (${constraint.COLUMN_NAME}) REFERENCES users(user_id) 
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
        console.log(`   ✅ Added CASCADE constraint: ${newConstraintName}`);
        
      } catch (error) {
        console.log(`   ❌ Error updating ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME}: ${error.message}`);
      }
    }
    
    console.log('\\n🔍 Verifying final CASCADE DELETE status...');
    
    // Re-check constraints after updates
    const [finalConstraints] = await sequelize.query(`
      SELECT 
        rc.TABLE_NAME,
        kcu.COLUMN_NAME,
        rc.CONSTRAINT_NAME,
        rc.DELETE_RULE
      FROM information_schema.REFERENTIAL_CONSTRAINTS rc
      JOIN information_schema.KEY_COLUMN_USAGE kcu 
        ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME 
        AND rc.TABLE_NAME = kcu.TABLE_NAME
        AND rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
      WHERE rc.CONSTRAINT_SCHEMA = DATABASE()
      AND rc.REFERENCED_TABLE_NAME = 'users'
      ORDER BY rc.TABLE_NAME, kcu.COLUMN_NAME
    `);
    
    console.log('\\n📋 Final CASCADE DELETE status:');
    finalConstraints.forEach(constraint => {
      const status = constraint.DELETE_RULE === 'CASCADE' ? '✅' : '❌';
      console.log(`   ${status} ${constraint.TABLE_NAME}.${constraint.COLUMN_NAME} -> CASCADE DELETE: ${constraint.DELETE_RULE}`);
    });
    
    const cascadeCount = finalConstraints.filter(c => c.DELETE_RULE === 'CASCADE').length;
    const totalCount = finalConstraints.length;
    
    console.log(`\\n📊 Summary: ${cascadeCount}/${totalCount} constraints have CASCADE DELETE enabled`);
    
    if (cascadeCount === totalCount) {
      console.log('\\n🎉 SUCCESS! All user-related data will be automatically deleted when a user is deleted!');
      console.log('\\n🛡️ Tables with CASCADE DELETE:');
      finalConstraints.forEach(constraint => {
        if (constraint.DELETE_RULE === 'CASCADE') {
          console.log(`   ✅ ${constraint.TABLE_NAME}`);
        }
      });
    } else {
      console.log('\\n⚠️ Some constraints still need manual fixing.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
checkAndFixCascadeDelete()
  .then(() => {
    console.log('\\n✅ Process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\\n❌ Process failed:', error);
    process.exit(1);
  });