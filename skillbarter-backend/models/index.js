const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

// Import models that match your actual database tables
const User = require('./User')(sequelize, DataTypes);
const Skill = require('./Skill')(sequelize, DataTypes);
const UserSkill = require('./UserSkill')(sequelize, DataTypes);
const Match = require('./Match')(sequelize, DataTypes);
const Chat = require('./Chat')(sequelize, DataTypes);
const Credit = require('./Credit')(sequelize, DataTypes);
const Review = require('./Review')(sequelize, DataTypes);
const OtpVerification = require('./OtpVerification')(sequelize, DataTypes);
const FriendRequest = require('./FriendRequest')(sequelize, DataTypes);
const Message = require('./Message')(sequelize, DataTypes);
const Quiz = require('./Quiz')(sequelize, DataTypes);
const QuizQuestion = require('./QuizQuestion')(sequelize, DataTypes);
const QuizResult = require('./QuizResult')(sequelize, DataTypes);
const QuizAssignment = require('./QuizAssignment')(sequelize, DataTypes);

const db = {
  sequelize,
  Sequelize: require('sequelize'),
  User,
  Skill,
  UserSkill,
  Match,
  Chat,
  Credit,
  Review,
  OtpVerification,
  FriendRequest,
  Message,
  Quiz,
  QuizQuestion,
  QuizResult,
  QuizAssignment
};

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Sync database
const syncDatabase = async (options = {}) => {
  try {
    console.log('📋 Synchronizing database tables...');
    
    try {
      // First try to sync with alter to add any new tables/columns
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized successfully with alter.');
    } catch (alterError) {
      console.log('⚠️ Alter sync failed, falling back to safe mode...');
      console.log('Error:', alterError.message);
      
      // Fall back to just validating the connection without altering tables
      await sequelize.authenticate();
      console.log('✅ Database connection validated. Using existing table structure.');
    }
    
    console.log('✅ Database setup completed. All tables are ready.');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  }
};

module.exports = { db, syncDatabase };