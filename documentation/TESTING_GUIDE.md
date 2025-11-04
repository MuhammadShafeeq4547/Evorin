# Testing Guide - Instagram Clone

Complete testing procedures for all features.

## Table of Contents
1. [Backend API Testing](#backend-api-testing)
2. [Frontend Feature Testing](#frontend-feature-testing)
3. [Real-time Testing](#real-time-testing)
4. [Performance Testing](#performance-testing)
5. [Security Testing](#security-testing)

---

## Backend API Testing

### Setup
```bash
cd backend
npm run dev
```

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 5.234,
  "message": "Server is running",
  "environment": "development"
}
```

### 2. Authentication Tests

#### Register User
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

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User"
  },
  "accessToken": "eyJhbGc..."
}
```

#### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {...},
  "accessToken": "eyJhbGc..."
}
```

#### Get Current User
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "followers": [],
    "following": []
  }
}
```

#### Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh_token>"}'
```

**Expected Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGc..."
}
```

### 3. Post Tests

#### Create Post
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer <access_token>" \
  -F "images=@/path/to/image.jpg" \
  -F "caption=My first post!" \
  -F "location=New York" \
  -F "tags=travel,photography"
```

**Expected Response:**
```json
{
  "success": true,
  "post": {
    "_id": "...",
    "user": {...},
    "images": [...],
    "caption": "My first post!",
    "likesCount": 0,
    "comments": []
  }
}
```

#### Get Feed
```bash
curl -X GET "http://localhost:5000/api/posts/feed?page=1&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

**Expected Response:**
```json
{
  "success": true,
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "hasMore": false
  }
}
```

#### Get Explore Posts
```bash
curl -X GET "http://localhost:5000/api/posts/explore?page=1&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

#### Like Post
```bash
curl -X POST http://localhost:5000/api/posts/<postId>/like \
  -H "Authorization: Bearer <access_token>"
```

**Expected Response:**
```json
{
  "success": true,
  "isLiked": true,
  "likesCount": 1
}
```

#### Unlike Post
```bash
curl -X POST http://localhost:5000/api/posts/<postId>/like \
  -H "Authorization: Bearer <access_token>"
```

**Expected Response:**
```json
{
  "success": true,
  "isLiked": false,
  "likesCount": 0
}
```

#### Save Post
```bash
curl -X POST http://localhost:5000/api/posts/<postId>/save \
  -H "Authorization: Bearer <access_token>"
```

#### Update Post
```bash
curl -X PUT http://localhost:5000/api/posts/<postId> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Updated caption",
    "location": "Los Angeles"
  }'
```

#### Delete Post
```bash
curl -X DELETE http://localhost:5000/api/posts/<postId> \
  -H "Authorization: Bearer <access_token>"
```

### 4. User Tests

#### Get User Profile
```bash
curl -X GET "http://localhost:5000/api/users/<username>/profile?page=1&limit=21" \
  -H "Authorization: Bearer <access_token>"
```

#### Update Profile
```bash
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "New Name",
    "bio": "My bio",
    "website": "https://example.com"
  }'
```

#### Follow User
```bash
curl -X POST http://localhost:5000/api/users/<userId>/follow \
  -H "Authorization: Bearer <access_token>"
```

#### Get Followers
```bash
curl -X GET "http://localhost:5000/api/users/<userId>/followers?page=1&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

#### Get Following
```bash
curl -X GET "http://localhost:5000/api/users/<userId>/following?page=1&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

### 5. Comment Tests

#### Create Comment
```bash
curl -X POST http://localhost:5000/api/comments \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "<postId>",
    "text": "Great post!"
  }'
```

#### Like Comment
```bash
curl -X POST http://localhost:5000/api/comments/<commentId>/like \
  -H "Authorization: Bearer <access_token>"
```

#### Reply to Comment
```bash
curl -X POST http://localhost:5000/api/comments/<commentId>/reply \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Thanks!"
  }'
