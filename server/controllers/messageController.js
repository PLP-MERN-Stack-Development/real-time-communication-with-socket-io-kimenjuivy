const Message = require('../models/Message');

/**
 * Message Controller
 * Handles all message-related business logic
 */

const messageController = {
    /**
     * Create a new message
     */
    createMessage: async (messageData) => {
        try {
            const { room, sender, content, messageType = 'text' } = messageData;

            // Validate message
            if (!room || !sender || !content) {
                throw new Error('Missing required fields');
            }

            if (content.length > 1000) {
                throw new Error('Message too long');
            }

            // Create message (if using MongoDB)
            // Uncomment if using database
            /*
            const message = new Message({
                room,
                sender,
                content,
                messageType,
                readBy: []
            });

            await message.save();
            return message;
            */

            // Return message object (in-memory)
            return {
                id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                room,
                sender,
                content,
                messageType,
                timestamp: new Date().toISOString(),
                readBy: []
            };
        } catch (error) {
            console.error('Error creating message:', error);
            throw error;
        }
    },

    /**
     * Get messages for a room
     */
    getRoomMessages: async (room, limit = 50) => {
        try {
            // If using MongoDB, uncomment:
            /*
            const messages = await Message.find({ room })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean();
            return messages.reverse();
            */

            // For in-memory storage, return empty array
            return [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    /**
     * Mark message as read
     */
    markAsRead: async (messageId, username) => {
        try {
            // If using MongoDB, uncomment:
            /*
            const message = await Message.findById(messageId);
            if (!message) {
                throw new Error('Message not found');
            }

            const alreadyRead = message.readBy.some(
                (read) => read.username === username
            );

            if (!alreadyRead) {
                message.readBy.push({
                    username,
                    readAt: new Date()
                });
                await message.save();
            }

            return message;
            */

            return { success: true, messageId, username };
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    },

    /**
     * Delete a message
     */
    deleteMessage: async (messageId, username) => {
        try {
            // If using MongoDB, uncomment:
            /*
            const message = await Message.findById(messageId);
            if (!message) {
                throw new Error('Message not found');
            }

            // Only allow sender to delete
            if (message.sender !== username) {
                throw new Error('Unauthorized');
            }

            await message.deleteOne();
            return { success: true, messageId };
            */

            return { success: true, messageId };
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    },

    /**
     * Search messages in a room
     */
    searchMessages: async (room, query) => {
        try {
            // If using MongoDB, uncomment:
            /*
            const messages = await Message.find({
                room,
                content: { $regex: query, $options: 'i' }
            })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();
            return messages;
            */

            return [];
        } catch (error) {
            console.error('Error searching messages:', error);
            throw error;
        }
    },

    /**
     * Get message statistics for a room
     */
    getRoomStats: async (room) => {
        try {
            // If using MongoDB, uncomment:
            /*
            const totalMessages = await Message.countDocuments({ room });
            const uniqueSenders = await Message.distinct('sender', { room });
            
            return {
                totalMessages,
                uniqueSenders: uniqueSenders.length,
                room
            };
            */

            return {
                totalMessages: 0,
                uniqueSenders: 0,
                room
            };
        } catch (error) {
            console.error('Error getting room stats:', error);
            throw error;
        }
    },

    /**
     * Validate message content
     */
    validateMessage: (content) => {
        if (!content || typeof content !== 'string') {
            return { valid: false, error: 'Invalid message content' };
        }

        if (content.trim().length === 0) {
            return { valid: false, error: 'Message cannot be empty' };
        }

        if (content.length > 1000) {
            return { valid: false, error: 'Message too long (max 1000 characters)' };
        }

        // Check for spam patterns (simple example)
        const spamPatterns = [
            /(.)\1{10,}/, // Repeated characters
            /(http|https):\/\/[^\s]+/gi // Multiple URLs
        ];

        for (const pattern of spamPatterns) {
            if (pattern.test(content)) {
                return { valid: false, error: 'Message appears to be spam' };
            }
        }

        return { valid: true };
    }
};

module.exports = messageController;