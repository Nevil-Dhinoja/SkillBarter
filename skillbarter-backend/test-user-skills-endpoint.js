const { db } = require('./models');
const { User, Skill, UserSkill } = db;

const testGetUserSkills = async () => {
  try {
    console.log('🔍 Testing getUserSkills functionality...');
    
    // Get a sample user from the database
    const sampleUser = await User.findOne({
      limit: 1,
      order: [['user_id', 'ASC']]
    });
    
    if (!sampleUser) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('👤 Testing with user:', {
      user_id: sampleUser.user_id,
      full_name: sampleUser.full_name,
      email: sampleUser.email
    });
    
    // Test the query that's failing in the controller
    console.log('🔍 Testing UserSkill.findAll query...');
    
    const userSkills = await UserSkill.findAll({
      where: { user_id: sampleUser.user_id },
      include: [{
        model: Skill,
        as: 'skill',
        attributes: ['skill_id', 'skill_name', 'category']
      }],
      order: [['skill_type', 'ASC'], ['id', 'ASC']]
    });
    
    console.log('📊 Raw userSkills result:', JSON.stringify(userSkills, null, 2));
    
    // Process like the controller does
    const skillsToTeach = userSkills
      .filter(us => us.skill_type === 'teach')
      .map(us => ({
        id: us.id,
        skill_id: us.skill_id,
        name: us.skill?.skill_name,
        category: us.skill?.category,
        verified: us.verified
      }));

    const skillsToLearn = userSkills
      .filter(us => us.skill_type === 'learn')
      .map(us => ({
        id: us.id,
        skill_id: us.skill_id,
        name: us.skill?.skill_name,
        category: us.skill?.category,
        verified: us.verified
      }));
    
    console.log('📚 Skills to teach:', skillsToTeach);
    console.log('🎯 Skills to learn:', skillsToLearn);
    
    const result = {
      success: true,
      data: {
        teach: skillsToTeach,
        learn: skillsToLearn
      }
    };
    
    console.log('✅ Final result:', JSON.stringify(result, null, 2));
    console.log('🎉 getUserSkills test completed successfully!');
    
  } catch (error) {
    console.error('❌ getUserSkills test failed:', error);
    console.error('Error stack:', error.stack);
  } finally {
    process.exit(0);
  }
};

testGetUserSkills();