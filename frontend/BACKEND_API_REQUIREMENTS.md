# 🔌 BACKEND API REQUIREMENTS

This document lists all the backend API endpoints that the frontend expects to exist.

---

## ✅ CURRENTLY USED APIs (Implemented in Frontend)

### 🔐 Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/2fa/enable
POST   /api/auth/2fa/verify
POST   /api/auth/2fa/disable
POST   /api/auth/resend-verification
```

### 👤 Users
```
GET    /api/users/profile/:username
PUT    /api/users/profile
PUT    /api/users/email
GET    /api/users/search?query=...
POST   /api/users/follow/:userId
GET    /api/users/followers/:userId
GET    /api/users/following/:userId
GET    /api/users/suggested?limit=5
```

### 📝 Posts
```
POST   /api/posts
GET    /api/posts/feed?page=1&limit=10
GET    /api/posts/explore?page=1&limit=21
GET    /api/posts/:postId
POST   /api/posts/:postId/like
POST   /api/posts/:postId/save
GET    /api/posts/saved
```

### 💬 Comments
```
POST   /api/comments/:postId
GET    /api/comments/:postId
POST   /api/comments/like/:commentId
```

### 📖 Stories
```
GET    /api/stories
POST   /api/stories
POST   /api/stories/view/:storyId
GET    /api/stories/seen/:storyId
GET    /api/stories/public (fallback for unauthorized)
```

### 🎬 Reels
```
GET    /api/reels/feed
POST   /api/reels/:reelId/like
POST   /api/reels/:reelId/view
```

### 💬 Chat/Messages
```
GET    /api/chat
GET    /api/chat/:userId
GET    /api/chat/messages/:chatId
POST   /api/chat/:chatId/message
POST   /api/chat/:chatId/read
```

### 🔔 Notifications
```
GET    /api/notifications?limit=10
GET    /api/notifications/unread-count
POST   /api/notifications/:notificationId/read
```

### 👑 Admin
```
GET    /api/admin/users
GET    /api/admin/posts
GET    /api/admin/reports
GET    /api/admin/stats
DELETE /api/admin/users/:userId
POST   /api/admin/users/:userId/ban
DELETE /api/admin/posts/:postId
POST   /api/admin/reports/:reportId/resolve
```

---

## ❌ MISSING APIs (Needed for Complete Functionality)

### 🔐 Authentication (Missing)
```
POST   /api/auth/forgot-password
       Body: { email: string }
       Response: { success: boolean, message: string }

POST   /api/auth/reset-password/:token
       Body: { password: string }
       Response: { success: boolean, message: string }

GET    /api/auth/verify-email/:token
       Response: { success: boolean, message: string }

GET    /api/auth/sessions
       Response: { success: boolean, sessions: Array<Session> }

DELETE /api/auth/sessions/:sessionId
       Response: { success: boolean }
```

### 👤 Users (Missing)
```
PUT    /api/users/password
       Body: { currentPassword: string, newPassword: string }
       Response: { success: boolean }

PUT    /api/users/privacy
       Body: { isPrivate: boolean, allowTagging: string, allowMessages: string }
       Response: { success: boolean, user: User }

PUT    /api/users/notifications
       Body: { emailLikes: boolean, pushLikes: boolean, ... }
       Response: { success: boolean }

POST   /api/users/block/:userId
       Response: { success: boolean, isBlocked: boolean }

GET    /api/users/blocked
       Response: { success: boolean, users: Array<User> }

DELETE /api/users/account
       Body: { password: string }
       Response: { success: boolean }

GET    /api/posts/tagged/:userId
       Response: { success: boolean, posts: Array<Post> }
```

### 📝 Posts (Missing)
```
PUT    /api/posts/:postId
       Body: { caption: string, location: string, tags: Array<string> }
       Response: { success: boolean, post: Post }

DELETE /api/posts/:postId
       Response: { success: boolean }

POST   /api/posts/:postId/share
       Body: { type: 'dm' | 'story', recipientId?: string }
       Response: { success: boolean }
