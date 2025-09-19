const { sequelize } = require('./config/db');

async function testCascadeDelete() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    console.log('🧪 Testing CASCADE DELETE functionality...');
    
    // Create a test user
    console.log('\\n📋 Step 1: Creating a test user...');
    const [result] = await sequelize.query(`
      INSERT INTO users (full_name, email, password_hash, location, bio) 
      VALUES ('Test User', 'test-cascade@example.com', 'hashed_password', 'Test City', 'Test bio for cascade delete')
    `);
    
    const testUserId = result.insertId;
    console.log(`   ✓ Created test user with ID: ${testUserId}`);
    
    // Add some test data to related tables
    console.log('\\n📋 Step 2: Adding test data to related tables...');
    
    // Add OTP verification
    await sequelize.query(`
      INSERT INTO otp_verifications (user_id, email, otp_code, otp_type, expires_at) 
      VALUES (?, 'test-cascade@example.com', '123456', 'registration', DATE_ADD(NOW(), INTERVAL 10 MINUTE))
    `, { replacements: [testUserId] });
    console.log('   ✓ Added OTP verification record');
    
    // Add user skills (if tables exist)
    try {
      await sequelize.query(`
        INSERT INTO user_skills_teach (user_id, skill_id) VALUES (?, 1)
      `, { replacements: [testUserId] });
      console.log('   ✓ Added user_skills_teach record');
    } catch (error) {
      console.log('   ⚠️ user_skills_teach: skill_id 1 might not exist');
    }
    
    try {
      await sequelize.query(`
        INSERT INTO user_skills_learn (user_id, skill_id) VALUES (?, 1)
      `, { replacements: [testUserId] });
      console.log('   ✓ Added user_skills_learn record');
    } catch (error) {
      console.log('   ⚠️ user_skills_learn: skill_id 1 might not exist');
    }
    
    // Add performance record
    try {
      await sequelize.query(`
        INSERT INTO performance (user_id, avg_score, quizzes_taken, highest_score, lowest_score) 
        VALUES (?, 0.0, 0, 0.0, 0.0)
      `, { replacements: [testUserId] });
      console.log('   ✓ Added performance record');
    } catch (error) {
      console.log('   ⚠️ performance table might not exist or have different structure');
    }
    
    // Count records before deletion
    console.log('\\n📋 Step 3: Counting related records before deletion...');
    
    const [otpCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM otp_verifications WHERE user_id = ?
    `, { replacements: [testUserId] });
    
    console.log(`   📊 Records found for user ${testUserId}:`);
    console.log(`      - OTP verifications: ${otpCount[0].count}`);
    
    // Try to count other related records
    const tables = [
      'user_skills_teach', 'user_skills_learn', 'performance', 
      'matches', 'credits', 'chats', 'reviews', 'messages', 'quizzes', 'quiz_results'
    ];
    
    for (const table of tables) {
      try {
        const [count] = await sequelize.query(`
          SELECT COUNT(*) as count FROM ${table} WHERE user_id = ?
        `, { replacements: [testUserId] });
        if (count[0].count > 0) {
          console.log(`      - ${table}: ${count[0].count}`);
        }
      } catch (error) {
        // Table might not exist or have different column names
      }
    }
    
    // Now delete the user and see if CASCADE DELETE works
    console.log('\\n📋 Step 4: Deleting the test user...');
    
    const [deleteResult] = await sequelize.query(`
      DELETE FROM users WHERE user_id = ?
    `, { replacements: [testUserId] });
    
    console.log(`   ✓ Deleted user ${testUserId}`);
    
    // Check if related records were also deleted
    console.log('\\n📋 Step 5: Verifying CASCADE DELETE worked...');
    
    const [otpCountAfter] = await sequelize.query(`
      SELECT COUNT(*) as count FROM otp_verifications WHERE user_id = ?
    `, { replacements: [testUserId] });
    
    console.log(`   📊 Records remaining for user ${testUserId}:`);
    console.log(`      - OTP verifications: ${otpCountAfter[0].count}`);
    
    if (otpCountAfter[0].count === 0) {
      console.log('   ✅ CASCADE DELETE is working! OTP records were automatically deleted.');
    } else {
      console.log('   ❌ CASCADE DELETE might not be working. OTP records still exist.');
    }
    
    console.log('\\n🎉 CASCADE DELETE test completed!');
    
  } catch (error) {
    console.error('❌ Error testing CASCADE DELETE:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the test
testCascadeDelete()
  .then(() => {
    console.log('\\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\\n❌ Test failed:', error);
    process.exit(1);
  });