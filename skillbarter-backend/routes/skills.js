const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.get('/all', skillController.getAllSkills);

// Protected routes (require authentication)
router.get('/my-skills', authMiddleware, skillController.getUserSkills);
router.post('/add', authMiddleware, skillController.addUserSkill);
router.put('/:userSkillId', authMiddleware, skillController.updateUserSkill);
router.delete('/:userSkillId', authMiddleware, skillController.removeUserSkill);

module.exports = router;