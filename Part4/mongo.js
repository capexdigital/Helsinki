
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const args = process.argv.slice(2);

const password = args[0];
const title = args[1];
const author = args[2];
const url = args[3];
const likes = args[4] !== undefined ? parseInt(args[4], 10) : undefined;

if (!password) {
  logger.error('Usage:');
  logger.error('  To list all blogs: node mongo.js <password>');
  logger.error('  To add a blog: node mongo.js <password> "Title" "Author" "URL" <likes>');
  process.exit(1);
}

let mongoUrl;
// Check if the MONGODB_URI from config is an Atlas-like connection string
if (config.MONGODB_URI && config.MONGODB_URI.includes('@')) {
    const parts = config.MONGODB_URI.split('@');
    const userAndCluster = parts[0].replace('mongodb+srv://', '');
    const user = userAndCluster.split(':')[0];
    const cluster = parts[1].split('/')[0];
    const dbName = parts[1].split('/')[1] ? parts[1].split('/')[1].split('?')[0] : 'bloglist';

    mongoUrl = `mongodb+srv://${user}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
} else {
    logger.info('Using a simplified MongoDB URI format (likely local). Password argument might not be directly applied to the URL.');
    mongoUrl = config.MONGODB_URI; // Use the URI directly from config
}

mongoose.set('strictQuery', false);

logger.info('Attempting to connect to MongoDB for bloglist...');

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

const Blog = mongoose.model('Blog', blogSchema);

mongoose.connect(mongoUrl)
  .then(() => {
    logger.info('Connected to MongoDB successfully!');

    if (title && author && url && likes !== undefined) {
      const blog = new Blog({
        title: title,
        author: author,
        url: url,
        likes: likes,
      });
      return blog.save();
    } else if (args.length === 1) { // Only password provided, list all blogs
      return Blog.find({});
    } else {
      logger.error('Invalid arguments for adding a blog. Please provide title, author, URL, and likes.');
      logger.error('Usage for adding: node mongo.js <password> "Title" "Author" "URL" <likes>');
      process.exit(1);
    }
  })
  .then((result) => {
    if (title && author && url && likes !== undefined) {
      logger.info(`Added new blog: "${title}" by ${author} with ${likes} likes.`);
    } else {
      logger.info('Bloglist:');
      if (result.length === 0) {
        logger.info('  No blogs found.');
      } else {
        result.forEach(blog => {
          logger.info(`  "${blog.title}" by ${blog.author} (${blog.likes} likes) - ${blog.url}`);
        });
      }
    }
    return mongoose.connection.close();
  })
  .then(() => {
    logger.info('Connection closed.');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Error connecting to or interacting with MongoDB:', error.message);
    process.exit(1);
  });
