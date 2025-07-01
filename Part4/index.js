// index.js (Node.js Backend Server)

// Load environment variables and configuration.
const config = require('./utils/config');
const logger = require('./utils/logger');

// Import Express and Mongoose
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

// Connect to MongoDB using the URI from the config module
logger.info('Connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message);
  });

// Define the Mongoose schema for a blog entry
const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

// This ensures that when Mongoose documents are converted to JSON,
// the '_id' field is converted to a string 'id' field, and '__v' is removed.
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

// Create the Mongoose model from the schema
const Blog = mongoose.model('Blog', blogSchema);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.static('public')); // Serve static files from the 'public' directory

// API Routes

// Route to get all blogs
app.get('/api/blogs', async (request, response) => {
  try {
    const blogs = await Blog.find({});
    logger.info(`Backend found ${blogs.length} blogs from DB.`);
    response.json(blogs);
  } catch (error) {
    logger.error('Error fetching blogs:', error.message);
    response.status(500).json({ error: 'Failed to retrieve blogs' });
  }
});

// Route to add a new blog
app.post('/api/blogs', async (request, response) => {
  logger.info('Received POST request to /api/blogs with body:', request.body);

  const blog = new Blog(request.body);

  try {
    const savedBlog = await blog.save();
    logger.info('Blog saved successfully:', savedBlog);
    response.status(201).json(savedBlog);
  } catch (error) {
    logger.error('Error saving blog to DB:', error.message);
    logger.error('Full error object:', error);
    response.status(400).json({ error: 'Failed to save blog', details: error.message });
  }
});

// Route to delete a single blog post by ID
app.delete('/api/blogs/:id', async (request, response) => {
  try {
    const idToDelete = request.params.id;
    logger.info(`Attempting to delete blog with ID: ${idToDelete}`);
    const result = await Blog.findByIdAndDelete(idToDelete);

    if (result) {
      logger.info(`Blog with ID ${idToDelete} successfully deleted.`);
      response.status(204).end();
    } else {
      logger.info(`No blog found with ID ${idToDelete} for deletion.`);
      response.status(404).json({ error: 'Blog not found' });
    }
  } catch (error) {
    logger.error(`Error deleting blog with ID ${request.params.id}:`, error.message);
    if (error.name === 'CastError') {
      return response.status(400).json({ error: 'Invalid blog ID format' });
    }
    response.status(500).json({ error: 'Failed to delete blog' });
  }
});

// Start the Express server, listening on the port from the config module
app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
