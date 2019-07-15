const Joi = require('joi');
const express = require('express');
const app = express();
const { concatErrorMessages } = require('./helpers');
const PORT = process.env.port || 3000;
let genres = [
  { id: 1, name: 'Terror' },
  { id: 2, name: 'Action' }
];
const getGenreById = (id) => genres.find(genre => genre.id === id);
const genreSchema = Joi.object({
  name: Joi.string().min(3).required(),
});
const validateGenreSchema = (genre) => genreSchema.validate(genre, { abortEarly: false });


app.use(express.json());
app.listen(PORT, () => `Vidly running on ${PORT}`);

app.get('/api/genres', (req, res) => {
  return res.send(genres);
});

app.get('/api/genres/:id', (req, res) => {
  const genre = getGenreById(parseInt(req.params.id, 10));

  if(!genre) {
    return res.status(404).send('404 Not found.');  
  }
  
  return res.send(genre);
});

app.put('/api/genres/:id', (req, res) => {
  let errorMessage;
  let updateForGenre = { ...req.body }
  const genre = getGenreById(parseInt(req.params.id, 10));
  const { error } = validateGenreSchema(updateForGenre);

  if(!genre) {
    return res.status(400).send('Genre not in list.');
  } else if(error) {
    errorMessage = concatErrorMessages({ arrayOfErrors: error.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  genre.name = updateForGenre.name;
  return res.send(genre);
});

app.delete('/api/genres/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const genre = getGenreById(id);

  if(!genre) {
    return res.status(400).send('Genre not in list.');
  }
  
  genres = genres.filter(gnr => gnr.id !== id);
  return res.send(genre);
});

app.post('/api/genres', (req, res) => {
  let newGenre = { ...req.body };
  let errorMessage;
  const { error } = validateGenreSchema(newGenre);
  
  if (error) {
    errorMessage = concatErrorMessages({ arrayOfErrors: error.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  newGenre.id = genres[genres.length - 1].id + 1; // Takes the latest id to generate a new one
  genres.push(newGenre);
  return res.send(newGenre);
});