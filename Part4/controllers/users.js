const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('/home/joao/Code/Helsinki/Part4/models/user');

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1 });
  response.json(users);
});

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body;

  // Validate password presence and length
  if (!password || password.length < 3) {
    return response.status(400).json({ error: 'password must be at least 3 characters long' });
  }

  // Validate username presence (minlength is handled by Mongoose schema)
  if (!username) {
    return response.status(400).json({ error: 'username must be given' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    // Handle Mongoose validation errors (e.g., unique username, username minlength)
    if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = usersRouter;