# 💬 Real-Time Chat Application

A full-featured real-time chat application built with Socket.IO, React, Node.js, Express, and MongoDB. Features include typing indicators, private messaging, message reactions, file sharing, and browser notifications.

![Chat App](https://img.shields.io/badge/Socket.IO-4.6-black?style=for-the-badge&logo=socket.io)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)

## 🚀 Features

### Core Functionality
- ✅ **Real-time Messaging** - Instant bidirectional communication
- ✅ **JWT Authentication** - Secure user authentication
- ✅ **Multiple Chat Rooms** - 5 different themed rooms
- ✅ **User Presence** - Online/offline status tracking
- ✅ **Join/Leave Notifications** - Real-time user activity updates

### Advanced Features
- ✅ **Typing Indicators** - See when users are composing messages
- ✅ **Private Messaging** - Send direct messages to specific users
- ✅ **Message Reactions** - React with emojis (👍❤️😂😮)
- ✅ **Read Receipts** - Double checkmarks when messages are read
- ✅ **File Sharing** - Share files with other users
- ✅ **Browser Notifications** - Get notified even when tab is inactive
- ✅ **Sound Notifications** - Audio alerts for new messages
- ✅ **Message Search** - Search through chat history
- ✅ **Unread Message Count** - Track unread messages in title bar
- ✅ **Auto-Reconnection** - Automatic reconnection on disconnect
- ✅ **Responsive Design** - Works on desktop and mobile devices

## 📸 Screenshots

### Login Screen
![Login](./screenshots/login.png)

### Chat Interface
![Chat](./screenshots/chat.png)

### Private Messaging
![Private Messages](./screenshots/private.png)

### Mobile View
![Mobile](./screenshots/mobile.png)

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Socket.IO Client** - Real-time communication
- **CSS3** - Styling and animations
- **Web Notifications API** - Browser notifications

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - WebSocket library
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Multer** - File uploads

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (free tier)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd real-time-communication-with-socket-io-kimenjuivy
```

### 2. Setup Server
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/socketio-chat
CLIENT_URL=http://localhost:3000
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### 3. Setup Client
```bash
cd ../client
npm install
```

Create `client/.env`:
```env
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Run Application

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm start
```

Visit `http://localhost:3000`

## 🌐 Deployment

### Deploy Backend to Render

1. **Push to GitHub**
```bash
git add .
git commit -m "Production ready"
git push origin main
```

2. **Create Render Account** at https://render.com

3. **New Web Service**
   - Connect GitHub repository
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

4. **Environment Variables:**
```
PORT=5000
MONGODB_URI=mongodb+srv://ivykimenju_db_user:YOUR_PASSWORD@ivycluster.ia5jnmq.mongodb.net/socketio-chat
CLIENT_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
JWT_SECRET=your-production-secret-key
```

5. **Deploy** and copy your Render URL (e.g., `https://your-app.onrender.com`)

### Deploy Frontend to Vercel

1. **Create Vercel Account** at https://vercel.com

2. **Import Project**
   - Connect GitHub repository
   - **Root Directory:** `client`
   - **Framework Preset:** Create React App

3. **Environment Variables:**
```
REACT_APP_SOCKET_URL=https://your-app.onrender.com
```

4. **Deploy** and copy your Vercel URL

5. **Update Backend CORS**
   - Go back to Render
   - Update `CLIENT_URL` environment variable with your Vercel URL
   - Redeploy

## 🔐 Environment Variables

### Server (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `CLIENT_URL` | Frontend URL | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `JWT_SECRET` | JWT secret key | `your-secret-key` |

### Client (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_SOCKET_URL` | Backend URL | `http://localhost:5000` |

## 📝 API Endpoints

### REST API
- `GET /` - Server status
- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication

### Socket.IO Events

#### Client → Server
- `user:join` - Join chat room
- `message:send` - Send message
- `message:private` - Send private message
- `typing:start` - Start typing
- `typing:stop` - Stop typing
- `message:reaction` - React to message
- `message:read` - Mark message as read
- `disconnect` - Disconnect from server

#### Server → Client
- `user:joined` - User joined successfully
- `user:new` - New user joined room
- `user:left` - User left room
- `users:update` - Updated user list
- `message:receive` - New message received
- `message:private:receive` - Private message received
- `typing:user` - User typing status
- `notification:new` - New notification
- `message:reaction:update` - Message reaction update
- `message:auto:read` - Message read receipt

## 🎯 Project Structure
```
socketio-chat/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main component
│   │   ├── App.css        # Styles
│   │   └── index.js       # Entry point
│   ├── .env               # Client environment variables
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── socket.config.js
│   ├── controllers/
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js        # JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Room.js
│   ├── socket/
│   │   └── socketHandler.js # Socket.IO logic
│   ├── utils/
│   │   └── helpers.js
│   ├── .env               # Server environment variables
│   ├── server.js          # Entry point
│   └── package.json
└── README.md
```

## 🧪 Testing

### Test Locally
1. Open two browser windows side-by-side
2. Log in with different usernames in same room
3. Test all features:
   - Send messages
   - Type to see typing indicator
   - Send private message
   - React to messages
   - Share files
   - Check read receipts

### Test Production
1. Open deployed URL
2. Test with multiple devices
3. Check mobile responsiveness
4. Verify notifications work

## 🐛 Troubleshooting

### MongoDB Connection Error
```
❌ MongoDB Connection Error: bad auth : Authentication failed.
```
**Solution:** Update MongoDB password in `.env` file

### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Update `CLIENT_URL` in server `.env` to match your frontend URL

### Socket Connection Failed
```
WebSocket connection to 'ws://...' failed
```
**Solution:** Check `REACT_APP_SOCKET_URL` in client `.env`

### Render Cold Start
**Issue:** First request takes 30 seconds
**Solution:** This is normal for free tier - server "wakes up" after inactivity

## 📈 Performance Optimization

- **Message Pagination** - Loads latest 50 messages
- **Reconnection Logic** - Auto-reconnects with exponential backoff
- **Debounced Typing** - 1-second delay to reduce events
- **Optimized Re-renders** - React memoization where needed

## 🔒 Security

- **JWT Authentication** - Secure token-based auth
- **Environment Variables** - Sensitive data not in code
- **Input Validation** - Server-side validation
- **CORS Protection** - Whitelist allowed origins
- **Rate Limiting** - Prevent spam (ready to implement)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ivy Kimenju**
- GitHub: [@kimenjuivy](https://github.com/kimenjuivy)
- Email: ivykimenju@example.com

## 🙏 Acknowledgments

- Socket.IO Documentation
- React Documentation
- MongoDB Atlas
- PLP Academy
- Anthropic Claude AI

## 📞 Support

For support, email ivykimenju@example.com or open an issue on GitHub.

---

Built with ❤️ using Socket.IO, React, Node.js, and MongoDB