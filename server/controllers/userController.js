const User = require('../models/User');

/**
 * User Controller
 * Handles all user-related business logic
 */

const userController = {
    /**
     * Create or update user
     */
    createUser: async (userData) => {
        try {
            const { username, email, password } = userData;

            // Validate user data
            if (!username || username.length < 3) {
                throw new Error('Username must be at least 3 characters');
            }

            // If using MongoDB, uncomment:
            /*
            let user = await User.findOne({ username });
            
            if (user) {
                // Update existing user
                user.lastSeen = new Date();
                user.status = 'online';
                await user.save();
            } else {
                // Create new user
                user = new User({
                    username,
                    email: email || `${username}@temp.com`,
                    password: password || 'temp123',
                    status: 'online'
                });
                await user.save();
            }

            return user;
            */

            // Return user object (in-memory)
            return {
                id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                username,
                email: email || `${username}@temp.com`,
                status: 'online',
                lastSeen: new Date(),
                createdAt: new Date()
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    /**
     * Get user by username
     */
    getUserByUsername: async (username) => {
        try {
            // If using MongoDB, uncomment:
            /*
            const user = await User.findOne({ username }).lean();
            return user;
            */

            return null;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    /**
     * Update user status
     */
    updateUserStatus: async (username, status) => {
        try {
            // Validate status
            const validStatuses = ['online', 'offline', 'away'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid status');
            }

            // If using MongoDB, uncomment:
            /*
            const user = await User.findOneAndUpdate(
                { username },
                { status, lastSeen: new Date() },
                { new: true }
            );

            return user;
            */

            return { username, status, lastSeen: new Date() };
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    },

    /**
     * Get all online users
     */
    getOnlineUsers: async () => {
        try {
            // If using MongoDB, uncomment:
            /*
            const users = await User.find({ status: 'online' })
                .select('username status lastSeen')
                .lean();
            return users;
            */

            return [];
        } catch (error) {
            console.error('Error fetching online users:', error);
            throw error;
        }
    },

    /**
     * Update user's last seen
     */
    updateLastSeen: async (username) => {
        try {
            // If using MongoDB, uncomment:
            /*
            await User.findOneAndUpdate(
                { username },
                { lastSeen: new Date() }
            );
            */

            return { success: true, username };
        } catch (error) {
            console.error('Error updating last seen:', error);
            throw error;
        }
    },

    /**
     * Validate username
     */
    validateUsername: (username) => {
        if (!username || typeof username !== 'string') {
            return { valid: false, error: 'Invalid username' };
        }

        if (username.length < 3) {
            return { valid: false, error: 'Username must be at least 3 characters' };
        }

        if (username.length > 20) {
            return { valid: false, error: 'Username must be less than 20 characters' };
        }

        // Check for valid characters (alphanumeric and underscore)
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
        }

        return { valid: true };
    },

    /**
     * Get user statistics
     */
    getUserStats: async (username) => {
        try {
            // If using MongoDB, uncomment:
            /*
            const user = await User.findOne({ username });
            if (!user) {
                throw new Error('User not found');
            }

            const Message = require('../models/Message');
            const messageCount = await Message.countDocuments({ sender: username });

            return {
                username,
                status: user.status,
                joinedAt: user.createdAt,
                lastSeen: user.lastSeen,
                messageCount
            };
            */

            return {
                username,
                messageCount: 0,
                joinedAt: new Date()
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    },

    /**
     * Delete user (soft delete)
     */
    deleteUser: async (username) => {
        try {
            // If using MongoDB, uncomment:
            /*
            const user = await User.findOne({ username });
            if (!user) {
                throw new Error('User not found');
            }

            user.status = 'offline';
            user.deletedAt = new Date();
            await user.save();

            return { success: true, username };
            */

            return { success: true, username };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
};

module.exports = userController;