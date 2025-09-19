const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { testConnection } = require('./config/db');
const { syncDatabase, db } = require('./models/index');
const { Message, User } = db;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:4173'],
    credentials: true
  }
});
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SkillBarter Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Routes
console.log('📡 Registering routes...');
app.use('/api/auth', require('./routes/auth'));
console.log('✅ Auth routes registered');
app.use('/api/skills', require('./routes/skills'));
console.log('✅ Skills routes registered');
app.use('/api/users', require('./routes/users'));
console.log('✅ Users routes registered');
app.use('/api/friends', require('./routes/friends'));
console.log('✅ Friend routes registered');
app.use('/api/messages', require('./routes/messages'));
console.log('✅ Message routes registered');
app.use('/api/quizzes', require('./routes/quizzes'));
console.log('✅ Quiz routes registered');

// Socket.IO connection handling
const connectedUsers = new Map();
const recentMessages = new Map(); // Track recent messages to prevent duplicates

io.on('connection', (socket) => {
  console.log('🔗 User connected:', socket.id);

  // User joins with their user ID
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
  });

  // Handle real-time messaging
  socket.on('send_message', async (data) => {
    const { receiverId, message, senderId } = data;
    
    // Create a unique message key to prevent duplicates
    const messageKey = `${senderId}-${receiverId}-${message}-${Date.now()}`;
    const recentKey = `${senderId}-${receiverId}-${message}`;
    
    // Check if this exact message was sent recently (within 2 seconds)
    if (recentMessages.has(recentKey)) {
      const lastSent = recentMessages.get(recentKey);
      if (Date.now() - lastSent < 2000) {
        console.log('⚠️ Duplicate message prevented:', { senderId, receiverId, message });
        return;
      }
    }
    
    // Track this message
    recentMessages.set(recentKey, Date.now());
    
    // Clean up old entries (keep only last 1 minute)
    setTimeout(() => {
      recentMessages.delete(recentKey);
    }, 60000);
    
    try {
      // Get sender info for notifications
      const sender = await User.findByPk(senderId, {
        attributes: ['user_id', 'full_name']
      });
      
      // Save message to database
      const savedMessage = await Message.create({
        sender_id: senderId,
        receiver_id: receiverId,
        message_text: message,
        sent_at: new Date()
      });
      
      const timestamp = savedMessage.sent_at.toISOString();
      
      // Send to receiver with sender info
      const receiverSocketId = connectedUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', {
          senderId,
          senderName: sender?.full_name || 'Unknown User',
          message,
          timestamp,
          messageId: savedMessage.id
        });
      }
      
      // Send confirmation to sender
      socket.emit('message_sent', {
        receiverId,
        message,
        timestamp,
        messageId: savedMessage.id
      });
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('message_error', {
        error: 'Failed to send message'
      });
    }
  });

  // Handle friend request notifications
  socket.on('send_friend_request', (data) => {
    const { receiverId, senderName } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('friend_request_received', {
        senderId: socket.userId,
        senderName,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle friend request acceptance notifications
  socket.on('friend_request_accepted', (data) => {
    const { senderId, receiverId, senderName, receiverName } = data;
    
    // Notify the original sender that their request was accepted
    const senderSocketId = connectedUsers.get(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit('friend_request_was_accepted', {
        acceptedBy: receiverId,
        acceptedByName: receiverName,
        timestamp: new Date().toISOString()
      });
    }
    
    // Notify the receiver (accepter) that they successfully accepted
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('friend_request_accepted_success', {
        friendId: senderId,
        friendName: senderName,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle quiz assignment notifications
  socket.on('send_quiz_assignment', (data) => {
    const { receiverId, assignerName, quizTitle } = data;
    const receiverSocketId = connectedUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('quiz_assigned', {
        assignerId: socket.userId,
        assignerName,
        quizTitle,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`👋 User ${socket.userId} disconnected`);
    }
  });
});

// Routes will be added here
// Example:
// app.use('/api/users', require('./routes/users'));

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database
    await syncDatabase();
    
    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`💬 Socket.IO enabled for real-time chat`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;