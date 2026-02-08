require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/invento26_voting')

    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for dev
        methods: ["GET", "POST"]
    }
});

app.set('io', io); // Make io accessible in routes

// Routes
const adminRoutes = require('./routes/admin');
const voteRoutes = require('./routes/vote');
const authRoutes = require('./routes/auth');

app.use('/api/admin', adminRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/auth', authRoutes);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Basic Route
app.get('/', (req, res) => {
    res.send('INVENTO 2026 Voting Server Running');
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
