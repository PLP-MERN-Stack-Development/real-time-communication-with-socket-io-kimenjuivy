/**
 * Socket.IO Configuration
 * Centralized configuration for Socket.IO server settings
 */

const socketConfig = {
    // CORS configuration
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    },

    // Connection settings
    connectionStateRecovery: {
        // Enable connection state recovery
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        skipMiddlewares: true
    },

    // Ping settings
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds

    // Transport settings
    transports: ['websocket', 'polling'],

    // Upgrade timeout
    upgradeTimeout: 10000, // 10 seconds

    // Maximum HTTP buffer size
    maxHttpBufferSize: 1e6, // 1 MB

    // Allow upgrades
    allowUpgrades: true,

    // Cookie settings
    cookie: {
        name: 'io',
        path: '/',
        httpOnly: true,
        sameSite: 'lax'
    },

    // Allow EIO3
    allowEIO3: true,

    // Server-side options
    serveClient: false,

    // Namespace configuration
    namespaces: {
        default: '/',
        chat: '/chat',
        notifications: '/notifications'
    },

    // Room settings
    rooms: {
        maxUsers: 100, // Maximum users per room
        defaultRooms: ['general', 'tech', 'gaming', 'random', 'music']
    },

    // Message settings
    message: {
        maxLength: 1000, // Maximum message length
        rateLimit: {
            messages: 10, // Maximum messages
            per: 5000 // Per 5 seconds
        }
    },

    // Typing indicator settings
    typing: {
        timeout: 3000 // 3 seconds timeout
    }
};

module.exports = socketConfig;