```

---

## Frontend Feature Testing

### 1. Authentication Flow

**Test Case: User Registration**
- [ ] Navigate to /register
- [ ] Fill in all fields
- [ ] Click Register
- [ ] See success message
- [ ] Check email for verification link (or console)
- [ ] Click verification link
- [ ] See "Email verified" message

**Test Case: User Login**
- [ ] Navigate to /login
- [ ] Enter email and password
- [ ] Click Login
- [ ] Redirected to feed
- [ ] User info displayed in header

**Test Case: Token Refresh**
- [ ] Login successfully
- [ ] Wait 15+ minutes (or manually expire token)
- [ ] Make API request
- [ ] Should automatically refresh token
- [ ] Request succeeds

### 2. Post Features

**Test Case: Create Post**
- [ ] Click "Create" button
- [ ] Select image(s)
- [ ] Add caption
- [ ] Add location
- [ ] Add tags
- [ ] Click Post
- [ ] Post appears in feed immediately
- [ ] Image loads correctly

**Test Case: Like Post**
- [ ] Click heart icon on post
- [ ] Heart fills with color
- [ ] Like count increases
- [ ] Click again to unlike
- [ ] Heart empties
- [ ] Like count decreases

**Test Case: Comment on Post**
- [ ] Click comment icon
- [ ] Type comment
- [ ] Press Enter or click Send
- [ ] Comment appears immediately
- [ ] Comment count increases

**Test Case: Save Post**
- [ ] Click bookmark icon
- [ ] Bookmark fills with color
- [ ] Navigate to Saved
- [ ] Post appears in saved list

### 3. User Features

**Test Case: Follow User**
- [ ] Navigate to user profile
- [ ] Click Follow button
- [ ] Button changes to Following
- [ ] User appears in Following list
- [ ] Click Following to unfollow
- [ ] Button changes back to Follow

**Test Case: Edit Profile**
- [ ] Click profile icon
- [ ] Click Edit Profile
- [ ] Change bio, website, etc.
- [ ] Upload new avatar
- [ ] Click Save
- [ ] Changes appear immediately

### 4. Messaging

**Test Case: Send Message**
- [ ] Open Messages
- [ ] Select or create chat
- [ ] Type message
- [ ] Press Enter
- [ ] Message appears in chat
- [ ] Message shows as sent

**Test Case: Typing Indicator**
- [ ] Open chat with another user (in another browser)
- [ ] Start typing in one browser
- [ ] See "typing..." in other browser
- [ ] Stop typing
- [ ] Typing indicator disappears

**Test Case: Read Receipts**
- [ ] Send message
- [ ] See checkmark (sent)
- [ ] Other user opens chat
- [ ] See double checkmark (read)

### 5. Dark Mode

**Test Case: Toggle Dark Mode**
- [ ] Click theme toggle in header
- [ ] UI changes to dark colors
- [ ] Click again
- [ ] UI changes back to light
- [ ] Refresh page
- [ ] Theme persists

### 6. Responsive Design

**Test Case: Mobile View (320px)**
- [ ] Open DevTools
- [ ] Set viewport to 320x568
- [ ] All elements visible
- [ ] No horizontal scroll
- [ ] Touch targets are large enough
- [ ] Navigation works

**Test Case: Tablet View (768px)**
- [ ] Set viewport to 768x1024
- [ ] Layout adapts properly
- [ ] Two-column layout if applicable
- [ ] All features accessible

**Test Case: Desktop View (1920px)**
- [ ] Set viewport to 1920x1080
- [ ] Full layout displayed
- [ ] Sidebar visible
- [ ] All features accessible

---

## Real-time Testing

### 1. Socket.IO Connection

**Test Case: Connect to Socket**
- [ ] Open browser DevTools
- [ ] Go to Network tab
- [ ] Filter by WS (WebSocket)
- [ ] Should see socket.io connection
- [ ] Connection shows as "101 Switching Protocols"

**Test Case: Real-time Like Update**
- [ ] Open same post in two browsers
- [ ] Like post in browser 1
- [ ] Like count updates in browser 2 immediately
- [ ] No page refresh needed

**Test Case: Real-time Comment Update**
- [ ] Open same post in two browsers
- [ ] Comment in browser 1
- [ ] Comment appears in browser 2 immediately
- [ ] Comment count updates

### 2. Messaging Real-time

**Test Case: Real-time Message Delivery**
- [ ] Open chat in two browsers
- [ ] Send message from browser 1
- [ ] Message appears in browser 2 immediately
- [ ] No refresh needed

**Test Case: Online Status**
- [ ] Open chat in two browsers
- [ ] See online indicator for other user
- [ ] Close one browser
- [ ] Online indicator changes to offline
- [ ] Shows "last seen" time

---

## Performance Testing

### 1. Load Testing

**Test Case: Feed Loading**
- [ ] Open feed
- [ ] Scroll down
- [ ] Load more posts
- [ ] Should load smoothly
- [ ] No lag or freezing

**Test Case: Image Loading**
- [ ] Create post with large image
- [ ] Image should load quickly
- [ ] Should be optimized (not full resolution)

### 2. Memory Leaks

**Test Case: Component Cleanup**
- [ ] Open DevTools Memory tab
- [ ] Take heap snapshot
- [ ] Navigate between pages
- [ ] Take another snapshot
- [ ] Memory should not grow significantly

---

## Security Testing

### 1. Authentication Security

**Test Case: Invalid Token**
- [ ] Manually modify token in localStorage
- [ ] Try to access protected route
- [ ] Should redirect to login

**Test Case: Expired Token**
- [ ] Wait for token to expire
- [ ] Make API request
- [ ] Should automatically refresh
- [ ] Request should succeed

### 2. Authorization

**Test Case: Cannot Edit Others' Posts**
- [ ] Try to edit another user's post via API
- [ ] Should get 403 Forbidden error

**Test Case: Cannot Delete Others' Posts**
- [ ] Try to delete another user's post via API
- [ ] Should get 403 Forbidden error

### 3. Input Validation

**Test Case: XSS Prevention**
- [ ] Try to post HTML/JavaScript in caption
- [ ] Should be escaped/sanitized
- [ ] Should not execute

**Test Case: SQL Injection**
- [ ] Try to search with SQL injection payload
- [ ] Should return no results
- [ ] Should not cause error

---

## Automated Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

---

## Test Results Checklist

### Backend
- [ ] All auth endpoints return correct responses
- [ ] All post endpoints work correctly
- [ ] All user endpoints work correctly
- [ ] All comment endpoints work correctly
- [ ] All chat endpoints work correctly
- [ ] Error handling works properly
- [ ] Rate limiting works
- [ ] CORS is configured correctly

### Frontend
- [ ] All pages load without errors
- [ ] All forms submit correctly
- [ ] All buttons work
- [ ] All links navigate correctly
- [ ] Dark mode works and persists
- [ ] Responsive design works at all breakpoints
- [ ] No console errors
- [ ] No memory leaks

### Real-time
- [ ] Socket.IO connects successfully
- [ ] Real-time updates work
- [ ] Typing indicators work
- [ ] Read receipts work
- [ ] Online status works

### Performance
- [ ] Pages load in < 3 seconds
- [ ] Images load quickly
- [ ] No lag when scrolling
- [ ] No memory leaks

### Security
- [ ] Invalid tokens are rejected
- [ ] Expired tokens are refreshed
- [ ] Unauthorized access is blocked
- [ ] Input is properly validated
- [ ] XSS is prevented
- [ ] CSRF is prevented

---

## Reporting Issues

When reporting a bug, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/OS
5. Console errors (if any)
6. Network tab errors (if any)

---

**Last Updated:** January 15, 2024
