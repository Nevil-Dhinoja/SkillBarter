const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser, addSkill, updateSkill, deleteSkill } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Protected routes (require authentication)
router.get('/all', authMiddleware, getAllUsers);
router.get('/:userId', authMiddleware, getUserById);
router.put('/:userId', authMiddleware, updateUser);

// Admin routes (require admin privileges)
router.delete('/:userId', authMiddleware, adminMiddleware, deleteUser);
router.post('/skills', authMiddleware, adminMiddleware, addSkill);
router.put('/skills/:skillId', authMiddleware, adminMiddleware, updateSkill);
router.delete('/skills/:skillId', authMiddleware, adminMiddleware, deleteSkill);

module.exports = router;