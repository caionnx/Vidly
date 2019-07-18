const Joi = require('joi');
const mongoose = require('mongoose');
const { genreSchema, Genre } = require('./genres');

// Helpers functions for Joi validation
const movieSchema = Joi.object({
  title: Joi.string().min(3).max(50).required(),
  genreId: Joi.string().max(50).required(),
  numberInStock: Joi.number().min(0).max(255).required(),
  dailyRentalRate: Joi.number().min(0).max(255).required()
});
const JoiValidateMovie = (movie) => movieSchema.validate(movie, { abortEarly: false });

const Movie = new mongoose.model('Movie', new mongoose.Schema({
  title: {
    type: String,
    minlength: 1,
    maxlength: 255,
    required: true
  },
  genre: {
    type: genreSchema,
    required: true
  },
  numberInStock: {
    type: Number,
    min: 0,
    max: 255,
    required: true
  },
  dailyRentalRate: {
    type: Number,
    min: 0,
    max: 255,
    required: true
  }
}));

function getAllMovies() {
  return Movie.find();
}

async function getMovieById(id) {
  return Movie.findById(id);
}

async function addNewMovie(data) {
  try {
    const genre = await Genre.findById(data.genreId);
    if(!genre) return Promise.reject({ message: 'Invalid Genre.' }); 
    const movieData = { ...data, genre: { _id: genre._id, name: genre.name } };
    const movie = new Movie(movieData);

    return movie.save();
  } catch (error) {
    return Promise.reject(error);
  }
}

async function updateMovieById(id, data) {
  try {
    let updates;
    let movie = await Movie.findById(id);
    const genre = await Genre.findById(data.genreId);
    if(!movie) return null;
    if(!genre) return Promise.reject({ message: 'Invalid Genre.' });

    // While updating, make sure to keep Genre props
    updates = { ...data, genre: { _id: genre._id, name: genre.name } };
    movie.set(updates);

    return movie.save();
  } catch (error) {
    return Promise.reject(error);
  }
}

function deleteMovieById(id) {
  return Movie.findByIdAndRemove(id);
}

module.exports = {
  Movie,
  addNewMovie,
  getAllMovies,
  getMovieById,
  updateMovieById,
  deleteMovieById,
  JoiValidateMovie
};