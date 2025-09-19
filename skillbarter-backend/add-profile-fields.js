const { sequelize } = require('./config/db');

async function addUserProfileFields() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    console.log('🔄 Adding new profile fields to users table...\n');
    
    // Add new columns to users table
    const alterations = [
      {
        column: 'first_name',
        sql: `ALTER TABLE users ADD COLUMN first_name VARCHAR(50) AFTER full_name`,
        description: 'Add first_name field'
      },
      {
        column: 'last_name', 
        sql: `ALTER TABLE users ADD COLUMN last_name VARCHAR(50) AFTER first_name`,
        description: 'Add last_name field'
      },
      {
        column: 'skills_to_teach',
        sql: `ALTER TABLE users ADD COLUMN skills_to_teach TEXT AFTER bio`,
        description: 'Add skills_to_teach field'
      },
      {
        column: 'skills_to_learn',
        sql: `ALTER TABLE users ADD COLUMN skills_to_learn TEXT AFTER skills_to_teach`,
        description: 'Add skills_to_learn field'
      },
      {
        column: 'profile_picture',
        sql: `ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500) AFTER skills_to_learn`,
        description: 'Add profile_picture field'
      }
    ];

    for (const alteration of alterations) {
      try {
        // Check if column already exists
        const [columns] = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'users' 
          AND COLUMN_NAME = '${alteration.column}'
        `);

        if (columns.length > 0) {
          console.log(`   ⚠️ Column '${alteration.column}' already exists, skipping...`);
        } else {
          await sequelize.query(alteration.sql);
          console.log(`   ✅ ${alteration.description}`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to add ${alteration.column}: ${error.message}`);
      }
    }

    // Now let's split existing full_name into first_name and last_name
    console.log('\n🔄 Migrating existing full_name data...');
    
    try {
      await sequelize.query(`
        UPDATE users 
        SET 
          first_name = SUBSTRING_INDEX(full_name, ' ', 1),
          last_name = CASE 
            WHEN LOCATE(' ', full_name) > 0 
            THEN SUBSTRING(full_name, LOCATE(' ', full_name) + 1)
            ELSE ''
          END
        WHERE (first_name IS NULL OR first_name = '') 
        AND full_name IS NOT NULL 
        AND full_name != ''
      `);
      console.log('   ✅ Successfully migrated full_name data to first_name and last_name');
    } catch (error) {
      console.log(`   ⚠️ Error migrating full_name data: ${error.message}`);
    }

    console.log('\n📊 Checking final table structure...');
    
    const [tableInfo] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('\n📋 Updated users table structure:');
    tableInfo.forEach(column => {
      console.log(`   • ${column.COLUMN_NAME} (${column.DATA_TYPE}) - ${column.IS_NULLABLE === 'YES' ? 'nullable' : 'required'}`);
    });
    
    console.log('\n🎉 Profile fields migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
addUserProfileFields()
  .then(() => {
    console.log('\n✅ Migration process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration process failed:', error);
    process.exit(1);
  });