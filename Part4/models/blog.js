// models/blog.js

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

// This ensures that when Mongoose documents are converted to JSON (e.g., when sent via API),
// the '_id' field is converted to a string 'id' field, and '__v' (version key) is removed.
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
