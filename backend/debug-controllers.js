console.log('Testing controllers...\n');

try {
  console.log('Loading postController...');
  const postController = require('./controllers/postController');
  console.log('✅ postController loaded\n');

  console.log('Loading commentController...');
  const commentController = require('./controllers/commentController');
  console.log('✅ commentController loaded\n');

  console.log('Loading storyController...');
  const storyController = require('./controllers/storyController');
  console.log('✅ storyController loaded\n');

  console.log('Loading reelController...');
  const reelController = require('./controllers/reelController');
  console.log('✅ reelController loaded\n');

  console.log('🎉 All controllers are valid!');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
}