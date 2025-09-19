const { db } = require('../models');
const { Quiz, QuizQuestion, QuizResult, QuizAssignment, User } = db;

// Create a new quiz
const createQuiz = async (req, res) => {
  try {
    const { skill, questions } = req.body;
    const created_by = req.user.user_id;

    // Validate required fields
    if (!skill || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Skill and questions are required'
      });
    }

    // Validate each question
    for (const question of questions) {
      if (!question.text || !Array.isArray(question.options) || question.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have text and at least 2 options'
        });
      }
      
      if (question.correct === undefined || question.correct < 0 || question.correct >= question.options.length) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have a valid correct option'
        });
      }
    }

    // Create the quiz
    const quiz = await Quiz.create({
      skill_id: 1, // Default skill ID, you might want to look this up properly
      created_by,
      title: skill
    });

    // Create the questions
    const quizQuestions = questions.map(question => ({
      quiz_id: quiz.id,
      question_text: question.text,
      option1: question.options[0] || '',
      option2: question.options[1] || '',
      option3: question.options[2] || '',
      option4: question.options[3] || '',
      correct_option: question.correct
    }));

    await QuizQuestion.bulkCreate(quizQuestions);

    // Return the created quiz
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: {
        id: quiz.id,
        skill,
        questions
      }
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get quizzes created by the current user
const getMyQuizzes = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Check if user is admin
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    const currentUser = await User.findByPk(userId);
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email);

    // Build query conditions
    const whereConditions = {
      created_by: userId
    };
    
    // If user is admin, also include admin-created quizzes for all users to see
    if (isAdmin) {
      // For admins, we might want to show all quizzes in a different endpoint
      // But for getMyQuizzes, we still only show quizzes created by the current user
    }

    const quizzes = await Quiz.findAll({
      where: whereConditions,
      include: [{
        model: QuizQuestion,
        as: 'questions',
        attributes: ['id', 'question_text', 'option1', 'option2', 'option3', 'option4', 'correct_option']
      }],
      order: [['created_at', 'DESC']]
    });

    // Format the quizzes for the frontend
    const formattedQuizzes = quizzes.map(quiz => ({
      id: quiz.id,
      skill: quiz.title,
      questions: quiz.questions.map(q => ({
        id: q.id,
        text: q.question_text,
        options: [q.option1, q.option2, q.option3, q.option4],
        correct: q.correct_option
      }))
    }));

    res.json({
      success: true,
      data: formattedQuizzes
    });
  } catch (error) {
    console.error('Get my quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get quiz status for current user
const getQuizStatus = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.user_id;

    // Check if a result already exists for this user and quiz
    const existingResult = await QuizResult.findOne({
      where: {
        quiz_id: quizId,
        user_id: userId
      }
    });

    if (existingResult) {
      res.json({
        status: existingResult.status,
        score: parseFloat(existingResult.score),
        taken_at: existingResult.taken_at,
        completed_at: existingResult.completed_at
      });
    } else {
      res.json({
        status: 'not_started'
      });
    }
  } catch (error) {
    console.error('Get quiz status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Save quiz result
const saveQuizResult = async (req, res) => {
  try {
    const { quiz_id, score } = req.body;
    const user_id = req.user.user_id;

    // Validate required fields
    if (!quiz_id || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and score are required'
      });
    }

    // Check if the quiz exists
    const quiz = await Quiz.findByPk(quiz_id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if a result already exists for this user and quiz
    const existingResult = await QuizResult.findOne({
      where: {
        quiz_id,
        user_id
      }
    });

    let result;
    const now = new Date();
    
    if (existingResult) {
      // If already completed, don't allow resubmission
      if (existingResult.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'You have already completed this quiz'
        });
      }
      
      // Update existing result (in progress -> completed)
      result = await existingResult.update({
        score,
        status: 'completed',
        completed_at: now
      });
    } else {
      // Create new result
      result = await QuizResult.create({
        quiz_id,
        user_id,
        score,
        status: 'completed',
        taken_at: now,
        completed_at: now
      });
    }

    res.status(201).json({
      success: true,
      message: 'Quiz result saved successfully',
      data: {
        id: result.id,
        quiz_id: result.quiz_id,
        user_id: result.user_id,
        score: parseFloat(result.score),
        status: result.status,
        taken_at: result.taken_at,
        completed_at: result.completed_at
      }
    });
  } catch (error) {
    console.error('Save quiz result error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save quiz result',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Assign a quiz to a friend
const assignQuiz = async (req, res) => {
  try {
    const { quiz_id, assigned_to, message } = req.body;
    const assigned_by = req.user.user_id;

    console.log('Assignment request data:', { quiz_id, assigned_to, assigned_by, message });

    // Validate required fields
    if (!quiz_id || !assigned_to) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID and assigned user ID are required'
      });
    }

    // Check if the quiz exists
    const quiz = await Quiz.findByPk(quiz_id);
    if (!quiz) {
      console.log('Quiz not found:', quiz_id);
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if the assigned user exists
    const assignee = await User.findByPk(assigned_to);
    if (!assignee) {
      console.log('Assignee not found:', assigned_to);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if trying to assign to self
    if (assigned_by === assigned_to) {
      return res.status(400).json({
        success: false,
        message: 'You cannot assign a quiz to yourself'
      });
    }

    // Check if trying to assign to admin
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    if (ADMIN_EMAILS.includes(assignee.email)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot assign a quiz to an admin user'
      });
    }

    // Check if assignment already exists
    const existingAssignment = await QuizAssignment.findOne({
      where: {
        quiz_id,
        assigned_by,
        assigned_to
      }
    });

    if (existingAssignment) {
      console.log('Quiz already assigned to this user:', { quiz_id, assigned_by, assigned_to });
      return res.status(400).json({
        success: false,
        message: 'This quiz is already assigned to this user'
      });
    }

    // Create the assignment
    const assignment = await QuizAssignment.create({
      quiz_id,
      assigned_by,
      assigned_to,
      message: message || '',
      status: 'pending'
    });

    // Get assigner and assignee details for the response
    const assigner = await User.findByPk(assigned_by, {
      attributes: ['user_id', 'full_name']
    });

    const assigneeDetails = await User.findByPk(assigned_to, {
      attributes: ['user_id', 'full_name']
    });

    res.status(201).json({
      success: true,
      message: 'Quiz assigned successfully',
      data: {
        id: assignment.id,
        quiz_id: assignment.quiz_id,
        assigner: assigner,
        assignee: assigneeDetails,
        message: assignment.message,
        status: assignment.status,
        assigned_at: assignment.assigned_at
      }
    });
  } catch (error) {
    console.error('Assign quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign quiz: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get quizzes assigned to the current user
const getAssignedQuizzes = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const assignments = await QuizAssignment.findAll({
      where: {
        assigned_to: userId
      },
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'skill_id', 'title', 'created_at'],
          include: [{
            model: QuizQuestion,
            as: 'questions',
            attributes: ['id', 'question_text', 'option1', 'option2', 'option3', 'option4', 'correct_option']
          }]
        },
        {
          model: User,
          as: 'assigner',
          attributes: ['user_id', 'full_name']
        }
      ],
      order: [['assigned_at', 'DESC']]
    });

    // Format the assignments for the frontend
    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      quiz_id: assignment.quiz_id,
      skill: assignment.quiz.title,
      questions: assignment.quiz.questions.map(q => ({
        id: q.id,
        text: q.question_text,
        options: [q.option1, q.option2, q.option3, q.option4],
        correct: q.correct_option
      })),
      assigner: assignment.assigner,
      message: assignment.message,
      status: assignment.status,
      assigned_at: assignment.assigned_at
    }));

    res.json({
      success: true,
      data: formattedAssignments
    });
  } catch (error) {
    console.error('Get assigned quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get quizzes assigned by the current user
const getAssignedByMe = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const assignments = await QuizAssignment.findAll({
      where: {
        assigned_by: userId
      },
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'skill_id', 'title', 'created_at']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['user_id', 'full_name']
        }
      ],
      order: [['assigned_at', 'DESC']]
    });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Get assigned by me quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a quiz (only the creator or admin can update)
