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

// Enhanced CORS configuration
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'https://real-time-communication-with-socket-io-kimenjuivy.vercel.app'
];

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO setup with enhanced CORS
const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
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
        status: 'online',
        timestamp: new Date().toISOString(),
        features: [
            'Real-time messaging',
            'JWT Authentication',
            'Typing indicators',
            'File sharing',
            'Private messages',
            'Message reactions',
            'Read receipts',
            'Browser notifications'
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
    res.json({ 
        token, 
        username,
        message: 'Authentication successful'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        mongodb: 'connected'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready for connections`);
    console.log(`🔐 JWT Authentication enabled`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(`📁 File uploads enabled`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = { app, io, server };