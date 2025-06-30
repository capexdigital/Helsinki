// index.js – Node.js + Express Backend

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./utils/config');
const logger = require('./utils/logger');

// Connect to MongoDB
logger.info('Connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message);
  });

// Define Blog schema and model
const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

const Blog = mongoose.model('Blog', blogSchema);

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static frontend files

// Routes

// GET all blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find({});
    logger.info(`Returned ${blogs.length} blogs`);
    res.json(blogs);
  } catch (error) {
    logger.error('Error fetching blogs:', error.message);
    res.status(500).json({ error: 'Failed to retrieve blogs' });
  }
});

// POST new blog
app.post('/api/blogs', async (req, res) => {
  logger.info('Received POST /api/blogs:', req.body);

  const blog = new Blog(req.body);

  try {
    const savedBlog = await blog.save();
    logger.info('Blog saved:', savedBlog);
    res.status(201).json(savedBlog);
  } catch (error) {
    logger.error('Error saving blog:', error.message);
    res.status(400).json({ error: 'Failed to save blog', details: error.message });
  }
});

// DELETE blog by ID
app.delete('/api/blogs/:id', async (req, res) => {
  const idToDelete = req.params.id;

  try {
    const deleted = await Blog.findByIdAndDelete(idToDelete);
    if (deleted) {
      logger.info(`Deleted blog with ID ${idToDelete}`);
      res.status(204).end();
    } else {
      logger.warn(`No blog found with ID ${idToDelete}`);
      res.status(404).json({ error: 'Blog not found' });
    }
  } catch (error) {
    logger.error(`Error deleting blog with ID ${idToDelete}:`, error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid blog ID format' });
    }
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// Start server
const PORT = config.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
