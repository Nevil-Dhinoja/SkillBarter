const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { db } = require('../models');
const emailService = require('../services/emailService');
const fs = require('fs');
const path = require('path');

const { User, OtpVerification } = db;

// Register user with OTP verification
const register = async (req, res) => {
  try {
    const { full_name, email, password, location, bio } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user (unverified)
    const user = await User.create({
      full_name,
      email,
      password_hash,
      location,
      bio
    });

    // Delete any existing OTP for this email
    await OtpVerification.destroy({
      where: { email, otp_type: 'registration' }
    });

    // Generate and save OTP
    const otpCode = emailService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OtpVerification.create({
      user_id: user.user_id,
      email,
      otp_code: otpCode,
      otp_type: 'registration',
      expires_at: expiresAt
    });

    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otpCode, 'registration');

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for the OTP.',
      data: {
        user_id: user.user_id,
        email: user.email,
        otp_sent: emailResult.success
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp_code } = req.body;

    if (!email || !otp_code) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required'
      });
    }

    // Find OTP record
    const otpRecord = await OtpVerification.findOne({
      where: {
        email,
        otp_code,
        otp_type: 'registration',
        is_verified: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as verified
    await otpRecord.update({ is_verified: true });

    // Get user data
    const user = await User.findByPk(otpRecord.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now use the platform.',
      data: {
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          location: user.location,
          bio: user.bio,
          profile_picture: user.profile_picture
        },
        token,
        verified: true
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already verified
    const existingVerified = await OtpVerification.findOne({
      where: { email, otp_type: 'registration', is_verified: true }
    });
    
    if (existingVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Delete existing unverified OTP
    await OtpVerification.destroy({
      where: { email, otp_type: 'registration', is_verified: false }
    });

    // Generate new OTP
    const otpCode = emailService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpVerification.create({
      user_id: user.user_id,
      email,
      otp_code: otpCode,
      otp_type: 'registration',
      expires_at: expiresAt
    });

    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otpCode, 'registration');
    
    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email',
      data: { 
        otp_sent: emailResult.success,
        email: email
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user has verified their email
    const verifiedOTP = await OtpVerification.findOne({
      where: {
        email,
        otp_type: 'registration',
        is_verified: true
      }
    });

    if (!verifiedOTP) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the OTP code.',
        requiresVerification: true
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id, 
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          location: user.location,
          bio: user.bio,
          profile_picture: user.profile_picture
        },
        token
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { full_name, bio, location } = req.body;
    
    const userId = req.user.userId;
    
    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user data
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;

    // Handle profile picture upload
    if (req.file) {
      // Delete old profile picture if it exists
      if (user.profile_picture) {
        const oldPicturePath = path.join(__dirname, '../uploads', path.basename(user.profile_picture));
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }
      
      // Set new profile picture URL
      updateData.profile_picture = `/uploads/${req.file.filename}`;
    }

    await user.update(updateData);

    // Get updated user data (excluding password)
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reset password for logged-in users (Settings page)
const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await user.update({ password_hash: newPasswordHash });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Forgot password - send OTP to email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Delete any existing password reset OTP
    await OtpVerification.destroy({
      where: { email, otp_type: 'password_reset' }
    });

    // Generate new OTP
    const otpCode = emailService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OtpVerification.create({
      user_id: user.user_id,
      email,
      otp_code: otpCode,
      otp_type: 'password_reset',
      expires_at: expiresAt
    });

    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otpCode, 'password_reset');
    
    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email',
      data: { 
        otp_sent: emailResult.success,
        email: email
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send password reset OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify password reset OTP and reset password
const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { email, otp_code, newPassword } = req.body;

    if (!email || !otp_code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP code, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find OTP record
    const otpRecord = await OtpVerification.findOne({
      where: {
        email,
        otp_code,
        otp_type: 'password_reset',
        is_verified: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Find user
    const user = await User.findByPk(otpRecord.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and mark OTP as verified
    await user.update({ password_hash: newPasswordHash });
    await otpRecord.update({ is_verified: true });

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  getCurrentUser,
  updateProfile,
  resetPassword,
  forgotPassword,
  verifyPasswordResetOTP
};