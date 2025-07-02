const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // Import the plugin

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures username is unique at the database level
    minlength: 3  // Mongoose validation: minimum length for username
  },
  name: String,
  passwordHash: { // Stores the hashed password
    type: String,
    required: true
  },
  // Reference to blogs created by this user
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
});

// Apply the uniqueValidator plugin to the userSchema.
// This will make Mongoose's unique validation more user-friendly,
// turning duplicate key errors into standard Mongoose ValidationErrors.
userSchema.plugin(uniqueValidator);

// Transform the user object when converted to JSON
// This hides sensitive information like passwordHash and transforms _id to id
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // Convert MongoDB's _id to a string 'id'
    delete returnedObject._id; // Remove the original _id field
    delete returnedObject.__v; // Remove the Mongoose version key
    // The passwordHash should not be revealed to the client
    delete returnedObject.passwordHash;
  }
});

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
