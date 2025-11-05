const users = new Map(); // Store connected users
const rooms = new Map(); // Store active rooms

function socketHandler(io) {
    io.on('connection', (socket) => {
        console.log(`✅ New client connected: ${socket.id}`);

        // Handle user join
        socket.on('user:join', ({ username, room }) => {
            try {
                // Store user information
                users.set(socket.id, {
                    id: socket.id,
                    username,
                    room,
                    joinedAt: new Date()
                });

                // Join the room
                socket.join(room);

                // Add user to room tracking
                if (!rooms.has(room)) {
                    rooms.set(room, new Set());
                }
                rooms.get(room).add(socket.id);

                // Get room users
                const roomUsers = getRoomUsers(room);

                // Notify user they joined successfully
                socket.emit('user:joined', {
                    success: true,
                    room,
                    users: roomUsers
                });

                // Notify others in the room
                socket.to(room).emit('user:new', {
                    username,
                    message: `${username} joined the chat`,
                    users: roomUsers,
                    timestamp: new Date().toISOString()
                });

                // Send updated user list to all in room
                io.to(room).emit('users:update', roomUsers);

                console.log(`👤 ${username} joined room: ${room}`);
            } catch (error) {
                console.error('Error in user:join:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Handle chat messages
        socket.on('message:send', (data) => {
            try {
                const user = users.get(socket.id);
                if (!user) return;

                const messageData = {
                    id: generateId(),
                    username: user.username,
                    message: data.message,
                    room: user.room,
                    timestamp: new Date().toISOString()
                };

                // Broadcast to all users in the room (including sender)
                // Broadcast to all users in the room (including sender)
                io.to(user.room).emit('message:receive', messageData);

                // Auto-send read receipt after 2 seconds for all recipients
                setTimeout(() => {
                    const roomUsersList = getRoomUsers(user.room);
                    roomUsersList.forEach(roomUser => {
                        if (roomUser.username !== user.username) {
                            io.to(roomUser.id).emit('message:auto:read', {
                                messageId: messageData.id,
                                readBy: roomUser.username
                            });
                        }
                    });
                }, 2000);

                console.log(`💬 Message from ${user.username} in ${user.room}: ${data.message}`);
            } catch (error) {
                console.error('Error in message:send:', error);
            }
        });

        // Handle typing indicator
        socket.on('typing:start', () => {
            try {
                const user = users.get(socket.id);
                if (!user) return;

                socket.to(user.room).emit('typing:user', {
                    username: user.username,
                    isTyping: true
                });
            } catch (error) {
                console.error('Error in typing:start:', error);
            }
        });

        socket.on('typing:stop', () => {
            try {
                const user = users.get(socket.id);
                if (!user) return;

                socket.to(user.room).emit('typing:user', {
                    username: user.username,
                    isTyping: false
                });
            } catch (error) {
                console.error('Error in typing:stop:', error);
            }
        });

        // Handle private messages
        socket.on('message:private', ({ recipientId, message }) => {
            try {
                const sender = users.get(socket.id);
                if (!sender) return;

                const messageData = {
                    id: generateId(),
                    from: sender.username,
                    message,
                    timestamp: new Date().toISOString(),
                    private: true
                };

                // Send to recipient
                socket.to(recipientId).emit('message:private:receive', messageData);
                
                // Send confirmation to sender
                socket.emit('message:private:sent', messageData);

                console.log(`🔒 Private message from ${sender.username} to ${recipientId}`);
            } catch (error) {
                console.error('Error in message:private:', error);
            }
        });
        // Handle message reactions
        socket.on('message:reaction', ({ messageId, reaction }) => {
            try {
                const user = users.get(socket.id);
                if (!user) return;

                // Broadcast reaction to all users in the room
                io.to(user.room).emit('message:reaction:update', {
                    messageId,
                    reaction,
                    username: user.username
                });

                console.log(`${reaction} ${user.username} reacted to message ${messageId}`);
            } catch (error) {
                console.error('Error in message:reaction:', error);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            try {
                const user = users.get(socket.id);
                
                if (user) {
                    const { username, room } = user;

                    // Remove from room tracking
                    if (rooms.has(room)) {
                        rooms.get(room).delete(socket.id);
                        if (rooms.get(room).size === 0) {
                            rooms.delete(room);
                        }
                    }

                    // Remove from users map
                    users.delete(socket.id);

                    // Get updated room users
                    const roomUsers = getRoomUsers(room);

                    // Notify others
                    socket.to(room).emit('user:left', {
                        username,
                        message: `${username} left the chat`,
                        users: roomUsers,
                        timestamp: new Date().toISOString()
                    });

                    // Send updated user list
                    io.to(room).emit('users:update', roomUsers);

                    console.log(`👋 ${username} disconnected from ${room}`);
                }
            } catch (error) {
                console.error('Error in disconnect:', error);
            }
        });
    });

    // Helper function to get users in a room
    function getRoomUsers(room) {
        if (!rooms.has(room)) return [];
        
        const roomSocketIds = Array.from(rooms.get(room));
        return roomSocketIds
            .map(id => users.get(id))
            .filter(user => user !== undefined)
            .map(user => ({
                id: user.id,
                username: user.username
            }));
    }

    // Helper function to generate unique IDs
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = socketHandler;