```

### 📖 Stories (Missing)
```
POST   /api/stories/:storyId/reply
       Body: { text: string }
       Response: { success: boolean }

POST   /api/stories/:storyId/react
       Body: { emoji: string }
       Response: { success: boolean }
```

### 🎬 Reels (Missing)
```
POST   /api/reels
       Body: FormData (video, caption, audio)
       Response: { success: boolean, reel: Reel }

GET    /api/reels/audio
       Response: { success: boolean, tracks: Array<AudioTrack> }
```

### 💬 Chat/Messages (Missing)
```
POST   /api/chat/group
       Body: { name: string, participants: Array<string> }
       Response: { success: boolean, chat: Chat }

POST   /api/chat/message/:messageId/react
       Body: { emoji: string }
       Response: { success: boolean }

GET    /api/chat/search?query=...
       Response: { success: boolean, messages: Array<Message> }
```

### 🔔 Notifications (Missing)
```
DELETE /api/notifications/clear
       Response: { success: boolean }

POST   /api/notifications/subscribe
       Body: { subscription: PushSubscription }
       Response: { success: boolean }
```

### 🏷️ Hashtags & Locations (Missing)
```
GET    /api/hashtags/:hashtag
       Response: { success: boolean, posts: Array<Post>, stats: Object }

GET    /api/locations/:location
       Response: { success: boolean, posts: Array<Post> }
```

### 📚 Collections (Missing)
```
POST   /api/collections
       Body: { name: string }
       Response: { success: boolean, collection: Collection }

GET    /api/collections
       Response: { success: boolean, collections: Array<Collection> }

POST   /api/collections/:collectionId/add/:postId
       Response: { success: boolean }
```

### 📖 Highlights (Missing)
```
POST   /api/highlights
       Body: { name: string, storyIds: Array<string> }
       Response: { success: boolean, highlight: Highlight }

GET    /api/highlights/:userId
       Response: { success: boolean, highlights: Array<Highlight> }
```

### 🚨 Reports (Missing)
```
POST   /api/reports/post/:postId
       Body: { reason: string, description: string }
       Response: { success: boolean }

POST   /api/reports/user/:userId
       Body: { reason: string, description: string }
       Response: { success: boolean }
```

### 🔍 Search (Missing)
```
GET    /api/search?query=...&type=...
       Query: { query: string, type: 'users' | 'posts' | 'hashtags' | 'locations' }
       Response: { success: boolean, results: Array<any> }
```

---

## 🔌 SOCKET.IO EVENTS

### Client → Server (Emit)
```javascript
// Chat
socket.emit('join_chat', chatId)
socket.emit('leave_chat', chatId)
socket.emit('send_message', { chatId, message })
socket.emit('typing_start', { chatId, userId })
socket.emit('typing_stop', { chatId, userId })

// Notifications
socket.emit('send_notification', { recipientId, notification })
```

### Server → Client (Listen)
```javascript
// Connection
socket.on('connect', () => {})
socket.on('disconnect', (reason) => {})
socket.on('connect_error', (error) => {})

// Chat
socket.on('new_message', (data) => {})
socket.on('chat_joined', (data) => {})
socket.on('typing', (data) => {})

// Posts
socket.on('new_post', (data) => {})
socket.on('post_liked', (data) => {})
socket.on('comment_added', (data) => {})

// Stories
socket.on('story_added', (data) => {})
socket.on('new_story_available', (data) => {})
socket.on('story_viewed', (data) => {})

// Reels
socket.on('reel_liked', (data) => {})

// Notifications
socket.on('notification', (data) => {})

// Users
socket.on('user_online', (users) => {})
socket.on('user_offline', (userId) => {})

