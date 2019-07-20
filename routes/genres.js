const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminAuth');
// Functions that will operate directly in the database
const {
  addNewGenre,
  getAllGenres,
  getGenreById,
  updateGenreById,
  deleteGenreById,
  JoiValidateGenre
} = require('../models/genres');

// Router manipulation
router.get('/', async (req, res) => {
  const genres = await getAllGenres();

  return res.send(genres);
});

router.post('/', authMiddleware, async (req, res) => {
  let data = { ...req.body };
  let errorMessage;
  const { error } = JoiValidateGenre(data);
  
  if (error) {
    errorMessage = concatErrorMessages({ arrayOfErrors: error.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  const newGenre = await addNewGenre(data);
  return res.send(newGenre);
});

router.get('/:id', async(req, res) => {
  const genre = await getGenreById(req.params.id);

  if(!genre) return res.status(404).send('404 Not found.');

  return res.send(genre);
});

router.put('/:id', authMiddleware, async(req, res) => {
  let errorMessage;
  let data = { ...req.body }
  const { error: errorFromJoiValidation } = JoiValidateGenre(data);

  if(errorFromJoiValidation) {
    errorMessage = concatErrorMessages({ arrayOfErrors: errorFromJoiValidation.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  const genre = await updateGenreById(req.params.id, data);

  if(!genre) return res.status(400).send('Invalid ID. Genre not found in database.');

  return res.send(genre);
});

router.delete('/:id', adminMiddleware, async(req, res) => {
  const genre = await deleteGenreById(req.params.id);

  if(!genre) return res.status(400).send('Invalid ID. Genre not found in database.');

  return res.send(genre);
});

module.exports = router;