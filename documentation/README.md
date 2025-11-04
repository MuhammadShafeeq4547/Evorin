# 📸 Instagram Clone - Full Stack MERN Application

A production-ready Instagram clone built with **React**, **Node.js**, **Express**, and **MongoDB**. Features real-time messaging, social interactions, and modern UI/UX.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Quick Links

- **[Quick Start](./QUICK_START.md)** - Get running in 5 minutes
- **[Setup Guide](./SETUP_GUIDE.md)** - Complete setup instructions
- **[Testing Guide](./TESTING_GUIDE.md)** - Testing procedures
- **[Deployment Guide](./DEPLOYMENT_CHECKLIST.md)** - Production deployment
- **[Project Summary](./PROJECT_SUMMARY.md)** - Full project overview
- **[Changelog](./CHANGELOG.md)** - All changes and fixes
- **[Audit Report](./AUDIT_REPORT.md)** - Code audit findings

---

## ✨ Features

### 🔐 Authentication & Security
- User registration with email verification
- Secure JWT-based authentication
- Password reset via email
- Two-factor authentication (2FA)
- Rate limiting on sensitive endpoints
- Secure token refresh mechanism

### 👥 Social Features
- Follow/unfollow users
- User profiles with posts
- Suggested users
- Block/unblock users
- User search
- Followers/following lists

### 📸 Posts & Content
- Create posts with multi-image upload
- Edit and delete posts
- Like/unlike posts (real-time)
- Comment and reply to comments
- Save/unsave posts
- Post search and filtering
- Feed and explore pages

### 💬 Real-time Messaging
- 1:1 and group messaging
- Typing indicators
- Message read receipts
- Message reactions
- Message editing/deletion
- Voice messages
- Online user tracking

### 🎨 User Experience
- Dark mode with persistence
- Fully responsive design (320px - 1920px)
- Smooth animations
- Loading states
- Error boundaries
- Toast notifications
- Accessible components

### 📊 Additional Features
- Email notifications
- Push notifications
- Analytics dashboard
- Collections/saved posts
- Stories (24h expiry)
- Reels (video content)
- Hashtag support
- Admin panel

---

## 🏗️ Tech Stack

### Backend
```
Node.js + Express
├── MongoDB (Database)
├── Socket.IO (Real-time)
├── Cloudinary (Media Storage)
├── Nodemailer (Email)
├── JWT (Authentication)
└── Helmet (Security)
```

### Frontend
```
React 19 + Vite
├── React Router (Navigation)
├── Axios (HTTP Client)
├── Socket.IO Client (Real-time)
├── Framer Motion (Animations)
├── TailwindCSS (Styling)
└── Context API (State Management)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- npm v8+
- MongoDB (local or Atlas)
- Git

### Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone <repository-url>
cd instgram

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Configure environment
cd backend && cp .env.example .env
cd ../frontend && cp .env.example .env

# 4. Start servers
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# 5. Open browser
# Navigate to http://localhost:5173
```

**For detailed setup:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 📖 Documentation

### Getting Started
- [Quick Start](./QUICK_START.md) - 5-minute setup
- [Setup Guide](./SETUP_GUIDE.md) - Complete configuration
- [Project Summary](./PROJECT_SUMMARY.md) - Full overview

### Development
- [Testing Guide](./TESTING_GUIDE.md) - Testing procedures
- [Audit Report](./AUDIT_REPORT.md) - Code audit findings
- [Changelog](./CHANGELOG.md) - All changes and fixes

