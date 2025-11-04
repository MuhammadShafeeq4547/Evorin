// seed.js - Database seeder for Instagram Clone
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Story = require('./models/Story');
const Chat = require('./models/Chat');
const Notification = require('./models/Notification');
const Reel = require('./models/Reel');
const Collection = require('./models/Collection');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/instagram_clone');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all collections
const clearDatabase = async () => {
  console.log('🗑️  Clearing database...');
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
  await Story.deleteMany({});
  await Chat.deleteMany({});
  await Notification.deleteMany({});
  await Reel.deleteMany({});
  await Collection.deleteMany({});
  console.log('✅ Database cleared');
};

// Seed users
const seedUsers = async () => {
  console.log('👥 Seeding users...');
  
  const users = [
    {
      username: 'john_doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10),
      fullName: 'John Doe',
      bio: 'Photographer | Travel Enthusiast 📸',
      avatar: 'https://i.pravatar.cc/150?img=12',
      website: 'https://johndoe.com',
      isVerified: true,
      isPrivate: false,
      role: 'user'
    },
    {
      username: 'jane_smith',
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Jane Smith',
      bio: 'Digital Artist | Coffee Lover ☕',
      avatar: 'https://i.pravatar.cc/150?img=5',
      isVerified: true,
      isPrivate: false,
      role: 'user'
    },
    {
      username: 'mike_wilson',
      email: 'mike@example.com',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Mike Wilson',
      bio: 'Fitness Coach | Motivational Speaker 💪',
      avatar: 'https://i.pravatar.cc/150?img=33',
      isVerified: false,
      isPrivate: false,
      role: 'user'
    },
    {
      username: 'sarah_jones',
      email: 'sarah@example.com',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Sarah Jones',
      bio: 'Food Blogger | Recipe Creator 🍕',
      avatar: 'https://i.pravatar.cc/150?img=9',
      website: 'https://sarahcooks.com',
      isVerified: true,
      isPrivate: false,
      role: 'user'
    },
    {
      username: 'alex_brown',
      email: 'alex@example.com',
      password: await bcrypt.hash('password123', 10),
      fullName: 'Alex Brown',
      bio: 'Tech Enthusiast | Gamer 🎮',
      avatar: 'https://i.pravatar.cc/150?img=18',
      isVerified: false,
      isPrivate: true,
      role: 'user'
    },
    {
      username: 'admin',
      email: 'admin@instagram.com',
      password: await bcrypt.hash('admin123', 10),
      fullName: 'Admin User',
      bio: 'Instagram Clone Administrator',
      avatar: 'https://i.pravatar.cc/150?img=1',
      isVerified: true,
      isPrivate: false,
      role: 'admin'
    }
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

// Seed follows
const seedFollows = async (users) => {
  console.log('🤝 Seeding follows...');
  
  // John follows Jane, Mike, Sarah
  await User.findByIdAndUpdate(users[0]._id, {
    $push: { 
      following: { $each: [users[1]._id, users[2]._id, users[3]._id] }
    }
  });
  
  // Jane follows John, Mike
  await User.findByIdAndUpdate(users[1]._id, {
    $push: { 
      following: { $each: [users[0]._id, users[2]._id] }
    }
  });
  
  // Mike follows everyone
  await User.findByIdAndUpdate(users[2]._id, {
    $push: { 
      following: { $each: [users[0]._id, users[1]._id, users[3]._id, users[4]._id] }
    }
  });
  
  // Sarah follows Jane, Alex
  await User.findByIdAndUpdate(users[3]._id, {
    $push: { 
      following: { $each: [users[1]._id, users[4]._id] }
    }
  });
  
  // Update followers
  await User.findByIdAndUpdate(users[0]._id, {
    $push: { followers: { $each: [users[1]._id, users[2]._id] } }
  });
  await User.findByIdAndUpdate(users[1]._id, {
    $push: { followers: { $each: [users[0]._id, users[2]._id, users[3]._id] } }
  });
  await User.findByIdAndUpdate(users[2]._id, {
    $push: { followers: { $each: [users[0]._id, users[1]._id] } }
  });
  await User.findByIdAndUpdate(users[3]._id, {
    $push: { followers: { $each: [users[0]._id, users[2]._id] } }
  });
  await User.findByIdAndUpdate(users[4]._id, {
    $push: { followers: { $each: [users[2]._id, users[3]._id] } }
  });
  
  console.log('✅ Follow relationships created');
};

// Seed posts
const seedPosts = async (users) => {
  console.log('📸 Seeding posts...');
  
  const posts = [
    {
      user: users[0]._id,
      caption: 'Beautiful sunset at the beach 🌅 #sunset #beach #photography',
      images: [
        { url: 'https://picsum.photos/600/600?random=1', publicId: 'post1_img1' }
      ],
      location: 'Malibu Beach, California',
      tags: ['sunset', 'beach', 'photography'],
      likes: [
        { user: users[1]._id },
        { user: users[2]._id },
        { user: users[3]._id }
      ],
      likesCount: 3
    },
    {
      user: users[0]._id,
      caption: 'Mountain hiking adventure! 🏔️ #hiking #nature #adventure',
      images: [
        { url: 'https://picsum.photos/600/600?random=2', publicId: 'post2_img1' },
        { url: 'https://picsum.photos/600/600?random=3', publicId: 'post2_img2' }
      ],
      location: 'Rocky Mountains',
      tags: ['hiking', 'nature', 'adventure'],
      likes: [
        { user: users[1]._id },
        { user: users[4]._id }
      ],
      likesCount: 2
    },
    {
      user: users[1]._id,
      caption: 'New digital art piece 🎨 What do you think? #digitalart #creative',
      images: [
        { url: 'https://picsum.photos/600/600?random=4', publicId: 'post3_img1' }
      ],
      tags: ['digitalart', 'creative', 'art'],
      likes: [
        { user: users[0]._id },
        { user: users[2]._id },
        { user: users[3]._id },
        { user: users[4]._id }
      ],
      likesCount: 4
    },
    {
      user: users[2]._id,
      caption: 'Leg day complete! 💪 #fitness #gym #workout',
      images: [
        { url: 'https://picsum.photos/600/600?random=5', publicId: 'post4_img1' }
      ],
      location: 'Gold\'s Gym',
      tags: ['fitness', 'gym', 'workout'],
      likes: [
        { user: users[0]._id },
        { user: users[1]._id }
      ],
      likesCount: 2
    },
    {
      user: users[3]._id,
      caption: 'Homemade pizza night! 🍕 Recipe coming soon #foodie #cooking #pizza',
      images: [
        { url: 'https://picsum.photos/600/600?random=6', publicId: 'post5_img1' },
        { url: 'https://picsum.photos/600/600?random=7', publicId: 'post5_img2' },
        { url: 'https://picsum.photos/600/600?random=8', publicId: 'post5_img3' }
      ],
      tags: ['foodie', 'cooking', 'pizza'],
      likes: [
        { user: users[0]._id },
        { user: users[1]._id },
        { user: users[2]._id }
      ],
      likesCount: 3
    },
    {
      user: users[4]._id,
      caption: 'New gaming setup! 🎮 #gaming #pc #setup',
      images: [
        { url: 'https://picsum.photos/600/600?random=9', publicId: 'post6_img1' }
      ],
      tags: ['gaming', 'pc', 'setup'],
      likes: [
        { user: users[2]._id }
      ],
      likesCount: 1
    }
  ];
  
  const createdPosts = await Post.insertMany(posts);
  
  // Update user post counts
  for (const post of createdPosts) {
    await User.findByIdAndUpdate(post.user, {
      $push: { posts: post._id }
    });
  }
  
  console.log(`✅ Created ${createdPosts.length} posts`);
  return createdPosts;
};

// Seed comments
const seedComments = async (users, posts) => {
  console.log('💬 Seeding comments...');
  
  const comments = [
    {
      post: posts[0]._id,
      user: users[1]._id,
      text: 'Stunning shot! 😍',
      likes: [
        { user: users[0]._id },
        { user: users[2]._id }
      ],
      likesCount: 2
    },
    {
      post: posts[0]._id,
      user: users[2]._id,
      text: 'I love sunsets! Where is this?',
      likes: [
        { user: users[0]._id }
      ],
      likesCount: 1
    },
    {
      post: posts[1]._id,
      user: users[1]._id,
      text: 'Wow! Looks like an amazing hike 🏔️',
      likes: [
        { user: users[0]._id }
      ],
      likesCount: 1
    },
    {
      post: posts[2]._id,
      user: users[0]._id,
      text: 'This is incredible! Love the colors 🎨',
      likes: [
        { user: users[1]._id },
        { user: users[3]._id }
      ],
      likesCount: 2
    },
    {
      post: posts[3]._id,
      user: users[0]._id,
      text: 'Keep pushing! 💪',
      likes: [
        { user: users[2]._id }
      ],
      likesCount: 1
    },
    {
      post: posts[4]._id,
      user: users[0]._id,
      text: 'That looks delicious! Can\'t wait for the recipe 😋',
      likes: [
        { user: users[3]._id }
      ],
      likesCount: 1
    },
    {
      post: posts[4]._id,
      user: users[1]._id,
      text: 'Making me hungry! 🍕',
      likes: [
        { user: users[3]._id }
      ],
      likesCount: 1
    }
  ];
  
  const createdComments = await Comment.insertMany(comments);
  
  // Update post comment counts
  for (const comment of createdComments) {
    await Post.findByIdAndUpdate(comment.post, {
      $push: { comments: comment._id }
    });
  }
  
  console.log(`✅ Created ${createdComments.length} comments`);
  return createdComments;
};

// Seed stories
const seedStories = async (users) => {
  console.log('📱 Seeding stories...');
  
  const stories = [
    {
      user: users[0]._id,
      mediaUrl: 'https://picsum.photos/400/700?random=10',
      publicId: 'story1',
      mediaType: 'image',
      viewers: [users[1]._id, users[2]._id],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
      user: users[1]._id,
      mediaUrl: 'https://picsum.photos/400/700?random=11',
      publicId: 'story2',
      mediaType: 'image',
      viewers: [users[0]._id],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
      user: users[2]._id,
      mediaUrl: 'https://picsum.photos/400/700?random=12',
      publicId: 'story3',
      mediaType: 'image',
      viewers: [users[0]._id, users[1]._id, users[3]._id],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
      user: users[3]._id,
      mediaUrl: 'https://picsum.photos/400/700?random=13',
      publicId: 'story4',
      mediaType: 'image',
      viewers: [users[0]._id, users[1]._id],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  ];
  
  const createdStories = await Story.insertMany(stories);
  console.log(`✅ Created ${createdStories.length} stories`);
  return createdStories;
};

// Seed chats
const seedChats = async (users) => {
  console.log('💬 Seeding chats...');
  
  const chats = [
    {
      participants: [users[0]._id, users[1]._id],
      isGroupChat: false,
      messages: [
        {
          sender: users[0]._id,
          text: 'Hey! Love your latest artwork!',
          messageType: 'text',
          readBy: [
            { user: users[0]._id, readAt: new Date() },
            { user: users[1]._id, readAt: new Date() }
          ]
        },
        {
          sender: users[1]._id,
          text: 'Thank you so much! That means a lot 🎨',
          messageType: 'text',
          readBy: [
            { user: users[0]._id, readAt: new Date() },
            { user: users[1]._id, readAt: new Date() }
          ]
        },
        {
          sender: users[0]._id,
          text: 'Are you working on any new projects?',
          messageType: 'text',
          readBy: [
            { user: users[0]._id, readAt: new Date() }
          ]
        }
      ]
    },
    {
      participants: [users[0]._id, users[2]._id],
      isGroupChat: false,
      messages: [
        {
          sender: users[2]._id,
          text: 'Great hiking photos!',
          messageType: 'text',
          readBy: [
            { user: users[0]._id, readAt: new Date() },
            { user: users[2]._id, readAt: new Date() }
          ]
        },
        {
          sender: users[0]._id,
          text: 'Thanks! We should go hiking together sometime',
          messageType: 'text',
          readBy: [
            { user: users[0]._id, readAt: new Date() },
            { user: users[2]._id, readAt: new Date() }
          ]
        }
      ]
    },
    {
      participants: [users[1]._id, users[2]._id, users[3]._id],
      isGroupChat: true,
      groupName: 'Creative Crew',
      groupAvatar: 'https://i.pravatar.cc/150?img=50',
      admins: [users[1]._id],
      messages: [
        {
          sender: users[1]._id,
          text: 'Welcome to our creative group! 🎨',
          messageType: 'text',
          readBy: [
            { user: users[1]._id, readAt: new Date() },
            { user: users[2]._id, readAt: new Date() },
            { user: users[3]._id, readAt: new Date() }
          ]
        },
        {
          sender: users[2]._id,
          text: 'Excited to be here!',
          messageType: 'text',
          readBy: [
            { user: users[1]._id, readAt: new Date() },
            { user: users[2]._id, readAt: new Date() }
          ]
        },
        {
          sender: users[3]._id,
          text: 'Can\'t wait to share ideas! 💡',
          messageType: 'text',
          readBy: [
            { user: users[3]._id, readAt: new Date() }
          ]
        }
      ]
    },
    {
      participants: [users[3]._id, users[4]._id],
      isGroupChat: false,
      messages: [
        {
          sender: users[3]._id,
          text: 'Hey Alex! Want to try my new pizza recipe?',
          messageType: 'text',
          readBy: [
            { user: users[3]._id, readAt: new Date() },
            { user: users[4]._id, readAt: new Date() }
          ]
        },
        {
          sender: users[4]._id,
          text: 'Absolutely! I love pizza 🍕',
          messageType: 'text',
          readBy: [
            { user: users[3]._id, readAt: new Date() },
            { user: users[4]._id, readAt: new Date() }
          ]
        }
      ]
    }
  ];
  
  const createdChats = await Chat.insertMany(chats);
  
  // Set lastMessage to the last message ID for each chat
  for (const chat of createdChats) {
    if (chat.messages && chat.messages.length > 0) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      chat.lastMessage = lastMsg._id;
      await chat.save();
    }
  }
  
  console.log(`✅ Created ${createdChats.length} chats`);
  return createdChats;
};

// Seed notifications
const seedNotifications = async (users, posts) => {
  console.log('🔔 Seeding notifications...');
  
  const notifications = [
    {
      recipient: users[0]._id,
      sender: users[1]._id,
      type: 'like',
      post: posts[0]._id,
      message: 'liked your post'
    },
    {
      recipient: users[0]._id,
      sender: users[2]._id,
      type: 'comment',
      post: posts[0]._id,
      message: 'commented on your post'
    },
    {
      recipient: users[0]._id,
      sender: users[1]._id,
      type: 'follow',
      message: 'started following you'
    },
    {
      recipient: users[1]._id,
      sender: users[0]._id,
      type: 'like',
      post: posts[2]._id,
      message: 'liked your post'
    },
    {
      recipient: users[3]._id,
      sender: users[0]._id,
      type: 'follow',
      message: 'started following you'
    }
  ];
  
  const createdNotifications = await Notification.insertMany(notifications);
  console.log(`✅ Created ${createdNotifications.length} notifications`);
  return createdNotifications;
};

// Seed reels
const seedReels = async (users) => {
  console.log('🎬 Seeding reels...');
  
  const reels = [
    {
      user: users[0]._id,
      video: {
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        publicId: 'reel1',
        thumbnail: 'https://picsum.photos/300/400?random=20'
      },
      caption: 'Quick travel vlog! ✈️ #travel #vlog',
      audio: { name: 'Original Audio', artist: 'john_doe' },
      hashtags: ['travel', 'vlog', 'adventure'],
      likes: [
        { user: users[1]._id },
        { user: users[2]._id }
      ],
      likesCount: 2,
      views: [
        { user: users[1]._id },
        { user: users[2]._id },
        { user: users[3]._id }
      ],
      viewsCount: 3
    },
    {
      user: users[2]._id,
      video: {
        url: 'https://www.w3schools.com/html/movie.mp4',
        publicId: 'reel2',
        thumbnail: 'https://picsum.photos/300/400?random=21'
      },
      caption: '30-second workout routine 💪 #fitness #workout',
      audio: { name: 'Workout Mix', artist: 'FitBeats' },
      hashtags: ['fitness', 'workout', 'health'],
      likes: [
        { user: users[0]._id },
        { user: users[1]._id }
      ],
      likesCount: 2,
      views: [
        { user: users[0]._id },
        { user: users[1]._id },
        { user: users[3]._id },
        { user: users[4]._id }
      ],
      viewsCount: 4
    }
  ];
  
  const createdReels = await Reel.insertMany(reels);
  console.log(`✅ Created ${createdReels.length} reels`);
  return createdReels;
};

// Seed collections
const seedCollections = async (users, posts) => {
  console.log('📁 Seeding collections...');
  
  const collections = [
    {
      user: users[0]._id,
      name: 'Travel Inspiration',
      description: 'Beautiful places I want to visit',
      posts: [posts[0]._id, posts[1]._id],
      coverImage: { url: 'https://picsum.photos/400/400?random=30', publicId: 'collection1' }
    },
    {
      user: users[0]._id,
      name: 'Food Ideas',
      description: 'Recipes to try',
      posts: [posts[4]._id],
      coverImage: { url: 'https://picsum.photos/400/400?random=31', publicId: 'collection2' }
    },
    {
      user: users[1]._id,
      name: 'Art Reference',
      description: 'Inspiration for my artwork',
      posts: [posts[2]._id],
      coverImage: { url: 'https://picsum.photos/400/400?random=32', publicId: 'collection3' }
    }
  ];
  
  const createdCollections = await Collection.insertMany(collections);
  console.log(`✅ Created ${createdCollections.length} collections`);
  return createdCollections;
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    await connectDB();
    await clearDatabase();
    
    const users = await seedUsers();
    await seedFollows(users);
    const posts = await seedPosts(users);
    await seedComments(users, posts);
    await seedStories(users);
    await seedChats(users);
    await seedNotifications(users, posts);
    await seedReels(users);
    await seedCollections(users, posts);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Sample login credentials:');
    console.log('Admin: admin@instagram.com / admin123');
    console.log('User 1: john@example.com / password123');
    console.log('User 2: jane@example.com / password123');
    console.log('User 3: mike@example.com / password123');
    console.log('User 4: sarah@example.com / password123');
    console.log('User 5: alex@example.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();