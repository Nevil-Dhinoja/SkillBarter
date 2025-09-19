const { db } = require('../models');
const { User, UserSkill, Skill } = db;

// Get all users - modified to show all users to admin and hide admins from regular users
const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.user_id;
    
    // Check if user is admin
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    const currentUser = await User.findByPk(currentUserId);
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email);

    // Build query conditions
    const whereConditions = {};
    
    if (isAdmin) {
      // Admins see all users including themselves
      // No additional where conditions needed
    } else {
      // Regular users should not see themselves or admins
      whereConditions.user_id = {
        [require('sequelize').Op.ne]: currentUserId, // Exclude current user
        [require('sequelize').Op.notIn]: require('sequelize').literal(`(SELECT user_id FROM users WHERE email IN ('${ADMIN_EMAILS.join("','")}'))`) // Exclude admins
      };
    }

    const users = await User.findAll({
      where: whereConditions,
      attributes: {
        exclude: ['password_hash'] // Don't return password
      },
      include: [{
        model: UserSkill,
        as: 'userSkills',
        include: [{
          model: Skill,
          as: 'skill',
          attributes: ['skill_id', 'skill_name', 'category']
        }]
      }],
      order: [['created_at', 'DESC']]
    });

    // Transform the data to include teach/learn skills
    const transformedUsers = users.map(user => {
      const userSkills = user.userSkills || [];
      
      const skillsToTeach = userSkills
        .filter(us => us.skill_type === 'teach')
        .map(us => us.skill.skill_name);
      
      const skillsToLearn = userSkills
        .filter(us => us.skill_type === 'learn')
        .map(us => us.skill.skill_name);

      return {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        location: user.location,
        bio: user.bio,
        profile_picture: user.profile_picture,
        created_at: user.created_at,
        updated_at: user.updated_at,
        skillsToTeach,
        skillsToLearn
      };
    });

    res.status(200).json({
      success: true,
      data: transformedUsers
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user by ID with skills
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.user_id;

    if (parseInt(userId) === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot view your own profile through this endpoint'
      });
    }

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ['password_hash']
      },
      include: [{
        model: UserSkill,
        as: 'userSkills',
        include: [{
          model: Skill,
          as: 'skill',
          attributes: ['skill_id', 'skill_name', 'category']
        }]
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Transform the skills data
    const userSkills = user.userSkills || [];
    const skillsToTeach = userSkills
      .filter(us => us.skill_type === 'teach')
      .map(us => us.skill.skill_name);
    
    const skillsToLearn = userSkills
      .filter(us => us.skill_type === 'learn')
      .map(us => us.skill.skill_name);

    const userData = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      location: user.location,
      bio: user.bio,
      profile_picture: user.profile_picture,
      created_at: user.created_at,
      updated_at: user.updated_at,
      skillsToTeach,
      skillsToLearn
    };

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user (admin can update any user, regular users can update themselves)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, email, location, bio } = req.body;
    const currentUserId = req.user.user_id;

    // Check if user is admin
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    const currentUser = await User.findByPk(currentUserId);
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email);
    
    // Check if user is trying to update themselves or is admin
    if (parseInt(userId) !== currentUserId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
    }

    // Find the user to update
    const userToUpdate = await User.findByPk(userId);
    
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update the user
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;

    await userToUpdate.update(updateData);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user_id: userToUpdate.user_id,
        full_name: userToUpdate.full_name,
        email: userToUpdate.email,
        location: userToUpdate.location,
        bio: userToUpdate.bio,
        updated_at: userToUpdate.updated_at
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.user_id;

    // Check if user is admin
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    const currentUser = await User.findByPk(currentUserId);
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email);
    
    // Only admins can delete users
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
      });
    }

    // Prevent admin from deleting themselves
    if (parseInt(userId) === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.'
      });
    }

    // Find the user to delete
    const userToDelete = await User.findByPk(userId);
    
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete the user
    await userToDelete.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add skill (admin only)
const addSkill = async (req, res) => {
  try {
    const { name, category } = req.body;
    const currentUserId = req.user.user_id;

    // Check if user is admin
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    const currentUser = await User.findByPk(currentUserId);
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email);
    
    // Only admins can add skills
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
      });
    }

    // Validate required fields
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }

    // Check if skill already exists
    const existingSkill = await Skill.findOne({
      where: {
        skill_name: name
      }
    });

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'This skill already exists'
      });
    }

    // Create the skill
    const skill = await Skill.create({
      skill_name: name,
      category: category || 'General'
    });

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: skill
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update skill (admin only)
const updateSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { name, category } = req.body;
    const currentUserId = req.user.user_id;

    // Check if user is admin
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    const currentUser = await User.findByPk(currentUserId);
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email);
    
    // Only admins can update skills
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
      });
    }

    // Find the skill to update
    const skillToUpdate = await Skill.findByPk(skillId);
    
    if (!skillToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Check if new skill name already exists (and it's not the same skill)
    if (name && name !== skillToUpdate.skill_name) {
      const existingSkill = await Skill.findOne({
        where: {
          skill_name: name
        }
      });

      if (existingSkill) {
        return res.status(400).json({
          success: false,
          message: 'A skill with this name already exists'
        });
      }
    }

    // Update the skill
    const updateData = {};
    if (name !== undefined) updateData.skill_name = name;
    if (category !== undefined) updateData.category = category;

    await skillToUpdate.update(updateData);

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: skillToUpdate
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete skill (admin only)
const deleteSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const currentUserId = req.user.user_id;

    // Check if user is admin
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    const currentUser = await User.findByPk(currentUserId);
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email);
    
    // Only admins can delete skills
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
      });
    }

    // Find the skill to delete
    const skillToDelete = await Skill.findByPk(skillId);
    
    if (!skillToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    // Delete the skill
    await skillToDelete.destroy();

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete skill',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  addSkill,
  updateSkill,
  deleteSkill
};