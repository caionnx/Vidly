const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true
  }
});

const Genre = new mongoose.model('Genre', genreSchema);

function getAllGenres() {
  return Genre.find();
}

async function getGenreById(id) {
  return Genre.findById(id);
}

function addNewGenre(data) {
  const genre = new Genre(data);
  return genre.save();
}

async function updateGenreById(id, data) {
  try {
    let genre = await Genre.findById(id);
    
    if(!genre) return null;
    
    //Updating
    genre.set({ ...data })
    
    return genre.save();
  } catch (error) {
    return Promise.reject(error);
  }
}

function deleteGenreById(id) {
  return Genre.findByIdAndRemove(id);
}

module.exports = {
  addNewGenre,
  getAllGenres,
  getGenreById,
  updateGenreById,
  deleteGenreById
};