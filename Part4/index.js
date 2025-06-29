// index.js
require('dotenv').config();
const logger = require('./utils/logger');
const config = require('./utils/config');
const express = require('express');
const app = express();
const port = 3001;

logger.info(`Server running on port ${config.PORT}`)

app.get('/', (req, res) => {
  res.send('Hello from your Node.js app!');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});


