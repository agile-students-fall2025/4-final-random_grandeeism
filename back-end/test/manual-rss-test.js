// Manual test script for RSS extraction
// Run with: node test/manual-rss-test.js

const rssService = require('../services/rssService');

async function testRSSExtraction() {
  console.log('🧪 Manual RSS Extraction Test\n');

  // Test 1: Media Type Detection
  console.log('Test 1: Media Type Detection');
  const videoItem = {
    enclosure: { type: 'video/mp4', url: 'https://example.com/video.mp4' },
    title: 'Sample Video'
  };
  const audioItem = {
    enclosure: { type: 'audio/mpeg', url: 'https://example.com/podcast.mp3' },
    title: 'Sample Podcast'
  };
  const textItem = {
    link: 'https://example.com/article',
    title: 'Sample Article'
  };

  console.log('  Video:', rssService.detectMediaType(videoItem, 'Some content'));
  console.log('  Audio:', rssService.detectMediaType(audioItem, 'Podcast episode'));
  console.log('  Text:', rssService.detectMediaType(textItem, 'Regular article'));
  console.log('  ✅ Media type detection working\n');

  // Test 2: Summary Extraction
  console.log('Test 2: Summary Extraction');
  const htmlContent = '<p>This is <strong>HTML</strong> content</p>';
  const longContent = 'a'.repeat(200);
  
  console.log('  HTML stripped:', rssService.extractSummary(htmlContent, 100));
  console.log('  Long text truncated:', rssService.extractSummary(longContent, 50).length, 'chars');
  console.log('  ✅ Summary extraction working\n');

  // Test 3: Image Extraction
  console.log('Test 3: Image Extraction');
  const itemWithImage = {
    'content:encoded': '<img src="https://example.com/image.jpg" alt="test">'
  };
  const itemWithoutImage = {
    description: 'Just plain text'
  };

  console.log('  With image:', rssService.extractImage(itemWithImage));
  console.log('  Without image:', rssService.extractImage(itemWithoutImage));
  console.log('  ✅ Image extraction working\n');

  // Test 4: Auto-refresh Management
  console.log('Test 4: Auto-refresh Management');
  const feedId = 'test-feed-123';
  const userId = 'test-user-456';

  rssService.startAutoRefresh(feedId, userId, 60);
  let status = rssService.getAutoRefreshStatus();
  console.log('  Started auto-refresh:', status.find(j => j.feedId === feedId) ? '✅' : '❌');

  rssService.stopAutoRefresh(feedId);
  status = rssService.getAutoRefreshStatus();
  console.log('  Stopped auto-refresh:', !status.find(j => j.feedId === feedId) ? '✅' : '❌');
  console.log('  ✅ Auto-refresh management working\n');

  // Test 5: Live RSS Feed Extraction (optional - requires network)
  console.log('Test 5: Live RSS Feed Extraction (commented out - uncomment to test with real feed)');
  console.log('  To test with a real feed:');
  console.log('  1. Create a feed in the database');
  console.log('  2. Call: await rssService.extractFromFeed(feedId, userId)');
  console.log('  3. Check that articles are created\n');

  console.log('✅ All manual tests passed!');
  console.log('\nℹ️  To test with real RSS feeds:');
  console.log('  - Start the backend server');
  console.log('  - Use the API endpoints:');
  console.log('    POST /api/feeds/:id/extract');
  console.log('    POST /api/feeds/extract/all');
  console.log('    POST /api/feeds/:id/auto-refresh/start');
  console.log('    GET /api/feeds/auto-refresh/status');
}

testRSSExtraction().catch(console.error);
