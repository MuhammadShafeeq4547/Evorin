// mai apko backend ka routes or frontend ka code send kr rha hn mujhy frontend proper working ka sath hr 1 component professional bna do he 1 featured add ho rha ho or working mai ho proper backend ka sath intrgate kr ka do kuch miss ni krna frontend ka sary component professional or backend ka sath proper working ka sath kr do navbar ka under log in sign up button mean sb professional bnao

// mai apko schema send kr rha hn ta ka ap sahi keys use kr sako or app.js ki file bhi ta ka sahi routing use kr sako or hr compnents ka alg se name likh ka code bnao ta ka copy krna mai asaani ho

// lakin code complete hona chyai miss kuch na ho 

// frontend complete bnana hy components ka sath proper working ka sath mock data ya test data use ni krna backend ki api ka sath working mai ho

// const mongoose = require('mongoose');

// const messageSchema = new mongoose.Schema({
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaUser',
//     required: true
//   },
//   text: {
//     type: String,
//     trim: true
//   },
//   image: {
//     url: String,
//     publicId: String
//   },
//   post: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaPost'
//   },
//   readBy: [{
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'InstaUser'
//     },
//     readAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   messageType: {
//     type: String,
//     enum: ['text', 'image', 'post'],
//     default: 'text'
//   }
// }, {
//   timestamps: true
// });

// const chatSchema = new mongoose.Schema({
//   participants: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaUser',
//     required: true
//   }],
//   messages: [messageSchema],
//   lastMessage: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaMessage'
//   },
//   isGroupChat: {
//     type: Boolean,
//     default: false
//   },
//   groupName: String,
//   groupAvatar: String,
//   admins: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaUser'
//   }]
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('InstaChat', chatSchema);

// const mongoose = require('mongoose');

// const commentSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaUser',
//     required: true
//   },
//   post: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaPost',
//     required: true
//   },
//   text: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 500
//   },
//   likes: [{
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'InstaUser'
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   replies: [{
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'InstaUser'
//     },
//     text: {
//       type: String,
//       required: true,
//       trim: true
//     },
//     likes: [{
//       user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'InstaUser'
//       },
//       createdAt: {
//         type: Date,
//         default: Date.now
//       }
//     }],
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }]
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model('InstaComment', commentSchema);

// const mongoose = require('mongoose');

// const notificationSchema = new mongoose.Schema({
//   recipient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaUser',
//     required: true
//   },
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaUser',
//     required: true
//   },
//   type: {
//     type: String,
//     enum: ['like', 'comment', 'follow', 'mention', 'post_tag'],
//     required: true
//   },
//   post: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaPost'
//   },
//   comment: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaComment'
//   },
//   message: {
//     type: String,
//     trim: true
//   },
//   isRead: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// notificationSchema.index({ recipient: 1, createdAt: -1 });

// module.exports = mongoose.model('InstaNotification', notificationSchema);

// const mongoose = require('mongoose');

// const postSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaUser',
//     required: true
//   },
//   images: [{
//     url: String,
//     publicId: String
//   }],
//   caption: {
//     type: String,
//     trim: true,
//     maxlength: 2200
//   },
//   likes: [{
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'InstaUser'
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }],
//   comments: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaComment'
//   }],
//   location: {
//     type: String,
//     trim: true
//   },
//   tags: [{
//     type: String,
//     trim: true
//   }],
//   isArchived: {
//     type: Boolean,
//     default: false
//   },
//   commentsDisabled: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// postSchema.index({ user: 1, createdAt: -1 });
// postSchema.index({ createdAt: -1 });

// module.exports = mongoose.model('InstaPost', postSchema);

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     minlength: 3,
//     maxlength: 30,
//     lowercase: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     lowercase: true
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 6
//   },
//   fullName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   avatar: {
//     type: String,
//     default: ''
//   },
//   bio: {
//     type: String,
//     default: '',
//     maxlength: 150
//   },
//   website: {
//     type: String,
//     default: ''
//   },
//   followers: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaUser'
//   }],
//   following: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaUser'
//   }],
//   posts: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaPost'
//   }],
//   saved: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'InstaPost'
//   }],
//   isPrivate: {
//     type: Boolean,
//     default: false
//   },
//   isVerified: {
//     type: Boolean,
//     default: false
//   },
//   lastSeen: {
//     type: Date,
//     default: Date.now
//   },
//   isOnline: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// // Indexes for better performance
// userSchema.index({ username: 1 });
// userSchema.index({ email: 1 });
// userSchema.index({ followers: 1 });
// userSchema.index({ following: 1 });

// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// userSchema.methods.comparePassword = async function(password) {
//   return await bcrypt.compare(password, this.password);
// };

// userSchema.methods.toJSON = function() {
//   const user = this.toObject();
//   delete user.password;
//   return user;
// };

// // Virtual for posts count
// userSchema.virtual('postsCount').get(function() {
//   return this.posts.length;
// });

// // Virtual for followers count
// userSchema.virtual('followersCount').get(function() {
//   return this.followers.length;
// });

// // Virtual for following count
// userSchema.virtual('followingCount').get(function() {
//   return this.following.length;
// });

// module.exports = mongoose.model('InstaUser', userSchema);

// const express = require('express');
// const { body } = require('express-validator');
// const { login, logout, register, getCurrentUser } = require('../controllers/authController');
// const auth = require('../middleware/auth');

// const router = express.Router();

// // Validation rules
// const registerValidation = [
//   body('username')
//     .isLength({ min: 3, max: 30 })
//     .withMessage('Username must be between 3 and 30 characters')
//     .matches(/^[a-zA-Z0-9._]+$/)
//     .withMessage('Username can only contain letters, numbers, dots and underscores')
//     .custom(async (value) => {
//       // Check for reserved usernames
//       const reserved = ['admin', 'api', 'www', 'mail', 'support'];
//       if (reserved.includes(value.toLowerCase())) {
//         throw new Error('Username is reserved');
//       }
//       return true;
//     }),
//   body('email')
//     .isEmail()
//     .normalizeEmail()
//     .withMessage('Please provide a valid email'),
//   body('password')
//     .isLength({ min: 8 })
//     .withMessage('Password must be at least 8 characters long')
//     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
//     .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
//   body('fullName')
//     .isLength({ min: 1, max: 50 })
//     .withMessage('Full name is required and must not exceed 50 characters')
//     .trim()
// ];

// const loginValidation = [
//   body('email')
//     .isEmail()
//     .normalizeEmail()
//     .withMessage('Please provide a valid email'),
//   body('password')
//     .notEmpty()
//     .withMessage('Password is required')
// ];

// // Routes
// router.post('/register', registerValidation, register);
// router.post('/login', loginValidation, login);
// router.post('/logout', auth, logout);
// router.get('/me', auth, getCurrentUser);

// module.exports = router;const express = require('express');
// const chatController = require('../controllers/chatController');
// const auth = require('../middleware/auth');
// const upload = require('../middleware/upload');
// const { body } = require('express-validator');

// const router = express.Router();

// const messageValidation = [
//   body('text')
//     .optional()
//     .isLength({ min: 1, max: 1000 })
//     .withMessage('Message must be between 1 and 1000 characters')
//     .trim(),
//   body('messageType')
//     .isIn(['text', 'image', 'post'])
//     .withMessage('Invalid message type'),
//   body('postId')
//     .optional()
//     .isMongoId()
//     .withMessage('Invalid post ID')
// ];

// router.get('/', auth, chatController.getUserChats);
// router.get('/:userId', auth, chatController.getOrCreateChat);
// router.post('/:chatId/message', auth, upload.single('image'), messageValidation, chatController.sendMessage);
// router.post('/:chatId/read', auth, chatController.markAsRead);
// router.delete('/:chatId', auth, chatController.deleteChat);
// router.get('/messages/:chatId', auth, chatController.getChatMessages);

// module.exports = router;

// const express = require('express');
// const commentController = require('../controllers/commentController');
// const auth = require('../middleware/auth');
// const { body } = require('express-validator');

// const router = express.Router();

// const commentValidation = [
//   body('text')
//     .isLength({ min: 1, max: 500 })
//     .withMessage('Comment must be between 1 and 500 characters')
//     .trim()
// ];

