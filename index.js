const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const genresRouter = require('./routes/genres');
const custormersRouter = require('./routes/customers');
const moviesRouter = require('./routes/movies');

const app = express();
const PORT = process.env.port || 3000;
const isDevEnv = app.get('env') === 'development';

async function startApplication() {
  try {
    await mongoose.connect('mongodb://localhost/vidly', { useNewUrlParser: true }) 
    console.log('Successfully connect to database.');
    app.listen(PORT, () => console.log(`Vidly running on ${PORT}`));
  } catch (error) {
    const errorMessage = error.message || 'Error while connecting to database.';
    return console.log(errorMessage);
  }

  // Middleware
  if(isDevEnv) app.use(morgan('dev'));
  app.use(express.json());

  // Routes
  app.use('/api/genres', genresRouter);
  app.use('/api/customers', custormersRouter);
  app.use('/api/movies', moviesRouter);
}

startApplication();