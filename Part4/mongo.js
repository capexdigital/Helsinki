const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const config = require('./utils/config');
const logger = require('./utils/logger');
const User = require('./models/user'); // Import the User model
const Blog = require('./models/blog'); // Assuming you have a Blog model in models/blog.js

// Command-line argument handling
// Usage:
//   node mongo.js <password> list-blogs
//   node mongo.js <password> add-blog "Title" "Author" "URL" <likes>
//   node mongo.js <password> add-user "username" "name" "password"

const args = process.argv.slice(2);

const password = args[0];
const command = args[1]; // e.g., 'list-blogs', 'add-blog', 'add-user'

if (!password) {
  logger.error('Usage:');
  logger.error('  To list all blogs: node mongo.js <password> list-blogs');
  logger.error('  To add a blog: node mongo.js <password> add-blog "Title" "Author" "URL" <likes>');
  logger.error('  To add a user: node mongo.js <password> add-user "username" "name" "plaintext_password"');
  process.exit(1);
}

let mongoUrl;
// Construct the MongoDB URI using the password from CLI and the base URI from config
if (config.MONGODB_URI && config.MONGODB_URI.includes('@')) {
    const parts = config.MONGODB_URI.split('@');
    const userAndCluster = parts[0].replace('mongodb+srv://', '');
    const user = userAndCluster.split(':')[0];
    const cluster = parts[1].split('/')[0];
    // Ensure the correct database name is used, e.g., 'blog' or 'bloglist'
    const dbName = parts[1].split('/')[1] ? parts[1].split('/')[1].split('?')[0] : 'blog';

    mongoUrl = `mongodb+srv://${user}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
} else {
    logger.info('Using a simplified MongoDB URI format (likely local). Password argument might not be directly applied to the URL.');
    mongoUrl = config.MONGODB_URI; // Use the URI directly from config
}

mongoose.set('strictQuery', false);

logger.info('Attempting to connect to MongoDB...');

mongoose.connect(mongoUrl)
  .then(async () => { // Use async here to await operations
    logger.info('Connected to MongoDB successfully!');

    switch (command) {
      case 'list-blogs':
        const blogs = await Blog.find({});
        logger.info('Bloglist:');
        if (blogs.length === 0) {
          logger.info('  No blogs found.');
        } else {
          blogs.forEach(blog => {
            logger.info(`  "${blog.title}" by ${blog.author} (${blog.likes} likes) - ${blog.url}`);
          });
        }
        break;

      case 'add-blog':
        const title = args[2];
        const author = args[3];
        const url = args[4];
        const likes = args[5] !== undefined ? parseInt(args[5], 10) : 0;

        if (!title || !author || !url) {
          logger.error('Error: Missing arguments for add-blog. Usage: node mongo.js <password> add-blog "Title" "Author" "URL" <likes>');
          process.exit(1);
        }

        const newBlog = new Blog({
          title: title,
          author: author,
          url: url,
          likes: likes,
        });
        const savedBlog = await newBlog.save();
        logger.info(`Added new blog: "${savedBlog.title}" by ${savedBlog.author} with ${savedBlog.likes} likes.`);
        break;

      case 'add-user':
        const username = args[2];
        const name = args[3];
        const plaintextPassword = args[4];

        if (!username || !name || !plaintextPassword) {
          logger.error('Error: Missing arguments for add-user. Usage: node mongo.js <password> add-user "username" "name" "plaintext_password"');
          process.exit(1);
        }

        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(plaintextPassword, saltRounds);

        const newUser = new User({
          username: username,
          name: name,
          passwordHash: passwordHash,
        });

        try {
          const savedUser = await newUser.save();
          logger.info(`Added new user: ${savedUser.username} (${savedUser.name})`);
        } catch (error) {
          if (error.code === 11000) { // Duplicate key error (e.g., username already exists)
            logger.error(`Error: Username '${username}' already exists.`);
          } else {
            logger.error('Error saving user:', error.message);
          }
          process.exit(1);
        }
        break;

      default:
        logger.error(`Unknown command: ${command}`);
        logger.error('Valid commands are: list-blogs, add-blog, add-user');
        process.exit(1);
    }
  })
  .then(() => { // This .then will run after the switch case completes
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
