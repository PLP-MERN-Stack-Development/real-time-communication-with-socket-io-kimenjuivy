/**
 * Helper Utility Functions
 * Common helper functions used across the application
 */

const helpers = {
    /**
     * Generate unique ID
     */
    generateId: (prefix = '') => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
    },

    /**
     * Format timestamp to readable string
     */
    formatTimestamp: (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    },

    /**
     * Sanitize message content
     */
    sanitizeMessage: (message) => {
        if (!message || typeof message !== 'string') return '';
        
        // Remove HTML tags
        let sanitized = message.replace(/<[^>]*>/g, '');
        
        // Trim whitespace
        sanitized = sanitized.trim();
        
        // Limit length
        if (sanitized.length > 1000) {
            sanitized = sanitized.substring(0, 1000);
        }
        
        return sanitized;
    },

    /**
     * Validate email format
     */
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Generate random color for user avatar
     */
    generateUserColor: (username) => {
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#4facfe',
            '#43e97b', '#fa709a', '#fee140', '#30cfd0'
        ];
        
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    },

    /**
     * Truncate text
     */
    truncateText: (text, maxLength = 50) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Check if user is online (based on last seen)
     */
    isUserOnline: (lastSeen, thresholdMinutes = 5) => {
        if (!lastSeen) return false;
        
        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffMs = now - lastSeenDate;
        const diffMins = diffMs / 60000;
        
        return diffMins <= thresholdMinutes;
    },

    /**
     * Parse room name to display format
     */
    formatRoomName: (roomId) => {
        const roomNames = {
            general: '🌍 General',
            tech: '💻 Tech Talk',
            gaming: '🎮 Gaming',
            random: '🎲 Random',
            music: '🎵 Music'
        };
        
        return roomNames[roomId] || roomId;
    },

    /**
     * Rate limiter helper
     */
    createRateLimiter: (maxRequests = 10, windowMs = 60000) => {
        const requests = new Map();
        
        return (userId) => {
            const now = Date.now();
            const userRequests = requests.get(userId) || [];
            
            // Remove old requests outside the window
            const validRequests = userRequests.filter(
                timestamp => now - timestamp < windowMs
            );
            
            if (validRequests.length >= maxRequests) {
                return {
                    allowed: false,
                    retryAfter: windowMs - (now - validRequests[0])
                };
            }
            
            validRequests.push(now);
            requests.set(userId, validRequests);
            
            return { allowed: true };
        };
    },

    /**
     * Deep clone object
     */
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Sleep/delay function
     */
    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Get random element from array
     */
    getRandomElement: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * Escape special regex characters
     */
    escapeRegex: (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Convert object to query string
     */
    objectToQueryString: (obj) => {
        return Object.keys(obj)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
            .join('&');
    },

    /**
     * Check if string contains profanity (basic example)
     */
    containsProfanity: (text) => {
        const profanityList = ['badword1', 'badword2']; // Add actual words
        const lowerText = text.toLowerCase();
        
        return profanityList.some(word => lowerText.includes(word));
    },

    /**
     * Log with timestamp
     */
    log: (message, type = 'info') => {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        }[type] || 'ℹ️';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
    },

    /**
     * Calculate time difference in human readable format
     */
    getTimeDifference: (date1, date2) => {
        const diffMs = Math.abs(date2 - date1);
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
        if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
        return `${diffSecs} second${diffSecs > 1 ? 's' : ''}`;
    }
};

module.exports = helpers;
