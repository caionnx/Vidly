const express = require('express');
const morgan = require('morgan');
const genresRouter = require('./routes/genres');

const app = express();
const PORT = process.env.port || 3000;
const isDevEnv = app.get('env') === 'development';

app.listen(PORT, () => `Vidly running on ${PORT}`);

// Middleware
if(isDevEnv) app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/genres', genresRouter);