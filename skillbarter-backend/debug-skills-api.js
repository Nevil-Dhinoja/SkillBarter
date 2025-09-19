const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection } = require('./config/db');
const { syncDatabase } = require('./models/index');
const authMiddleware = require('./middlewares/authMiddleware');
const { db } = require('./models/index');
const { User, Skill, UserSkill } = db;

const app = express();
const PORT = 3001; // Different port to avoid conflicts

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Test route to debug the exact issue
app.get('/test-skills-api', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 Debug: req.user object:', req.user);
    console.log('🔍 Debug: req.user.user_id:', req.user.user_id);
    console.log('🔍 Debug: req.user.userId:', req.user.userId);
    
    const userId = req.user.user_id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request',
        debug: { user: req.user }
      });
    }

    console.log('🔍 Debug: Using userId:', userId);

    const userSkills = await UserSkill.findAll({
      where: { user_id: userId },
      include: [{
        model: Skill,
        as: 'skill',
        attributes: ['skill_id', 'skill_name', 'category']
      }],
      order: [['skill_type', 'ASC'], ['id', 'ASC']]
    });

    console.log('🔍 Debug: Query result:', userSkills.length, 'skills found');

    // Group skills by type
    const skillsToTeach = userSkills
      .filter(us => us.skill_type === 'teach')
      .map(us => ({
        id: us.id,
        skill_id: us.skill_id,
        name: us.skill.skill_name,
        category: us.skill.category,
        verified: us.verified
      }));

    const skillsToLearn = userSkills
      .filter(us => us.skill_type === 'learn')
      .map(us => ({
        id: us.id,
        skill_id: us.skill_id,
        name: us.skill.skill_name,
        category: us.skill.category,
        verified: us.verified
      }));

    res.status(200).json({
      success: true,
      data: {
        teach: skillsToTeach,
        learn: skillsToLearn
      },
      debug: {
        userId: userId,
        totalSkills: userSkills.length,
        teachCount: skillsToTeach.length,
        learnCount: skillsToLearn.length
      }
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user skills',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Test route without auth
app.get('/test-db', async (req, res) => {
  try {
    const skillCount = await Skill.count();
    const userSkillCount = await UserSkill.count();
    
    res.json({
      success: true,
      data: {
        skills: skillCount,
        userSkills: userSkillCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start test server
const startTestServer = async () => {
  try {
    await testConnection();
    await syncDatabase();
    
    app.listen(PORT, () => {
      console.log(`🧪 Test server running on port ${PORT}`);
      console.log(`📍 Test the auth endpoint: http://localhost:${PORT}/test-skills-api`);
      console.log(`📍 Test the DB endpoint: http://localhost:${PORT}/test-db`);
      console.log('');
      console.log('🔧 To test with a real JWT token:');
      console.log('curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3001/test-skills-api');
    });
  } catch (error) {
    console.error('❌ Failed to start test server:', error);
    process.exit(1);
  }
};

startTestServer();