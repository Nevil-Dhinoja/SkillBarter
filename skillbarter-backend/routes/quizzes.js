const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const { createQuiz, getMyQuizzes, getQuizStatus, saveQuizResult, assignQuiz, getAssignedQuizzes, getAssignedByMe, updateQuiz, getAllQuizzes, getPublicQuizzes, deleteQuiz, getQuizPerformance } = require('../controllers/quizController');

// Create a new quiz
router.post('/', authMiddleware, createQuiz);

// Get quizzes created by the current user
router.get('/my', authMiddleware, getMyQuizzes);

// Get quiz status for current user
router.get('/:quizId/status', authMiddleware, getQuizStatus);

// Save quiz result
router.post('/results', authMiddleware, saveQuizResult);

// Assign a quiz to a friend
router.post('/assign', authMiddleware, assignQuiz);

// Get quizzes assigned to the current user
router.get('/assigned', authMiddleware, getAssignedQuizzes);

// Get quizzes assigned by the current user
router.get('/assigned-by-me', authMiddleware, getAssignedByMe);

// Update a quiz
router.put('/:quizId', authMiddleware, updateQuiz);

// Get all quizzes (admin only)
router.get('/all', authMiddleware, adminMiddleware, getAllQuizzes);

// Get public quizzes (admin-created quizzes visible to all)
router.get('/public', authMiddleware, getPublicQuizzes);

// Get quiz performance analysis
router.get('/performance', authMiddleware, getQuizPerformance);

// Delete a quiz
router.delete('/:quizId', authMiddleware, deleteQuiz);

module.exports = router;