### Deployment
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Production deployment
- [Troubleshooting](./SETUP_GUIDE.md#troubleshooting) - Common issues

---

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Manual Testing
See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing procedures including:
- API endpoint testing
- Frontend feature testing
- Real-time testing
- Performance testing
- Security testing

---

## 🔒 Security

✅ JWT authentication with refresh tokens
✅ Password hashing with bcryptjs
✅ Email verification
✅ Rate limiting
✅ CORS whitelist
✅ Helmet.js security headers
✅ Input validation
✅ XSS prevention
✅ CSRF protection
✅ Secure cookies
✅ 2FA support

---

## 📊 Project Structure

```
instgram/
├── backend/                 # Node.js + Express server
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── socket/             # Socket.IO handlers
│   ├── utils/              # Utility functions
│   ├── server.js           # Main entry point
│   └── package.json
│
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # Context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/             # Static files
│   ├── vite.config.js
│   └── package.json
│
├── SETUP_GUIDE.md          # Setup instructions
├── QUICK_START.md          # Quick start guide
├── TESTING_GUIDE.md        # Testing procedures
├── DEPLOYMENT_CHECKLIST.md # Deployment guide
├── PROJECT_SUMMARY.md      # Project overview
├── CHANGELOG.md            # Changes and fixes
├── AUDIT_REPORT.md         # Code audit
└── README.md               # This file
```

---

## 🚀 Deployment

### Recommended Platforms
- **Backend:** Render, Railway, Heroku
- **Frontend:** Vercel, Netlify
- **Database:** MongoDB Atlas
- **Media:** Cloudinary

### Deployment Steps
1. Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
2. Configure production environment variables
3. Deploy backend to hosting platform
4. Deploy frontend to CDN/hosting
5. Verify all endpoints
6. Monitor logs and metrics

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Error: connect ECONNREFUSED
```
Solution: Start MongoDB or use MongoDB Atlas connection string

**Port Already in Use**
```
Error: EADDRINUSE: address already in use :::5000
```
Solution: Change PORT in `.env` or kill process

**Email Not Sending**
```
Error: Invalid login
```
Solution: Use Gmail App Password (not regular password)

**API Connection Error**
```
Error: Network Error
```
Solution: Ensure backend is running on port 5000

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting) for more solutions.

---

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/instagram_clone
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your_email@example.com
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

See [.env.example](./backend/.env.example) for complete list.

---

## 🎓 Learning Resources

- **MongoDB:** https://docs.mongodb.com/
- **Express:** https://expressjs.com/
- **React:** https://react.dev/
- **Socket.IO:** https://socket.io/docs/
- **Cloudinary:** https://cloudinary.com/documentation
- **TailwindCSS:** https://tailwindcss.com/docs

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify/:token` - Verify email
- `POST /api/auth/forgot` - Forgot password
- `POST /api/auth/reset/:token` - Reset password

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts/feed` - Get feed
- `GET /api/posts/explore` - Get explore posts
- `GET /api/posts/:postId` - Get single post
- `PUT /api/posts/:postId` - Update post
- `DELETE /api/posts/:postId` - Delete post
- `POST /api/posts/:postId/like` - Like/unlike post
- `POST /api/posts/:postId/save` - Save/unsave post

### Users
- `GET /api/users/:username/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:userId/follow` - Follow user
- `GET /api/users/:userId/followers` - Get followers
- `GET /api/users/:userId/following` - Get following
- `POST /api/users/:userId/block` - Block user
- `GET /api/users/search` - Search users

### Comments
- `POST /api/comments` - Create comment
- `POST /api/comments/:commentId/like` - Like comment
- `POST /api/comments/:commentId/reply` - Reply to comment

### Messages
- `GET /api/chat` - Get chats
- `POST /api/chat` - Create chat
- `GET /api/chat/:chatId` - Get chat messages
- `POST /api/chat/:chatId/message` - Send message

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed API testing.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Instagram for design inspiration
- MERN community for excellent documentation
- All contributors and testers

---

## 📞 Support

For issues or questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting)
2. Review [TESTING_GUIDE.md](./TESTING_GUIDE.md)
3. Check [AUDIT_REPORT.md](./AUDIT_REPORT.md)
4. Review backend logs
5. Check browser console

---

## 🎉 Ready to Get Started?

1. **Quick Start:** [QUICK_START.md](./QUICK_START.md) (5 minutes)
2. **Full Setup:** [SETUP_GUIDE.md](./SETUP_GUIDE.md) (15 minutes)
3. **Deploy:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
**Last Updated:** January 15, 2024

Made with ❤️ by the Development Team
