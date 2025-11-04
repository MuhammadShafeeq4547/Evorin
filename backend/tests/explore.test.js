const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Post = require('../models/Post');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
});

const createUserAndToken = async (overrides = {}) => {
  const user = new User({
    username: overrides.username || 'alice',
    email: overrides.email || 'alice@example.com',
    password: overrides.password || 'password123',
    fullName: overrides.fullName || 'Alice'
  });
  await user.save();
  // For simplicity, we won't test auth middleware here; instead attach user id to req via a test-only header in routes
  return user;
};

// Tests rely on app.js test helper which sets req.user when x-test-user header is present

describe('Explore endpoint and like count behavior', () => {
  test('explore sorts by likesCount desc and pagination hasMore works', async () => {
    // Create two users
    const alice = await createUserAndToken({ username: 'alice', email: 'alice@test.com' });
    const bob = await createUserAndToken({ username: 'bob', email: 'bob@test.com' });

    // Create posts with different likesCount
    const postA = new Post({ user: alice._id, caption: 'A', likes: [], likesCount: 5 });
    const postB = new Post({ user: bob._id, caption: 'B', likes: [], likesCount: 10 });
    await postA.save();
    await postB.save();

    // Request explore as another user (charlie)
    const charlie = await createUserAndToken({ username: 'charlie', email: 'charlie@test.com' });

    const res = await request(app)
      .get('/api/posts/explore?limit=1&page=1')
      .set('x-test-user', charlie._id.toString())
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.posts).toBeDefined();
    expect(res.body.posts.length).toBe(1);
    // First post should be postB (likesCount 10)
    expect(res.body.posts[0].caption).toBe('B');
    expect(res.body.pagination.hasMore).toBe(true); // because limit=1 and we have 2 posts
  });

  test('liking a post increments likesCount and unlike decrements', async () => {
    const alice = await createUserAndToken({ username: 'alice2', email: 'alice2@test.com' });
    const bob = await createUserAndToken({ username: 'bob2', email: 'bob2@test.com' });

    const post = new Post({ user: alice._id, caption: 'LikeTest', likes: [], likesCount: 0 });
    await post.save();

    // Bob likes the post
    const likeRes = await request(app)
      .post(`/api/posts/${post._id}/like`)
      .set('x-test-user', bob._id.toString())
      .expect(200);

    expect(likeRes.body.success).toBe(true);
    expect(likeRes.body.isLiked).toBe(true);
    expect(likeRes.body.likesCount).toBe(1);

    // Bob unlikes
    const unlikeRes = await request(app)
      .post(`/api/posts/${post._id}/like`)
      .set('x-test-user', bob._id.toString())
      .expect(200);

    expect(unlikeRes.body.success).toBe(true);
    expect(unlikeRes.body.isLiked).toBe(false);
    expect(unlikeRes.body.likesCount).toBe(0);
  });
});
