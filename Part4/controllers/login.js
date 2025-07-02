const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('./users');

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body;

  // Find user by username
  const user = await User.findOne({ username });

  // Compare provided password with hashed password in DB
  const passwordCorrect = user === null
    ? false // If user not found, password is automatically incorrect
    : await bcrypt.compare(password, user.passwordHash);

  // If username or password is incorrect, return 401 Unauthorized
  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    });
  }

  // Create token payload
  const userForToken = {
    username: user.username,
    id: user._id,
  };

  // Generate token using the secret from environment variables
  // Token expires in 1 hour (60*60 seconds)
  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60*60 } // Token expires in 1 hour
  );

  // Send successful response with token, username, and name
  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;