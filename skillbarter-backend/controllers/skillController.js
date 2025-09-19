const { db } = require('../models');
const { User, Skill, UserSkill } = db;

// Get all available skills
const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.findAll({
      order: [['skill_name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: skills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's skills
const getUserSkills = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const userSkills = await UserSkill.findAll({
      where: { user_id: userId },
      include: [{
        model: Skill,
        as: 'skill',
        attributes: ['skill_id', 'skill_name', 'category']
      }],
      order: [['skill_type', 'ASC'], ['id', 'ASC']]
    });

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
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user skills',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add skill to user's list
const addUserSkill = async (req, res) => {
  try {
    const { skill_id, skill_type } = req.body;
    const userId = req.user.user_id;

    // Validate required fields
    if (!skill_id || !skill_type) {
      return res.status(400).json({
        success: false,
        message: 'Skill ID and skill type are required'
      });
    }

    // Validate skill_type
    if (!['teach', 'learn'].includes(skill_type)) {
      return res.status(400).json({
        success: false,
        message: 'Skill type must be either "teach" or "learn"'
      });
    }

    // Check if skill exists
    const skill = await Skill.findByPk(skill_id);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if user already has this skill with the same type
    const existingUserSkill = await UserSkill.findOne({
      where: {
        user_id: userId,
        skill_id,
        skill_type
      }
    });

    if (existingUserSkill) {
      return res.status(400).json({
        success: false,
        message: `You already have this skill in your ${skill_type} list`
      });
    }

    // Create user skill
    const userSkill = await UserSkill.create({
      user_id: userId,
      skill_id,
      skill_type,
      verified: false
    });

    // Get the created user skill with skill details
    const createdUserSkill = await UserSkill.findByPk(userSkill.id, {
      include: [{
        model: Skill,
        as: 'skill',
        attributes: ['skill_id', 'skill_name', 'category']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: {
        id: createdUserSkill.id,
        skill_id: createdUserSkill.skill_id,
        name: createdUserSkill.skill.skill_name,
        skill_type: createdUserSkill.skill_type,
        category: createdUserSkill.skill.category,
        verified: createdUserSkill.verified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Remove skill from user's list
const removeUserSkill = async (req, res) => {
  try {
    const { userSkillId } = req.params;
    const userId = req.user.user_id;

    // Find the user skill
    const userSkill = await UserSkill.findOne({
      where: {
        id: userSkillId,
        user_id: userId
      }
    });

    if (!userSkill) {
      return res.status(404).json({
        success: false,
        message: 'User skill not found'
      });
    }

    await userSkill.destroy();

    res.status(200).json({
      success: true,
      message: 'Skill removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user skill
const updateUserSkill = async (req, res) => {
  try {
    const { userSkillId } = req.params;
    const { verified } = req.body;
    const userId = req.user.user_id;

    // Find the user skill
    const userSkill = await UserSkill.findOne({
      where: {
        id: userSkillId,
        user_id: userId
      }
    });

    if (!userSkill) {
      return res.status(404).json({
        success: false,
        message: 'User skill not found'
      });
    }

    // Update the user skill
    const updateData = {};
    if (verified !== undefined) updateData.verified = verified;

    await userSkill.update(updateData);

    // Get updated user skill with skill details
    const updatedUserSkill = await UserSkill.findByPk(userSkill.id, {
      include: [{
        model: Skill,
        as: 'skill',
        attributes: ['skill_id', 'skill_name', 'category']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: {
        id: updatedUserSkill.id,
        skill_id: updatedUserSkill.skill_id,
        name: updatedUserSkill.skill.skill_name,
        skill_type: updatedUserSkill.skill_type,
        category: updatedUserSkill.skill.category,
        verified: updatedUserSkill.verified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllSkills,
  getUserSkills,
  addUserSkill,
  removeUserSkill,
  updateUserSkill
};