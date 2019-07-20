const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('config');
const genresRouter = require('./routes/genres');
const custormersRouter = require('./routes/customers');
const moviesRouter = require('./routes/movies');
const rentalsRouter = require('./routes/rentals');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.port || 3000;
const isDevEnv = app.get('env') === 'development';

async function startApplication() {
  try {
    if (!config.get('jwtPrivateKey')) throw new Error('ERROR: jwtPrivateKey not found.');
    await mongoose.connect('mongodb://localhost/vidly', { useNewUrlParser: true }) 
    console.log('Successfully connect to database.');
    app.listen(PORT, () => console.log(`Vidly running on ${PORT}`));
  } catch (error) {
    const errorMessage = error.message || 'Error while connecting to database.';
    console.log(errorMessage);
    process.exit(1);
  }

  // Middleware
  if(isDevEnv) app.use(morgan('dev'));
  app.use(express.json());

  // Routes
  app.use('/api/genres', genresRouter);
  app.use('/api/customers', custormersRouter);
  app.use('/api/movies', moviesRouter);
  app.use('/api/rentals', rentalsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/auth', authRouter);
}

startApplication();