// Errors
socket.on('error', (error) => {})
```

---

## 📋 DATA MODELS (Expected by Frontend)

### User
```typescript
{
  _id: string
  username: string
  email: string
  fullName: string
  avatar: string
  bio?: string
  website?: string
  isPrivate: boolean
  isVerified: boolean
  isBlocked: boolean
  role: 'user' | 'admin'
  followers: Array<string | User>
  following: Array<string | User>
  saved: Array<string>
  twoFactorEnabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Post
```typescript
{
  _id: string
  user: User
  images: Array<{ url: string, publicId: string }>
  caption?: string
  location?: string
  tags?: Array<string>
  likes: Array<{ user: string, createdAt: Date }>
  likesCount: number
  comments: Array<Comment>
  commentsCount: number
  saved: Array<string>
  commentsDisabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Comment
```typescript
{
  _id: string
  user: User
  post: string
  text: string
  likes: Array<{ user: string }>
  isLiked: boolean
  replies?: Array<Comment>
  createdAt: Date
  updatedAt: Date
}
```

### Story
```typescript
{
  _id: string
  user: User
  mediaType: 'image' | 'video'
  mediaUrl: string
  viewers: Array<{ _id: string, viewedAt: Date }>
  expiresAt: Date
  createdAt: Date
}
```

### Reel
```typescript
{
  _id: string
  user: User
  video: { url: string, publicId: string }
  caption?: string
  audio?: { name: string, artist: string }
  likes: Array<string>
  likesCount: number
  comments: Array<Comment>
  commentsCount: number
  views: number
  createdAt: Date
}
```

### Chat
```typescript
{
  _id: string
  participants: Array<User>
  messages: Array<Message>
  lastMessage?: Message
  unreadCount: number
  isGroup: boolean
  groupName?: string
  groupAvatar?: string
  createdAt: Date
  updatedAt: Date
}
```

### Message
```typescript
{
  _id: string
  sender: User
  chat: string
  text?: string
  image?: { url: string, publicId: string }
  messageType: 'text' | 'image' | 'voice' | 'video'
  readBy: Array<string>
  createdAt: Date
}
```

### Notification
```typescript
{
  _id: string
  recipient: string
  sender: User
  type: 'like' | 'comment' | 'follow' | 'mention' | 'post_tag'
  post?: Post
  comment?: Comment
  message?: string
  isRead: boolean
  createdAt: Date
}
```

---

## 🔒 AUTHENTICATION

### Headers
```
Authorization: Bearer <accessToken>
```

### Cookies (for refresh token)
```
refreshToken: <refreshToken>
httpOnly: true
secure: true (in production)
sameSite: 'strict'
```

### Token Refresh Flow
1. Frontend sends request with access token
2. If 401, frontend calls `/api/auth/refresh`
3. Backend validates refresh token (from cookie)
4. Backend returns new access token
5. Frontend retries original request with new token

---

## 📤 FILE UPLOAD

### Endpoints that accept files
```
POST   /api/posts (images/videos)
POST   /api/stories (image/video)
POST   /api/reels (video)
POST   /api/chat/:chatId/message (image/voice/video)
PUT    /api/users/profile (avatar)
```

### Expected Format
```
Content-Type: multipart/form-data

FormData:
  - images: File[] (for posts)
  - image: File (for stories)
  - video: File (for reels)
  - file: File (for messages)
  - avatar: File (for profile)
  - caption: string
  - location: string
  - tags: string (JSON array)
```

### File Constraints
- Max file size: 50MB
- Allowed types: image/*, video/*
- Max files per post: 10

---

## 🔍 PAGINATION

### Query Parameters
```
?page=1&limit=10
```

### Expected Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "hasMore": true
  }
}
```

---

## ⚠️ ERROR RESPONSES

### Standard Error Format
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (dev only)"
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Validation Error
- 429: Too Many Requests
- 500: Internal Server Error

---

## 📝 NOTES

1. All endpoints should return `{ success: boolean, ... }`
2. All dates should be ISO 8601 format
3. All IDs should be MongoDB ObjectId strings
4. All arrays should default to empty array `[]` if no data
5. All optional fields should be `null` or `undefined` if not set
6. All endpoints should validate input
7. All endpoints should handle errors gracefully
8. All file uploads should validate file type and size
9. All endpoints should implement rate limiting
10. All endpoints should log errors for debugging

---

**Last Updated:** November 5, 2025
**Created By:** Kiro AI Assistant
