const Joi = require('joi');
const mongoose = require('mongoose');
const { Customer } = require('./customers');
const { Movie } = require('./movies');

// Helpers functions for Joi validation
const rentalSchema = Joi.object({
  customerId: Joi.string().required(),
  movieId: Joi.string().required()
});
const JoiValidateRental = (rental) => rentalSchema.validate(rental, { abortEarly: false });

const Rental = mongoose.model('Rental', new mongoose.Schema({
  customer: { 
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
      },
      isGold: {
        type: Boolean,
        default: false
      },
      phone: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
      }      
    }),  
    required: true
  },
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        trim: true, 
        minlength: 5,
        maxlength: 255
      },
      dailyRentalRate: { 
        type: Number, 
        required: true,
        min: 0,
        max: 255
      }   
    }),
    required: true
  },
  dateOut: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  dateReturned: { 
    type: Date
  },
  rentalFee: { 
    type: Number, 
    min: 0
  }
}));

function getAllRentals() {
  return Rental.find().sort('-dateOut');
}

function getRentalById(id) {
  return Rental.findById(id);
}

async function addNewRental(data) {
  let rental;
  const customer = await Customer.findById(data.customerId);
  if (!customer) return Promise.reject({ message: 'Invalid customer.' });

  const movie = await Movie.findById(data.movieId);
  if (!movie) return Promise.reject({ message: 'Invalid movie.' });

  if (movie.numberInStock === 0) return Promise.reject({ message: 'Movie not in stock.' });

  rental = new Rental({ 
    customer: {
      _id: customer._id,
      name: customer.name, 
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  });

  let rentalSession;
  let movieSession;
  try {
    // Create collections and sessions to start a transaction.
    await Rental.createCollection();
    rentalSession = await Rental.startSession();
    movieSession = await Movie.startSession();
    rentalSession.startTransaction();
    movieSession.startTransaction();

    // Should include the session option when saving in a transaction.
    await rental.save({ session: rentalSession });

    // The same for any other operation.
    movie.numberInStock--;
    await movie.save({ session: movieSession });

    // If everything went right, commit and end the sessions.
    await rentalSession.commitTransaction();
    await movieSession.commitTransaction();
    await rentalSession.endSession();
    await movieSession.endSession();

    return rental;
  } catch (error) {
    // If something failed during the transaction, abort it and end session
    await rentalSession.abortTransaction();
    await movieSession.abortTransaction();
    await rentalSession.endSession();
    await movieSession.endSession();
    
    return Promise.reject(error);
  }
}

module.exports = {
  getAllRentals,
  getRentalById,
  addNewRental,
  JoiValidateRental
}