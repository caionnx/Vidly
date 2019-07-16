const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const genresRouter = require('./routes/genres');

const app = express();
const PORT = process.env.port || 3000;
const isDevEnv = app.get('env') === 'development';

async function startApplication() {
  try {
    await mongoose.connect('mongodb://localhost/vidly', { useNewUrlParser: true }) 
    app.listen(PORT, () => `Vidly running on ${PORT}`);
  } catch (error) {
    const errorMessage = error.message || 'Error while connecting to database.';
    return console.log(errorMessage);
  }

  // Middleware
  if(isDevEnv) app.use(morgan('dev'));
  app.use(express.json());

  // Routes
  app.use('/api/genres', genresRouter);
}

startApplication();