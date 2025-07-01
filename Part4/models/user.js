// models/user.js

const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures username is unique
    minlength: 3  // Example: minimum length for username
  },
  name: String,
  passwordHash: { // Stores the hashed password
    type: String,
    required: true
  },
  // If users can have blogs, you might add a reference here:
  // blogs: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Blog'
  //   }
  // ]
});

// Transform the user object when converted to JSON
// This hides the passwordHash and transforms _id to id
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // The passwordHash should not be revealed
    delete returnedObject.passwordHash;
  }
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
