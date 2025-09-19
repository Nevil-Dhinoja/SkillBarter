const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { db } = require('../models/index');
const { Op } = require('sequelize');

const { Message, User } = db;

// Get conversation between two users
router.get('/conversation/:user_id', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.user_id;
    const otherUserId = parseInt(req.params.user_id);

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          {
            sender_id: currentUserId,
            receiver_id: otherUserId
          },
          {
            sender_id: otherUserId,
            receiver_id: currentUserId
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['user_id', 'full_name']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['user_id', 'full_name']
        }
      ],
      order: [['sent_at', 'ASC']]
    });

    // Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.id.toString(),
      fromMe: msg.sender_id === currentUserId,
      text: msg.message_text,
      at: new Date(msg.sent_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      timestamp: msg.sent_at
    }));

    res.json({
      success: true,
      data: formattedMessages
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
});

// Send a message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { receiver_id, message_text } = req.body;
    const sender_id = req.user.user_id;

    if (!receiver_id || !message_text || !message_text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and message text are required'
      });
    }

    // Check if receiver exists
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create message
    const message = await Message.create({
      sender_id,
      receiver_id,
      message_text: message_text.trim(),
      sent_at: new Date()
    });

    // Get sender info for response
    const sender = await User.findByPk(sender_id, {
      attributes: ['user_id', 'full_name']
    });

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: message.id,
        sender_id,
        receiver_id,
        message_text: message.message_text,
        sent_at: message.sent_at,
        sender: sender
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Update a message (only the sender can update their own message)
router.put('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message_text } = req.body;
    const userId = req.user.user_id;

    if (!message_text || !message_text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    // Find the message
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender of the message
    if (message.sender_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own messages.'
      });
    }

    // Update the message
    await message.update({
      message_text: message_text.trim()
    });

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: {
        id: message.id,
        message_text: message.message_text,
        updated_at: message.updated_at || message.sent_at
      }
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message'
    });
  }
});

// Delete a message (only the sender can delete their own message)
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.user_id;

    // Find the message
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender of the message
    if (message.sender_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own messages.'
      });
    }

    // Delete the message
    await message.destroy();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

// Get all conversations for a user (with last message)
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const conversations = await db.sequelize.query(`
      SELECT 
        u.user_id,
        u.full_name,
        u.profile_picture,
        m.message_text as last_message,
        m.sent_at as last_message_time,
        CASE 
          WHEN m.sender_id = ? THEN true 
          ELSE false 
        END as last_message_from_me
      FROM users u
      INNER JOIN (
        SELECT 
          CASE 
            WHEN sender_id = ? THEN receiver_id 
            ELSE sender_id 
          END as other_user_id,
          MAX(sent_at) as latest_time
        FROM messages 
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY other_user_id
      ) latest ON u.user_id = latest.other_user_id
      INNER JOIN messages m ON (
        (m.sender_id = ? AND m.receiver_id = u.user_id) OR 
        (m.sender_id = u.user_id AND m.receiver_id = ?)
      ) AND m.sent_at = latest.latest_time
      ORDER BY m.sent_at DESC
    `, {
      replacements: [user_id, user_id, user_id, user_id, user_id, user_id],
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

module.exports = router;