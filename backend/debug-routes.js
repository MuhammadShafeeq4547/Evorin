const express = require('express');
const app = express();

const routes = [
  { path: '/api/auth', file: './routes/authRoutes' },
  { path: '/api/users', file: './routes/userRoutes' },
  { path: '/api/posts', file: './routes/postRoutes' },
  { path: '/api/comments', file: './routes/commentRoutes' },
  { path: '/api/chat', file: './routes/chatRoutes' },
  { path: '/api/notifications', file: './routes/notificationRoutes' },
  { path: '/api/stories', file: './routes/storyRoutes' },
  { path: '/api/admin', file: './routes/adminRoutes' },
  { path: '/api/collections', file: './routes/collectionRoutes' },
  { path: '/api/reels', file: './routes/reelRoutes' },
  { path: '/api/search', file: './routes/searchRoutes' },
  { path: '/api/analytics', file: './routes/analyticsRoutes' },
  { path: '/api/push', file: './routes/pushNotificationRoutes' }
];

routes.forEach(({ path, file }) => {
  try {
    console.log(`Testing: ${file}...`);
    const router = require(file);
    app.use(path, router);
    console.log(`✅ ${file} is OK\n`);
  } catch (error) {
    console.log(`❌ ERROR in ${file}:`);
    console.log(error.message);
    console.log('\n');
    process.exit(1);
  }
});

console.log('🎉 All routes are valid!');