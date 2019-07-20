const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { concatErrorMessages } = require('../helpers');
// Functions that will operate directly in the database
const {
  addNewRental,
  getAllRentals,
  getRentalById,
  JoiValidateRental
} = require('../models/rentals');

router.get('/', async (req, res) => {
  const rentals = await getAllRentals();

  return res.send(rentals);
});

router.post('/', authMiddleware, async (req, res) => {
  let data = { ...req.body };
  let errorMessage;
  const { error } = JoiValidateRental(data);
  
  if (error) {
    errorMessage = concatErrorMessages({ arrayOfErrors: error.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  const newRental = await addNewRental(data);
  return res.send(newRental);
});

router.get('/:id', async(req, res) => {
  const rental = await getRentalById(req.params.id);

  if(!rental) return res.status(404).send('404 Not found.');

  return res.send(rental);
});

module.exports = router;