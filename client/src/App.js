import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

let socket = null;
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

console.log('Socket URL:', SOCKET_URL); // Debug log

function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [room, setRoom] = useState('general');
  
  // Chat State
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Advanced Features State
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrivateChat, setShowPrivateChat] = useState(false);
  
  // Refs
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const hasJoinedRoom = useRef(false);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationsEnabled(permission === 'granted');
        });
      } else if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  // Initialize Socket and Setup Listeners
  useEffect(() => {
    if (isLoggedIn && !socket) {
      console.log('Initializing socket connection...');
      socket = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });

      // Connection events
      socket.on('connect', () => {
        console.log('✅ Connected to server, socket ID:', socket.id);
        setIsConnected(true);
        
        // Join room immediately after connection
        if (username && room && !hasJoinedRoom.current) {
          console.log('Emitting user:join event');
          socket.emit('user:join', { username: username.trim(), room });
          hasJoinedRoom.current = true;
        }
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        setIsConnected(false);
        hasJoinedRoom.current = false;
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      // User events
      socket.on('user:joined', (data) => {
        console.log('user:joined event received:', data);
        setUsers(data.users);
        addSystemMessage('You joined the chat');
      });

      socket.on('user:new', (data) => {
        console.log('user:new event received:', data);
        setUsers(data.users);
        addSystemMessage(data.message);
        playNotificationSound();
      });

      socket.on('user:left', (data) => {
        console.log('user:left event received:', data);
        setUsers(data.users);
        addSystemMessage(data.message);
      });

      socket.on('users:update', (updatedUsers) => {
        console.log('users:update event received:', updatedUsers);
        setUsers(updatedUsers);
      });

      // Message events
      socket.on('message:receive', (data) => {
        console.log('message:receive event received:', data);
        setMessages(prev => [...prev, { ...data, delivered: true }]);
        
        if (data.username !== username) {
          playNotificationSound();
          if (!document.hasFocus()) {
            setUnreadCount(prev => prev + 1);
            showBrowserNotification('New Message', `${data.username}: ${data.message}`);
          }
        }
      });

      // Typing events
      socket.on('typing:user', ({ username: typingUsername, isTyping }) => {
        setTypingUsers(prev => {
          if (isTyping) {
            return prev.includes(typingUsername) ? prev : [...prev, typingUsername];
          } else {
            return prev.filter(u => u !== typingUsername);
          }
        });
      });

      // Notification events
      socket.on('notification:new', (data) => {
        if (!document.hasFocus()) {
          showBrowserNotification(data.title, data.body);
        }
      });

      // Private message events
      socket.on('message:private:receive', (data) => {
        setMessages(prev => [...prev, { ...data, type: 'private', delivered: true }]);
        playNotificationSound();
        showBrowserNotification('Private Message', `From ${data.from}: ${data.message}`);
      });

      // Read receipts
      socket.on('message:read:update', ({ messageId, readBy }) => {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, readBy: [...(msg.readBy || []), readBy] }
            : msg
        ));
      });

      // Reaction events
      socket.on('message:reaction:update', ({ messageId, reaction, username: reactionUsername }) => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            const reactions = { ...(msg.reactions || {}) };
            if (!reactions[reaction]) reactions[reaction] = [];
            if (!reactions[reaction].includes(reactionUsername)) {
              reactions[reaction].push(reactionUsername);
            }
            return { ...msg, reactions };
          }
          return msg;
        }));
      });

      // Auto read receipts
      socket.on('message:auto:read', ({ messageId, readBy }) => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            const currentReads = msg.readBy || [];
            if (!currentReads.includes(readBy)) {
              return { ...msg, readBy: [...currentReads, readBy] };
            }
          }
          return msg;
        }));
      });

      // Error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        alert(`Error: ${error.message}`);
      });
    }

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('user:joined');
        socket.off('user:new');
        socket.off('user:left');
        socket.off('users:update');
        socket.off('message:receive');
        socket.off('typing:user');
        socket.off('notification:new');
        socket.off('message:private:receive');
        socket.off('message:read:update');
        socket.off('message:reaction:update');
        socket.off('message:auto:read');
        socket.off('error');
        socket.disconnect();
        socket = null;
        hasJoinedRoom.current = false;
      }
    };
  }, [isLoggedIn, token, username, room]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset unread count when window focused
  useEffect(() => {
    const handleFocus = () => {
      setUnreadCount(0);
      document.title = 'Chat App';
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Update page title with unread count
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) Chat App`;
    }
  }, [unreadCount]);

  // Helper functions
  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      message: text,
      timestamp: new Date().toISOString()
    }]);
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const showBrowserNotification = (title, body) => {
    if (notificationsEnabled && !document.hasFocus()) {
      new Notification(title, {
        body,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: 'chat-notification'
      });
    }
  };

  // Handle login with JWT
  const handleLogin = async (e) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      alert('Username must be at least 3 characters');
      return;
    }

    try {
      console.log('Attempting login to:', `${SOCKET_URL}/api/auth/login`);
      const response = await fetch(`${SOCKET_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.token) {
        setToken(data.token);
        setIsLoggedIn(true);
      } else {
        alert('Authentication failed. No token received.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.message}. Check console for details.`);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket && socket.connected) {
      console.log('Sending message:', message.trim());
      
      const messageData = {
        message: message.trim(),
        timestamp: new Date().toISOString()
      };

      if (showPrivateChat && selectedUser) {
        socket.emit('message:private', {
          recipientId: selectedUser.id,
          message: message.trim()
        });
      } else {
        socket.emit('message:send', messageData);
      }

      setMessage('');
      socket.emit('typing:stop');
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } else {
      console.warn('Cannot send message - socket not connected');
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!socket || !socket.connected) return;

    socket.emit('typing:start');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop');
    }, 1000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileMessage = `📎 Shared file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
      if (socket && socket.connected) {
        socket.emit('message:send', { message: fileMessage });
      }
    }
  };

  const handleReaction = (messageId, reaction) => {
    if (socket && socket.connected) {
      socket.emit('message:reaction', { messageId, reaction });
    }
  };

  const handlePrivateMessage = (user) => {
    setSelectedUser(user);
    setShowPrivateChat(true);
  };

  const handleLeave = () => {
    if (socket) {
      socket.disconnect();
    }
    setIsLoggedIn(false);
    setMessages([]);
    setUsers([]);
    setUsername('');
    setTypingUsers([]);
    setUnreadCount(0);
    setShowPrivateChat(false);
    setSelectedUser(null);
    hasJoinedRoom.current = false;
  };

  const getTypingText = () => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing`;
    return `${typingUsers.length} people are typing`;
  };

  const filteredMessages = messages.filter(msg => 
    !searchQuery || 
    (msg.message && msg.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (msg.username && msg.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1>💬 Real-Time Chat</h1>
          <p>Advanced Socket.IO Chat Application</p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
            />
            <select value={room} onChange={(e) => setRoom(e.target.value)}>
              <option value="general">🌍 General</option>
              <option value="tech">💻 Tech Talk</option>
              <option value="gaming">🎮 Gaming</option>
              <option value="random">🎲 Random</option>
              <option value="music">🎵 Music</option>
            </select>
            <button type="submit">Join Chat</button>
          </form>
          <div className="features-list">
            <p>✅ Real-time messaging with JWT auth</p>
            <p>✅ Typing indicators (see when users type)</p>
            <p>✅ Browser & sound notifications</p>
            <p>✅ Private messaging (DM users)</p>
            <p>✅ Message reactions (👍❤️😂)</p>
            <p>✅ File sharing support</p>
            <p>✅ Message search</p>
            <p>✅ Reconnection logic</p>
          </div>
          {notificationsEnabled ? (
            <p className="notification-status">🔔 Notifications enabled</p>
          ) : (
            <p className="notification-status">🔕 Enable notifications for best experience</p>
          )}
          <p className="server-info" style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#718096' }}>
            Server: {SOCKET_URL}
          </p>
        </div>
      </div>
    );
  }

  // Chat Screen - Rest of the code remains the same...
  return (
    <div className="chat-screen">
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZQQ4PV6vn77BdGAg+ltryxnMpBSh+zPLaizsIGGS36+OdSA8MUKXh8bllHAU2jdXzzn0vBSV7y/DglEILElyx6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEQODlSp5O+zYBoGPJPY88p2KwUme8rx3JA+CRZiturqpVITC0mi4PK8aB8GM4fR88yAMQYfbL/u45lCDQ5TqeXusV0bBzyS1/PMeCsFKH3M8dqLPAgZZLjq45lDDQxPpN/wr10aBjuT1/PNeCwFJ3zM8dSENAYcaL/v5pxCDQ5Uq+fvsF0aCDyS1/PKdysFKH3M8tuLOwgYZLfq5JhDDQ1Ppt/wr10ZBjuR1/PPeCwGJ3vM8daFNQYca7/u4plCDg5TqeXvs2AbBzyS1/PKdioFKH3M8tyKOwgZZLbq5ZlDDQxPpd/xsF0ZBzqS1/PLeSsFJ3vM8diFNQYdab7u5JlCDQ5UquXvsl4bBzyS1/PLdSoFKX7M8duKPQgZZLbq5JlDDQxPpd/ysV4aBjqS1/PLeSwFKHvN8dWENQYea7/u5JlCDQ5UquXvsV4bBzyT1/PKdSsFKH7N8dtKPQgZZLbq5JlDDQxPpt/xsF4ZBzqT1/PLeSwGKHvN8daENQYea7/u5JlDDQ1Tq+XwsF4bBj2S1/PJdSsFKH7N8dxKPggZY7fq5ZlDDQxPpt/xsF4ZBzqT1/PLeisFKHrN8daENQcfa7/u5JlCDw1Tq+TwsF0bBj2S1/PJdSoGKH3N8dxLPQgZY7fq5ZlDDAxPpd/xsF4ZBzqT1/PLeSwFKHrN8daENQcfa7/u45lCDw5Uq+TwsF0bBj2S1/PKdSoGJ37N8dxLPggZY7bq5ZlCDAxOpt/xsl4ZBzqT1/PLeisFKHvN8dWENQcfar/u4plCDw5Uq+TvsF0bBj2T1/PKdSoGJ37M8dtKPQcYY7bq5JlDDAxOpt/xsl4ZBzqT1vPLeSwFJ3vN8dWENQcfar/u4plCDw5Uq+TvsF0bBj2T1/PKdCoGJ37M8dtKPQcYY7bq5JlDDAxOpt/xsl4ZBzqT1vPLeSwFJ3vN8dWENQcfar/u4plCDw5Uq+TvsF0bBj2T1/PKdCoGJ37M8dtKPQcYY7bq5JlDDAxOpt/xsl4ZBzqT1vPLeSwFJ3vN8dWENQcfar/u4plCDw5Uq+TvsF0bBj2T1/PKdCoGJ37M8dtKPQcYY7bq5JlDDAxOpt/xsl4ZBzqT1vPLeSwFJ3vN8dWENQcfar/u4plCDw5Uq+TvsF0bBj2T1/PKdCoGJ37M8dtKPQcYY7bq5JlDDAxOpt/xsl4ZBzqT1vPLeSwFJ3vN8dWENQcfar/u4plCDw5Uq+TvsF0bBj2T1/PKdCoGJ37M8dtKPQcYY7bq5JlDDAxOpt/xsl4ZBzqT1vPLeSwFJ3vN8dWENQcfar/u4plCDw5Uq+TvsF0bBj2T1/PKdCoGJ37M8dtKPQcYY7bq5JlDDAxOpt/xsl4ZBzqT1vPLeSwFJ3vN8dWENQcfar/u4plCDw5Uq+TvsF0bBj2T1/PKdCoGJ37M8dtKPQcYY7bq5JlDDAxO" preload="auto"></audio>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      
      <div className="chat-header">
        <div>
          <h2>
            💬 {room.charAt(0).toUpperCase() + room.slice(1)}
            <span className={isConnected ? 'status-dot online' : 'status-dot offline'}>
              {isConnected ? ' 🟢' : ' 🔴'}
            </span>
          </h2>
          <p>
            {users.length} user{users.length !== 1 ? 's' : ''} online
            {unreadCount > 0 && ` • ${unreadCount} unread`}
          </p>
        </div>
        <div className="header-actions">
          <input
            type="text"
            placeholder="🔍 Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button onClick={handleLeave} className="leave-btn">Leave</button>
        </div>
      </div>
      
      <div className="chat-body">
        <div className="sidebar">
          <h3>Users ({users.length})</h3>
          <ul>
            {users.length === 0 ? (
              <li style={{ textAlign: 'center', color: '#a0aec0', fontStyle: 'italic' }}>
                No users online yet
              </li>
            ) : (
              users.map((user, i) => (
                <li key={i} className="user-item">
                  <div className="user-info">
                    <span className="user-dot">●</span> 
                    <span>{user.username}</span>
                    {user.username === username && <span className="you-badge">(You)</span>}
                  </div>
                  {user.username !== username && (
                    <button
                      onClick={() => handlePrivateMessage(user)}
                      className="dm-btn"
                      title="Send private message"
                    >
                      💬
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
        
        <div className="chat-main">
          <div className="messages">
            {filteredMessages.length === 0 && !searchQuery && (
              <div className="no-messages" style={{ textAlign: 'center', padding: '2rem', color: '#a0aec0' }}>
                <p>No messages yet. Start the conversation! 💬</p>
              </div>
            )}
            {filteredMessages.length === 0 && searchQuery && (
              <div className="no-results">
                <p>No messages found for "{searchQuery}"</p>
              </div>
            )}
            {filteredMessages.map((msg, i) => (
              <div key={i} className={`message ${msg.type === 'system' ? 'system-msg' : msg.type === 'private' ? 'private-msg' : 'user-msg'}`}>
                {msg.type === 'system' ? (
                  <p className="system-text">{msg.message}</p>
                ) : msg.type === 'private' ? (
                  <div className="private-message">
                    <span className="private-label">🔒 Private from {msg.from}</span>
                    <div className="msg-bubble private-bubble">
                      <p>{msg.message}</p>
                      <span className="msg-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {msg.delivered && ' ✓'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={msg.username === username ? 'my-message' : 'other-message'}>
                    {msg.username !== username && (
                      <span className="msg-username">{msg.username}</span>
                    )}
                    <div className="msg-bubble">
                      <p>{msg.message}</p>
                      <div className="msg-footer">
                        <span className="msg-time">
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          {msg.delivered && ' ✓'}
                          {msg.readBy && msg.readBy.length > 0 && ' ✓✓'}
                        </span>
                      </div>
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="msg-reactions">
                          {Object.entries(msg.reactions).map(([reaction, usersList]) => (
                            <span key={reaction} className="reaction-badge" title={usersList.join(', ')}>
                              {reaction} {usersList.length}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.username !== username && msg.id && (
                      <div className="reaction-picker">
                        <button onClick={() => handleReaction(msg.id, '👍')} title="Like">👍</button>
                        <button onClick={() => handleReaction(msg.id, '❤️')} title="Love">❤️</button>
                        <button onClick={() => handleReaction(msg.id, '😂')} title="Laugh">😂</button>
                        <button onClick={() => handleReaction(msg.id, '😮')} title="Wow">😮</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <span>{getTypingText()}</span>
              <span className="typing-dots">
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </span>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="message-form">
            {showPrivateChat && selectedUser && (
              <div className="private-mode-indicator">
                🔒 Private chat with {selectedUser.username}
                <button
                  type="button"
                  onClick={() => {
                    setShowPrivateChat(false);
                    setSelectedUser(null);
                  }}
                  className="cancel-private"
                >
                  ✕
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="file-btn"
              title="Share file"
            >
              📎
            </button>
            <input
              type="text"
              placeholder={showPrivateChat ? `Private to ${selectedUser?.username}...` : "Type a message..."}
              value={message}
              onChange={handleTyping}
              maxLength={500}
              autoComplete="off"
              disabled={!isConnected}
            />
            <button type="submit" disabled={!message.trim() || !isConnected}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;