const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { skill, questions } = req.body;
    const userId = req.user.user_id;

    // Find the quiz
    const quiz = await Quiz.findByPk(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user is admin or the creator of the quiz
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    const currentUser = await User.findByPk(userId);
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email);
    
    // Only admins or the quiz creator can update the quiz
    if (quiz.created_by !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own quizzes or you must be an admin.'
      });
    }

    // Validate required fields
    if (!skill || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Skill and questions are required'
      });
    }

    // Validate each question
    for (const question of questions) {
      if (!question.text || !Array.isArray(question.options) || question.options.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have text and at least 2 options'
        });
      }
      
      if (question.correct === undefined || question.correct < 0 || question.correct >= question.options.length) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have a valid correct option'
        });
      }
    }

    // Update the quiz
    await quiz.update({
      title: skill
    });

    // Delete existing questions
    await QuizQuestion.destroy({
      where: {
        quiz_id: quizId
      }
    });

    // Create new questions
    const quizQuestions = questions.map(question => ({
      quiz_id: quiz.id,
      question_text: question.text,
      option1: question.options[0] || '',
      option2: question.options[1] || '',
      option3: question.options[2] || '',
      option4: question.options[3] || '',
      correct_option: question.correct
    }));

    await QuizQuestion.bulkCreate(quizQuestions);

    // Return the updated quiz
    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: {
        id: quiz.id,
        skill,
        questions
      }
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get public quizzes (admin-created quizzes visible to all users)
const getPublicQuizzes = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Check if user is admin
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    const currentUser = await User.findByPk(userId);
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email);
    
    // For all users, show admin-created quizzes + their own quizzes
    // First, get admin user IDs
    const adminUsers = await User.findAll({
      where: {
        email: ADMIN_EMAILS
      },
      attributes: ['user_id']
    });
    
    const adminUserIds = adminUsers.map(admin => admin.user_id);
    
    // Include current user's own quizzes
    const quizCreatorIds = [...adminUserIds, userId];
    
    const quizzes = await Quiz.findAll({
      where: {
        created_by: quizCreatorIds
      },
      include: [{
        model: QuizQuestion,
        as: 'questions',
        attributes: ['id', 'question_text', 'option1', 'option2', 'option3', 'option4', 'correct_option']
      },
      {
        model: User,
        as: 'creator',
        attributes: ['user_id', 'full_name']
      }],
      order: [['created_at', 'DESC']]
    });

    // Format the quizzes for the frontend
    const formattedQuizzes = quizzes.map(quiz => ({
      id: quiz.id,
      skill: quiz.title,
      creator: quiz.creator,
      questions: quiz.questions.map(q => ({
        id: q.id,
        text: q.question_text,
        options: [q.option1, q.option2, q.option3, q.option4],
        correct: q.correct_option
      }))
    }));

    res.json({
      success: true,
      data: formattedQuizzes
    });
  } catch (error) {
    console.error('Get public quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all quizzes (admin-only endpoint)
const getAllQuizzes = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Check if user is admin
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    const currentUser = await User.findByPk(userId);
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email);
    
    // Only admins can access this endpoint
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
      });
    }
    
    // Get all quizzes with creator information
    const quizzes = await Quiz.findAll({
      include: [{
        model: QuizQuestion,
        as: 'questions',
        attributes: ['id', 'question_text', 'option1', 'option2', 'option3', 'option4', 'correct_option']
      },
      {
        model: User,
        as: 'creator',
        attributes: ['user_id', 'full_name']
      }],
      order: [['created_at', 'DESC']]
    });

    // Format the quizzes for the frontend
    const formattedQuizzes = quizzes.map(quiz => ({
      id: quiz.id,
      skill: quiz.title,
      creator: quiz.creator,
      questions: quiz.questions.map(q => ({
        id: q.id,
        text: q.question_text,
        options: [q.option1, q.option2, q.option3, q.option4],
        correct: q.correct_option
      }))
    }));

    res.json({
      success: true,
      data: formattedQuizzes
    });
  } catch (error) {
    console.error('Get all quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all quizzes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a quiz
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.user_id;

    // Find the quiz
    const quiz = await Quiz.findByPk(quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user is admin or the creator of the quiz
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    const currentUser = await User.findByPk(userId);
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email);
    
    // Only admins or the quiz creator can delete the quiz
    if (quiz.created_by !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own quizzes or you must be an admin.'
      });
    }

    // Delete the quiz (this will cascade delete questions due to foreign key constraints)
    await quiz.destroy();

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get quiz performance analysis data
const getQuizPerformance = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Check if user is admin
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    const currentUser = await User.findByPk(userId);
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email);
    
    let quizzesWithPerformance = [];
    
    if (isAdmin) {
      // For admins, get all quizzes with performance data
      quizzesWithPerformance = await Quiz.findAll({
        include: [
          {
            model: QuizQuestion,
            as: 'questions',
            attributes: ['id', 'question_text']
          },
          {
            model: QuizResult,
            as: 'results',
            attributes: ['id', 'user_id', 'score', 'taken_at', 'completed_at']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['user_id', 'full_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });
    } else {
      // For regular users, get only their quizzes with performance data
      quizzesWithPerformance = await Quiz.findAll({
        where: {
          created_by: userId
        },
        include: [
          {
            model: QuizQuestion,
            as: 'questions',
            attributes: ['id', 'question_text']
          },
          {
            model: QuizResult,
            as: 'results',
            attributes: ['id', 'user_id', 'score', 'taken_at', 'completed_at']
          }
        ],
        order: [['created_at', 'DESC']]
      });
    }

    // Process the data for the frontend
    const processedData = quizzesWithPerformance.map(quiz => {
      const results = quiz.results || [];
      
      // Calculate statistics
      const totalAttempts = results.length;
      const averageScore = totalAttempts > 0 
        ? results.reduce((sum, result) => sum + parseFloat(result.score), 0) / totalAttempts 
        : 0;
      
      // Score distribution
      const scoreDistribution = {
        '0-20': 0,
        '21-40': 0,
        '41-60': 0,
        '61-80': 0,
        '81-100': 0
      };
      
      results.forEach(result => {
        const score = parseFloat(result.score);
        if (score <= 20) scoreDistribution['0-20']++;
        else if (score <= 40) scoreDistribution['21-40']++;
        else if (score <= 60) scoreDistribution['41-60']++;
        else if (score <= 80) scoreDistribution['61-80']++;
        else scoreDistribution['81-100']++;
      });
      
      return {
        id: quiz.id,
        title: quiz.title,
        creator: isAdmin && quiz.creator ? quiz.creator.full_name : undefined,
        questionsCount: quiz.questions ? quiz.questions.length : 0,
        totalAttempts,
        averageScore: parseFloat(averageScore.toFixed(2)),
        scoreDistribution
      };
    });

    res.json({
      success: true,
      data: processedData
    });
  } catch (error) {
    console.error('Get quiz performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz performance data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createQuiz,
  getMyQuizzes,
  getQuizStatus,
  saveQuizResult,
  assignQuiz,
  getAssignedQuizzes,
  getAssignedByMe,
  updateQuiz,
  getAllQuizzes,
  getPublicQuizzes,
  deleteQuiz,
  getQuizPerformance
};