const { sequelize } = require('./config/db');

async function addCascadeDeleteConstraints() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    console.log('🔧 Adding CASCADE DELETE foreign key constraints...');
    
    // First, let's check existing foreign keys and drop them
    console.log('📋 Step 1: Dropping existing foreign key constraints...');
    
    // Drop existing foreign keys for matches table (receiver_id)
    try {
      await sequelize.query(`ALTER TABLE matches DROP FOREIGN KEY matches_ibfk_2`);
      console.log('   ✓ Dropped matches receiver foreign key constraint');
    } catch (error) {
      console.log('   ⚠️ matches_ibfk_2 constraint not found or already dropped');
    }
    
    // Drop existing foreign keys for chats table (sender_id)
    try {
      await sequelize.query(`ALTER TABLE chats DROP FOREIGN KEY chats_ibfk_2`);
      console.log('   ✓ Dropped chats sender foreign key constraint');
    } catch (error) {
      console.log('   ⚠️ chats_ibfk_2 constraint not found or already dropped');
    }
    
    // Drop existing foreign keys for reviews table (reviewer_id)
    try {
      await sequelize.query(`ALTER TABLE reviews DROP FOREIGN KEY reviews_ibfk_2`);
      console.log('   ✓ Dropped reviews reviewer foreign key constraint');
    } catch (error) {
      console.log('   ⚠️ reviews_ibfk_2 constraint not found or already dropped');
    }
    
    // Drop existing foreign keys for otp_verifications table (user_id)
    try {
      await sequelize.query(`ALTER TABLE otp_verifications DROP FOREIGN KEY otp_verifications_ibfk_1`);
      console.log('   ✓ Dropped otp_verifications foreign key constraint');
    } catch (error) {
      console.log('   ⚠️ otp_verifications_ibfk_1 constraint not found or already dropped');
    }
    
    console.log('\\n📋 Step 2: Adding new CASCADE DELETE foreign key constraints...');
    
    // Add CASCADE DELETE for matches table (receiver_id)
    await sequelize.query(`
      ALTER TABLE matches 
      ADD CONSTRAINT fk_matches_receiver_cascade 
      FOREIGN KEY (receiver_id) REFERENCES users(user_id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('   ✓ Added matches receiver CASCADE DELETE constraint');
    
    // Add CASCADE DELETE for chats table (sender_id)
    await sequelize.query(`
      ALTER TABLE chats 
      ADD CONSTRAINT fk_chats_sender_cascade 
      FOREIGN KEY (sender_id) REFERENCES users(user_id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('   ✓ Added chats sender CASCADE DELETE constraint');
    
    // Add CASCADE DELETE for reviews table (reviewer_id)
    await sequelize.query(`
      ALTER TABLE reviews 
      ADD CONSTRAINT fk_reviews_reviewer_cascade 
      FOREIGN KEY (reviewer_id) REFERENCES users(user_id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('   ✓ Added reviews reviewer CASCADE DELETE constraint');
    
    // Add CASCADE DELETE for otp_verifications table (user_id)
    await sequelize.query(`
      ALTER TABLE otp_verifications 
      ADD CONSTRAINT fk_otp_verifications_user_cascade 
      FOREIGN KEY (user_id) REFERENCES users(user_id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    console.log('   ✓ Added otp_verifications CASCADE DELETE constraint');
    
    console.log('\\n🎉 CASCADE DELETE constraints successfully added!');
    console.log('\\n📋 Summary:');
    console.log('   ✓ matches table (receiver_id) - CASCADE DELETE enabled');
    console.log('   ✓ chats table (sender_id) - CASCADE DELETE enabled');
    console.log('   ✓ reviews table (reviewer_id) - CASCADE DELETE enabled');
    console.log('   ✓ otp_verifications table (user_id) - CASCADE DELETE enabled');
    
    console.log('\\n📝 Note: The following constraints already existed and have CASCADE DELETE:');
    console.log('   ✓ matches table (requester_id) - Already has CASCADE DELETE');
    console.log('   ✓ credits table (user_id) - Already has CASCADE DELETE');
    
    console.log('\\n🛡️ Now when you delete a user, all related data will be automatically deleted!');
    
  } catch (error) {
    console.error('❌ Error setting up CASCADE DELETE constraints:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the function
addCascadeDeleteConstraints()
  .then(() => {
    console.log('\\n✅ Process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\\n❌ Process failed:', error);
    process.exit(1);
  });