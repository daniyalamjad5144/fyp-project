require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    isConnected = true;
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} | DB: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    console.log('📨 Message received on server:', data);
    try {
      // Save message to database
      const newMessage = new Message({
        room: data.room,
        sender: data.senderId,
        senderName: data.author,
        message: data.message,
        time: data.time
      });
      await newMessage.save();
      console.log('✅ Message saved to DB:', data.message.substring(0, 20) + '...');

      // Emit to others in room
      socket.to(data.room).emit('receive_message', data);
      console.log(`📤 Message emitted to room: ${data.room}`);
    } catch (err) {
      console.error('❌ Socket Message Error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes Placeholder
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import Routes (To be created)
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const matchingRoutes = require('./routes/matching');
const sessionRoutes = require('./routes/session');
const gamificationRoutes = require('./routes/gamification');
const meetingsRoutes = require('./routes/meetings');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/chat', require('./routes/chat'));
app.use('/api/debug', require('./routes/debug')); // Debug route for viewing info

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 API URL: http://localhost:${PORT}`);
    console.log(`========================================\n`);
  });
}

startServer();
