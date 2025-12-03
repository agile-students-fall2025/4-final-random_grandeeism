/**
 * Migration script to add mediaType and videoId fields to existing articles
 * 
 * Run with: node scripts/migrateMediaTypes.js
 */

const mongoose = require('mongoose');
const { Article } = require('../lib/models');
const { detectMediaType, extractYouTubeVideoId } = require('../utils/youtubeUtils');
require('dotenv').config();

async function migrateArticles() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/readitlater';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all articles that don't have mediaType set
    const articlesToUpdate = await Article.find({
      $or: [
        { mediaType: { $exists: false } },
        { mediaType: null }
      ]
    });

    console.log(`Found ${articlesToUpdate.length} articles to update`);

    let updatedCount = 0;
    let videoCount = 0;
    let audioCount = 0;
    let textCount = 0;

    for (const article of articlesToUpdate) {
      const mediaType = detectMediaType(article.url);
      article.mediaType = mediaType;

      if (mediaType === 'video') {
        article.videoId = extractYouTubeVideoId(article.url);
        videoCount++;
      } else if (mediaType === 'audio') {
        audioCount++;
      } else {
        textCount++;
      }

      await article.save();
      updatedCount++;

      if (updatedCount % 10 === 0) {
        console.log(`Updated ${updatedCount}/${articlesToUpdate.length} articles...`);
      }
    }

    console.log('\nMigration completed successfully!');
    console.log(`Total articles updated: ${updatedCount}`);
    console.log(`  - Video articles: ${videoCount}`);
    console.log(`  - Audio articles: ${audioCount}`);
    console.log(`  - Text articles: ${textCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateArticles().then(() => {
  process.exit(0);
});
