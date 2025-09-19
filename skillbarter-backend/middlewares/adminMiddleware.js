const { db } = require('../models');
const { User } = db;

// List of admin emails
const ADMIN_EMAILS = ['admin@skillbarter.com'];

const adminMiddleware = async (req, res, next) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.user_id;
    
    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(user.email);
    
    // For admin-only routes, deny access if not admin
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
      });
    }
    
    // Add isAdmin flag to request
    req.isAdmin = isAdmin;
    req.user.isAdmin = isAdmin;
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin check failed'
    });
  }
};

module.exports = adminMiddleware;