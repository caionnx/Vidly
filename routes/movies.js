const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminAuth');
const { concatErrorMessages } = require('../helpers');
// Functions that will operate directly in the database
const {
  addNewMovie,
  getAllMovies,
  getMovieById,
  updateMovieById,
  deleteMovieById,
  JoiValidateMovie
} = require('../models/movies');

// Router manipulation
router.get('/', async (req, res) => {
  const movies = await getAllMovies();

  return res.send(movies);
});

router.post('/', authMiddleware, async (req, res) => {
  let data = { ...req.body };
  let errorMessage;
  const { error } = JoiValidateMovie(data);
  
  if (error) {
    errorMessage = concatErrorMessages({ arrayOfErrors: error.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  try {
    const newMovie = await addNewMovie(data);
    return res.send(newMovie);
  } catch (error) {
    errorMessage = `Failed at mongo validation:\n${error.message}`
    return res.status(400).send(errorMessage);
  }
});

router.get('/:id', async(req, res) => {
  try {
    const movie = await getMovieById(req.params.id);

    if(!movie) return res.status(404).send('404 Not found.');

    return res.send(movie);
  } catch (error) {
    return res.status(400).send('Failed in handling Mongo operation.');
  }
});

router.put('/:id', authMiddleware, async(req, res) => {
  let errorMessage;
  let data = { ...req.body }
  const { error: errorFromJoiValidation } = JoiValidateMovie(data);

  if(errorFromJoiValidation) {
    errorMessage = concatErrorMessages({ arrayOfErrors: errorFromJoiValidation.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  try {
    const movie = await updateMovieById(req.params.id, data);

    if(!movie) return res.status(400).send('Invalid ID. Movie not found in database.');

    return res.send(movie);
  } catch (error) {
    return res.status(400).send('Failed in handling Mongo operation.');
  }
});

router.delete('/:id', adminMiddleware, async(req, res) => {
  try {
    const movie = await deleteMovieById(req.params.id);

    if(!movie) return res.status(400).send('Invalid ID. Movie not found in database.');

    return res.send(movie);
  } catch (error) {
    return res.status(400).send('Failed in handling Mongo operation.' + error);
  }
});

module.exports = router;