const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { db } = require('../models/index');
const { Op } = require('sequelize');

// Import admin middleware
const adminMiddleware = require('../middlewares/adminMiddleware');

const { FriendRequest, User } = db;

// Send friend request
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    const sender_id = req.user.user_id;

    // Check if users are trying to send request to themselves
    if (sender_id === receiver_id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a friend request to yourself'
      });
    }

    // Check if receiver exists
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if receiver is an admin
    const ADMIN_EMAILS = ['admin@skillbarter.com'];
    if (ADMIN_EMAILS.includes(receiver.email)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot add admin as a friend'
      });
    }

    // Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      where: {
        sender_id,
        receiver_id
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already sent'
      });
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      sender_id,
      receiver_id,
      message: message || '',
      status: 'pending'
    });

    // Get sender info for the response
    const sender = await User.findByPk(sender_id, {
      attributes: ['user_id', 'full_name', 'email']
    });

    res.json({
      success: true,
      message: 'Friend request sent successfully',
      data: {
        id: friendRequest.id,
        sender: sender,
        receiver_id,
        message: friendRequest.message,
        status: friendRequest.status,
        created_at: friendRequest.created_at
      }
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send friend request'
    });
  }
});

// Get received friend requests
router.get('/requests/received', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const requests = await FriendRequest.findAll({
      where: {
        receiver_id: user_id,
        status: 'pending'
      },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['user_id', 'full_name', 'email', 'location']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friend requests'
    });
  }
});

// Get sent friend requests
router.get('/requests/sent', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const requests = await FriendRequest.findAll({
      where: {
        sender_id: user_id
      },
      include: [{
        model: User,
        as: 'receiver',
        attributes: ['user_id', 'full_name', 'email', 'location']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get sent friend requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sent friend requests'
    });
  }
});

// Accept/Reject friend request
router.put('/request/:id/:action', authMiddleware, async (req, res) => {
  try {
    const { id, action } = req.params;
    const user_id = req.user.user_id;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use accept or reject'
      });
    }

    const friendRequest = await FriendRequest.findOne({
      where: {
        id,
        receiver_id: user_id,
        status: 'pending'
      }
    });

    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found or already processed'
      });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await friendRequest.update({
      status: newStatus,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: `Friend request ${action}ed successfully`,
      data: {
        id: friendRequest.id,
        status: newStatus
      }
    });
  } catch (error) {
    console.error('Update friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update friend request'
    });
  }
});

// Get friends list (accepted requests)
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.user_id;

    // Get friends where user is sender
    const sentRequests = await FriendRequest.findAll({
      where: {
        sender_id: user_id,
        status: 'accepted'
      },
      include: [{
        model: User,
        as: 'receiver',
        attributes: ['user_id', 'full_name', 'email', 'location', 'profile_picture']
      }]
    });

    // Get friends where user is receiver
    const receivedRequests = await FriendRequest.findAll({
      where: {
        receiver_id: user_id,
        status: 'accepted'
      },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['user_id', 'full_name', 'email', 'location', 'profile_picture']
      }]
    });

    // Combine and format friends list
    const friends = [
      ...sentRequests.map(req => req.receiver),
      ...receivedRequests.map(req => req.sender)
    ];

    res.json({
      success: true,
      data: friends
    });
  } catch (error) {
    console.error('Get friends list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friends list'
    });
  }
});

// Check friendship status between two users
router.get('/status/:user_id', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.user_id;
    const targetUserId = parseInt(req.params.user_id);

    if (currentUserId === targetUserId) {
      return res.json({
        success: true,
        data: { status: 'self' }
      });
    }

    // Check if there's a friend request between these users
    const friendRequest = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          { sender_id: currentUserId, receiver_id: targetUserId },
          { sender_id: targetUserId, receiver_id: currentUserId }
        ]
      }
    });

    if (!friendRequest) {
      return res.json({
        success: true,
        data: { status: 'none' }
      });
    }

    // Determine the relationship status
    let relationshipStatus = friendRequest.status;
    if (friendRequest.status === 'pending') {
      if (friendRequest.sender_id === currentUserId) {
        relationshipStatus = 'pending_sent';
      } else {
        relationshipStatus = 'pending_received';
      }
    }

    res.json({
      success: true,
      data: {
        status: relationshipStatus,
        request_id: friendRequest.id
      }
    });
  } catch (error) {
    console.error('Check friendship status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check friendship status'
    });
  }
});

module.exports = router;