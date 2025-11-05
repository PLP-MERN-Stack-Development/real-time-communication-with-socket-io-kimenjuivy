const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');
const { generateToken, verifyToken } = require('./middleware/auth');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO setup
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    },
    maxHttpBufferSize: 1e8, // 100 MB for file uploads
    pingTimeout: 60000,
    pingInterval: 25000
});

// Connect to MongoDB
connectDB();

// Initialize socket handlers
socketHandler(io);

// API Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Socket.IO Chat Server is running!',
        version: '2.0.0',
        features: [
            'Real-time messaging',
            'Typing indicators',
            'File sharing',
            'Private messages',
            'Message reactions',
            'JWT Authentication'
        ]
    });
});

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
    const { username } = req.body;
    
    if (!username || username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    
    const token = generateToken(username);
    res.json({ token, username });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO ready for connections`);
    console.log(`🔐 JWT Authentication enabled`);
    console.log(`📁 File uploads enabled`);
});

module.exports = { app, io, server };