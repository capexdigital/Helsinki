    // index.js (Node.js Backend Server)

    const config = require('./utils/config');
    const logger = require('./utils/logger');

    const express = require('express');
    const app = express();
    const mongoose = require('mongoose');
    const cors = require('cors');

    // Import routers
    const loginRouter = require('/home/joao/Code/Helsinki/Part4/controllers/login');
    const usersRouter = require('/home/joao/Code/Helsinki/Part4/controllers/login');

    logger.info('Connecting to', config.MONGODB_URI);

    mongoose.connect(config.MONGODB_URI)
      .then(() => {
        logger.info('Connected to MongoDB');
      })
      .catch((error) => {
        logger.error('Error connecting to MongoDB:', error.message);
      });

    const Blog = require('./models/blog'); // Import the Blog model

    app.use(cors());

    // --- DEEPER DEBUGGING STEP: Log raw request body stream ---
    // This middleware runs BEFORE express.json() to see the raw incoming data
    app.use((req, res, next) => {
      if (req.method === 'POST' && req.url === '/api/login') {
        let rawBody = '';
        req.on('data', chunk => {
          rawBody += chunk.toString();
        });
        req.on('end', () => {
          logger.info('Raw Incoming Request Body (before express.json):', rawBody);
          req.rawBody = rawBody; // Attach raw body for potential later use if needed
          next();
        });
      } else {
        next();
      }
    });
    // --- END DEEPER DEBUGGING STEP ---


    app.use(express.json()); // Crucial for parsing JSON request bodies
    app.use(express.static('public')); // Serve static files from the 'public' directory

    // API Routes
    // Debugging log for /api/login requests (after express.json)
    app.use('/api/login', (req, res, next) => {
      logger.info('Incoming request to /api/login.');
      logger.info('Request Headers:', req.headers); // Debug log for headers
      logger.info('Request Body (after express.json):', req.body); // Debug log for body
      next(); // Pass control to the next middleware/router
    }, loginRouter); // Ensure loginRouter is correctly imported and is a function

    app.use('/api/users', usersRouter); // Use the users registration router. Ensure usersRouter is a function.

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

    app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`);
    });
    