// const replyValidation = [
//   body('text')
//     .isLength({ min: 1, max: 300 })
//     .withMessage('Reply must be between 1 and 300 characters')
//     .trim()
// ];

// router.post('/:postId', auth, commentValidation, commentController.addComment);
// router.get('/:postId', auth, commentController.getPostComments);
// router.post('/like/:commentId', auth, commentController.toggleCommentLike);
// router.post('/:commentId/reply', auth, replyValidation, commentController.replyToComment);
// router.put('/:commentId', auth, commentValidation, commentController.updateComment);
// router.delete('/:commentId', auth, commentController.deleteComment);

// module.exports = router;

// const express = require('express');
// const notificationController = require('../controllers/notificationController');
// const auth = require('../middleware/auth');

// const router = express.Router();

// router.get('/', auth, notificationController.getNotifications);
// router.post('/:notificationId/read', auth, notificationController.markAsRead);
// router.post('/read-all', auth, notificationController.markAllAsRead);
// router.get('/unread-count', auth, notificationController.getUnreadCount);
// router.delete('/:notificationId', auth, notificationController.deleteNotification);
// router.delete('/clear-all', auth, notificationController.clearAllNotifications);

// module.exports = router;

// const express = require('express');
// const postController = require('../controllers/postController');
// const auth = require('../middleware/auth');
// const upload = require('../middleware/upload');
// const { body } = require('express-validator');

// const router = express.Router();

// const postValidation = [
//   body('caption')
//     .optional()
//     .isLength({ max: 2200 })
//     .withMessage('Caption cannot exceed 2200 characters'),
//   body('location')
//     .optional()
//     .isLength({ max: 100 })
//     .withMessage('Location cannot exceed 100 characters'),
//   body('tags')
//     .optional()
//     .custom((value) => {
//       if (value && typeof value === 'string') {
//         const tags = value.split(',').map(tag => tag.trim());
//         if (tags.length > 20) {
//           throw new Error('Cannot have more than 20 tags');
//         }
//         if (tags.some(tag => tag.length > 30)) {
//           throw new Error('Each tag cannot exceed 30 characters');
//         }
//       }
//       return true;
//     })
// ];

// router.post('/', auth, upload.array('images', 10), postValidation, postController.createPost);
// router.get('/feed', auth, postController.getFeedPosts);
// router.get('/explore', auth, postController.getExplorePosts);
// router.get('/saved', auth, postController.getSavedPosts);
// router.get('/search', auth, postController.searchPosts);
// router.get('/:postId', auth, postController.getPost);
// router.post('/:postId/like', auth, postController.toggleLike);
// router.post('/:postId/save', auth, postController.toggleSave);
// router.put('/:postId', auth, postController.updatePost);
// router.delete('/:postId', auth, postController.deletePost);

// module.exports = router;


// const express = require('express');
// const userController = require('../controllers/userController');
// const auth = require('../middleware/auth');
// const upload = require('../middleware/upload');
// const { body } = require('express-validator');

// const router = express.Router();

// const profileUpdateValidation = [
//   body('fullName')
//     .optional()
//     .isLength({ min: 1, max: 50 })
//     .withMessage('Full name must be between 1 and 50 characters')
//     .trim(),
//   body('bio')
//     .optional()
//     .isLength({ max: 150 })
//     .withMessage('Bio cannot exceed 150 characters')
//     .trim(),
//   body('website')
//     .optional()
//     .isURL({ protocols: ['http', 'https'] })
//     .withMessage('Please provide a valid website URL')
// ];

// router.get('/profile/:username', auth, userController.getUserProfile);
// router.put('/profile', auth, upload.single('avatar'), profileUpdateValidation, userController.updateProfile);
// router.post('/follow/:userId', auth, userController.toggleFollow);
// router.get('/followers/:userId', auth, userController.getFollowers);
// router.get('/following/:userId', auth, userController.getFollowing);
// router.get('/search', auth, userController.searchUsers);
// router.get('/suggested', auth, userController.getSuggestedUsers);
// router.post('/block/:userId', auth, userController.blockUser);
// router.post('/unblock/:userId', auth, userController.unblockUser);
// router.get('/blocked', auth, userController.getBlockedUsers);

// module.exports = router;
