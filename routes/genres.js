const Joi = require('joi');
const express = require('express');
// Functions that will operate directly in the database
const {
  addNewGenre,
  getAllGenres,
  getGenreById,
  updateGenreById,
  deleteGenreById
} = require('../database/genres');

// Helpers functions for Joi validation
const { concatErrorMessages } = require('../helpers');
const genreSchema = Joi.object({
  name: Joi.string().min(3).required(),
});
const validateGenreSchema = (genre) => genreSchema.validate(genre, { abortEarly: false });

// Router manipulation
const router = express.Router();
router.get('/', async (req, res) => {
  const genres = await getAllGenres();

  return res.send(genres);
});

router.post('/', async (req, res) => {
  let data = { ...req.body };
  let errorMessage;
  const { error } = validateGenreSchema(data);
  
  if (error) {
    errorMessage = concatErrorMessages({ arrayOfErrors: error.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  try {
    const newGenre = await addNewGenre(data);
    return res.send(newGenre);
  } catch (error) {
    errorMessage = `Failed at mongo validation:\n${error.message}`
    return res.status(400).send(errorMessage);
  }
});

router.get('/:id', async(req, res) => {
  try {
    const genre = await getGenreById(req.params.id);

    if(!genre) return res.status(404).send('404 Not found.');

    return res.send(genre);
  } catch (error) {
    return res.status(400).send('Failed in handling Mongo operation.');
  }
});

router.put('/:id', async(req, res) => {
  let errorMessage;
  let data = { ...req.body }
  const { error: errorFromJoiValidation } = validateGenreSchema(data);

  if(errorFromJoiValidation) {
    errorMessage = concatErrorMessages({ arrayOfErrors: errorFromJoiValidation.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  try {
    const genre = await updateGenreById(req.params.id, data);

    if(!genre) return res.status(400).send('Invalid ID. Genre not found in database.');

    return res.send(genre);
  } catch (error) {
    return res.status(400).send('Failed in handling Mongo operation.');
  }
});

router.delete('/:id', async(req, res) => {
  try {
    const genre = await deleteGenreById(req.params.id);

    if(!genre) return res.status(400).send('Invalid ID. Genre not found in database.');

    return res.send(genre);
  } catch (error) {
    return res.status(400).send('Failed in handling Mongo operation.' + error);
  }
});

module.exports = router;