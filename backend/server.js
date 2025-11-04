// app.js - Enhanced server with all features
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const storyRoutes = require('./routes/storyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const reelRoutes = require('./routes/reelRoutes');
const searchRoutes = require('./routes/searchRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const twoFactorRoutes = require('./routes/2faRoutes');

// Import socket handler
const socketHandler = require('./socket/socketHandler');

// Import controllers for socket injection
const postController = require('./controllers/postController');
const commentController = require('./controllers/commentController');
const storyController = require('./controllers/storyController');
const reelController = require('./controllers/reelController');
const pushNotificationRoutes = require('./routes/pushNotificationRoutes');

const app = express();
const server = createServer(app);
app.use('/api/push', pushNotificationRoutes);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", ...allowedOrigins],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:", "blob:"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts, please try again later.'
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Database connection
connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/instagram_clone');

// Serve static files (for PWA)
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use('/service-worker.js', express.static(path.join(__dirname, '../client/public/service-worker.js')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/2fa', twoFactorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Socket.IO initialization
socketHandler(io);

// Inject socket instance into controllers
postController.setSocketInstance(io);
commentController.setSocketInstance(io);
storyController.setSocketInstance(io);
reelController.setSocketInstance(io);

// Serve React app for any other routes (SPA)
// FIXED: Use regex to exclude API routes and avoid path-to-regexp error
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Instagram Clone Server Running                       ║
║                                                           ║
║   Port: ${PORT}                                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}          ║
║                                                           ║
║   📡 Socket.IO: Active                                     ║
║   📧 Email Service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}                        ║
║   🤖 AI Features: ${process.env.OPENAI_API_KEY ? 'Enabled' : 'Disabled'}                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
  
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

module.exports = { app, server, io };