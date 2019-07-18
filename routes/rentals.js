const express = require('express');
const router = express.Router();
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

router.post('/', async (req, res) => {
  let data = { ...req.body };
  let errorMessage;
  const { error } = JoiValidateRental(data);
  
  if (error) {
    errorMessage = concatErrorMessages({ arrayOfErrors: error.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  try {
    const newRental = await addNewRental(data);
    return res.send(newRental);
  } catch (error) {
    errorMessage = `Failed at mongo validation:\n${error.message}`
    return res.status(400).send(errorMessage);
  }
});

router.get('/:id', async(req, res) => {
  try {
    const rental = await getRentalById(req.params.id);

    if(!rental) return res.status(404).send('404 Not found.');

    return res.send(rental);
  } catch (error) {
    return res.status(400).send('Failed in handling Mongo operation.');
  }
});

module.exports = router;