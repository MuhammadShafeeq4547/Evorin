# Instagram Clone - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** v16+ (https://nodejs.org/)
- **npm** v8+ or **yarn**
- **MongoDB** (Local or Atlas Cloud)
- **Git**

### Required Accounts
- **MongoDB Atlas** (https://www.mongodb.com/cloud/atlas) - Free tier available
- **Cloudinary** (https://cloudinary.com) - Free tier available
- **Gmail Account** with App Password enabled
- **VAPID Keys** for Push Notifications (generated locally)

### Verify Installation
```bash
node --version    # Should be v16+
npm --version     # Should be v8+
git --version     # Should be installed
```

---

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd instgram
```

### 2. Generate Secrets
```bash
# Generate JWT secrets
node -e "console.log('JWT_SECRET:', require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET:', require('crypto').randomBytes(32).toString('hex'))"

# Generate VAPID keys for push notifications
npx web-push generate-vapid-keys
```

### 3. Create Backend .env File
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your values:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/instagram_clone
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-refresh-secret>
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=<your-app-password>
VAPID_PUBLIC_KEY=<generated-public-key>
VAPID_PRIVATE_KEY=<generated-private-key>
VAPID_SUBJECT=mailto:your_email@example.com
```

### 4. Create Frontend .env File
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

---

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Verify MongoDB Connection
```bash
# Test connection
npm run dev
# Should print: "MongoDB connected"
```

### 3. Seed Database (Optional)
```bash
npm run seed
```

This creates sample users, posts, and stories for testing.

### 4. Start Backend Server
```bash
npm run dev
```

Expected output:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Instagram Clone Server Running                       ║
║                                                           ║
║   Port: 5000                                              ║
║   Environment: development                                ║
║   Frontend: http://localhost:5173                         ║
║                                                           ║
║   📡 Socket.IO: Active                                     ║
║   📧 Email Service: Configured                            ║
║   🤖 AI Features: Disabled                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### 5. Test Backend Health
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 5.234,
  "message": "Server is running",
  "environment": "development"
}
```

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Expected output:
```
  VITE v7.1.12  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 3. Open in Browser
Navigate to `http://localhost:5173`

---

## Running the Application

### Development Mode (Two Terminal Windows)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Manual API Testing

#### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 3. Get Current User (with token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

#### 4. Create Post
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer <access_token>" \
  -F "images=@/path/to/image.jpg" \
  -F "caption=My first post!" \
  -F "location=New York"
```

#### 5. Get Feed
```bash
curl -X GET http://localhost:5000/api/posts/feed \
  -H "Authorization: Bearer <access_token>"
```

### Frontend Testing Checklist

- [ ] Register new account
- [ ] Verify email (check console for link)
- [ ] Login with credentials
- [ ] View feed
- [ ] Create post with image
- [ ] Like/unlike post
- [ ] Comment on post
- [ ] Follow/unfollow user
- [ ] View profile
- [ ] Edit profile
- [ ] Send message
- [ ] Toggle dark mode
- [ ] Dark mode persists on reload

---

## Deployment

### Backend Deployment (Render/Railway)

#### Option 1: Render.com
1. Push code to GitHub
2. Connect GitHub repo to Render
3. Create new Web Service
4. Set environment variables
5. Deploy

#### Option 2: Railway.app
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Set variables: `railway variables`
5. Deploy: `railway up`

### Frontend Deployment (Vercel)

#### Option 1: Vercel CLI
```bash
npm i -g vercel
cd frontend
vercel
```

#### Option 2: GitHub Integration
1. Push to GitHub
2. Connect repo to Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy

### Database Deployment (MongoDB Atlas)

1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Add to `.env` as `MONGODB_URI`

---

## Troubleshooting

### Backend Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** 
- Ensure MongoDB is running locally, OR
- Use MongoDB Atlas connection string in `.env`

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# Or change PORT in .env
```

#### Email Service Error
```
Error: Invalid login: 535-5.7.8 Username and password not accepted
```
**Solution:**
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" if using regular password
- Check EMAIL_USER and EMAIL_PASSWORD in `.env`

#### Cloudinary Upload Error
```
Error: Invalid API Key
```
**Solution:**
- Verify CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- Regenerate keys at https://cloudinary.com/console

### Frontend Issues

#### API Connection Error
```
Error: Network Error
```
**Solution:**
- Ensure backend is running on port 5000
- Check VITE_API_URL in `.env`
- Check CORS settings in backend

#### Socket.IO Connection Error
```
Error: WebSocket connection failed
```
**Solution:**
- Ensure backend Socket.IO is running
- Check firewall settings
- Verify token is being passed in socket auth

#### Dark Mode Not Persisting
**Solution:**
- Check browser localStorage is enabled
- Clear browser cache and reload
- Check ThemeContext implementation

### Database Issues

#### Duplicate Key Error
```
MongoError: E11000 duplicate key error
```
**Solution:**
```bash
# Drop and recreate indexes
db.users.dropIndex("email_1")
db.users.dropIndex("username_1")
```

#### Connection Timeout
```
Error: connection timed out
```
**Solution:**
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check network connectivity

---

## Performance Optimization

### Backend
- Enable Redis caching for frequently accessed data
- Add database indexes for common queries
- Implement pagination for large datasets
- Use lean() queries when full documents aren't needed

### Frontend
- Enable code splitting in Vite
- Lazy load components with React.lazy()
- Optimize images with Cloudinary transformations
- Use React.memo for expensive components

---

## Security Checklist

- [ ] Change all default secrets in `.env`
- [ ] Enable HTTPS in production
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Implement rate limiting on auth endpoints
- [ ] Validate all user inputs
- [ ] Use CORS whitelist
- [ ] Enable helmet.js security headers
- [ ] Implement CSRF protection
- [ ] Use environment variables for sensitive data
- [ ] Regular security audits

---

## Support & Resources

- **MongoDB Docs:** https://docs.mongodb.com/
- **Express Docs:** https://expressjs.com/
- **React Docs:** https://react.dev/
- **Socket.IO Docs:** https://socket.io/docs/
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Nodemailer Docs:** https://nodemailer.com/

---

## License

This project is licensed under the MIT License.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Last Updated:** January 2024
**Version:** 1.0.0
