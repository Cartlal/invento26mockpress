require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images_char', express.static(path.join(__dirname, 'images_char')));

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

// ... (other imports remain, I need to be careful not to overwrite them if not selected)

// Routes
const adminRoutes = require('./routes/admin');
const voteRoutes = require('./routes/vote');
const authRoutes = require('./routes/auth');


app.use('/api/admin', adminRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/auth', authRoutes);


// Socket.IO
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join specific rooms based on identity (sent via handshake or event)
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);

        // If joined admin room, send initial user count
        if (room === 'admin') {
            const count = io.engine.clientsCount;
            io.to('admin').emit('userCount', count);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Only broadcast count update to admin room to save bandwidth
        const count = io.engine.clientsCount;
        io.to('admin').emit('userCount', count);
    });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
} else {
    // Basic Route for dev
    app.get('/', (req, res) => {
        res.send('INVENTO 2026 Voting Server Running (Dev Mode)');
    });
}

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
