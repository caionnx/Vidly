const express = require('express');
const genresRouter = require('./routes/genres');

const app = express();
const PORT = process.env.port || 3000;

app.listen(PORT, () => `Vidly running on ${PORT}`);

// Middleware
app.use(express.json());

// Routes
app.use('/api/genres', genresRouter);