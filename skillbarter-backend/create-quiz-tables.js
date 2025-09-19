const { sequelize } = require('./config/db');

const createQuizTables = async () => {
  try {
    console.log('🔧 Creating quiz tables...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check if skills table exists
    try {
      await sequelize.query("DESCRIBE skills");
      console.log('✅ Skills table exists');
    } catch (error) {
      console.log('❌ Skills table does not exist. Please run the database setup first.');
      return;
    }
    
    // Create quizzes table
    console.log('📋 Creating quizzes table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        skill_id INT NOT NULL,
        created_by INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    
    // Create quiz_questions table
    console.log('📋 Creating quiz_questions table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        question_text TEXT NOT NULL,
        option1 VARCHAR(255) NOT NULL,
        option2 VARCHAR(255) NOT NULL,
        option3 VARCHAR(255) NOT NULL,
        option4 VARCHAR(255) NOT NULL,
        correct_option INT NOT NULL,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `);
    
    // Create quiz_results table
    console.log('📋 Creating quiz_results table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id INT NOT NULL,
        user_id INT NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        status ENUM('completed', 'in_progress', 'abandoned') DEFAULT 'in_progress',
        taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    
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
    
    console.log('✅ All quiz-related tables created successfully!');
    
  } catch (error) {
    console.error('❌ Failed to create quiz tables:', error);
    throw error;
  }
};

const runSetup = async () => {
  try {
    await createQuizTables();
    process.exit(0);
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runSetup();
}

module.exports = createQuizTables;