const { sequelize } = require('./config/db');

const setupQuizAssignmentsTable = async () => {
  try {
    console.log('🔧 Setting up quiz_assignments table...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create quiz_assignments table
    console.log('📋 Creating quiz_assignments table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS quiz_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        assigned_by INT NOT NULL,
        assigned_to INT NOT NULL,
        message TEXT,
        status ENUM('pending', 'completed') DEFAULT 'pending',
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_assignment (quiz_id, assigned_by, assigned_to)
      )
    `);
    
    console.log('✅ Quiz assignments table created successfully!');
    
  } catch (error) {
    console.error('❌ Failed to create quiz assignments table:', error);
    throw error;
  }
};

const runSetup = async () => {
  try {
    await setupQuizAssignmentsTable();
    process.exit(0);
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runSetup();
}

module.exports = setupQuizAssignmentsTable;