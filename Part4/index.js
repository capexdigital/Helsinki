// index.js (Node.js Backend Server)

// Load environment variables and configuration
const config = require('./utils/config');
const logger = require('./utils/logger');

// Import Express and Mongoose
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors'); // Ensure 'cors' is installed: npm install cors

// Connect to MongoDB using the URI from the config module
logger.info('connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

// Define the Mongoose schema for a blog entry (ensure this matches your database schema)
const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

// Create the Mongoose model from the schema
const Blog = mongoose.model('Blog', blogSchema);

// Middleware
app.use(cors()); // Enable CORS for all routes (important for front-end dev)
app.use(express.json()); // Parse JSON request bodies
app.use(express.static('public')); // Serve static files from the 'public' directory

// API Routes
// Route to get all blogs
app.get('/api/blogs', (request, response) => {
  Blog.find({})
    .then((blogs) => {
      response.json(blogs);
    })
    .catch((error) => {
      logger.error('Error fetching blogs:', error.message);
      response.status(500).json({ error: 'Failed to retrieve blogs' });
    });
});

// Route to add a new blog
app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body);

  blog.save()
    .then((result) => {
      response.status(201).json(result);
    })
    .catch((error) => {
      logger.error('Error saving blog:', error.message);
      response.status(400).json({ error: 'Failed to save blog' });
    });
});

// Route to delete a single blog post by ID
app.delete('/api/blogs/:id', async (request, response) => {
  try {
    const idToDelete = request.params.id;
    // Use findByIdAndDelete to remove the document from the database
    const result = await Blog.findByIdAndDelete(idToDelete);

    if (result) {
      // If a document was found and deleted, send 204 No Content
      logger.info(`Blog with ID ${idToDelete} successfully deleted.`);
      response.status(204).end();
    } else {
      // If no document was found with the given ID, send 404 Not Found
      logger.info(`No blog found with ID ${idToDelete} for deletion.`);
      response.status(404).json({ error: 'Blog not found' });
    }
  } catch (error) {
    // Handle potential errors (e.g., invalid ID format)
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
