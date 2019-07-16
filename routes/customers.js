const Joi = require('joi');
const express = require('express');
// Functions that will operate directly in the database
const {
  addNewCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById
} = require('../models/customers');

// Helpers functions for Joi validation
const { concatErrorMessages } = require('../helpers');
const customerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  phone: Joi.string().min(3).max(15).required(),
  isGold: Joi.boolean()
});
const validateCustomerSchema = (customer) => customerSchema.validate(customer, { abortEarly: false });

// Router manipulation
const router = express.Router();
router.get('/', async (req, res) => {
  const customers = await getAllCustomers();

  return res.send(customers);
});

router.post('/', async (req, res) => {
  let data = { ...req.body };
  let errorMessage;
  const { error } = validateCustomerSchema(data);
  
  if (error) {
    errorMessage = concatErrorMessages({ arrayOfErrors: error.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  try {
    const newCustomer = await addNewCustomer(data);
    return res.send(newCustomer);
  } catch (error) {
    errorMessage = `Failed at mongo validation:\n${error.message}`
    return res.status(400).send(errorMessage);
  }
});

router.get('/:id', async(req, res) => {
  try {
    const customer = await getCustomerById(req.params.id);

    if(!customer) return res.status(404).send('404 Not found.');

    return res.send(customer);
  } catch (error) {
    return res.status(400).send('Failed in handling Mongo operation.');
  }
});

router.put('/:id', async(req, res) => {
  let errorMessage;
  let data = { ...req.body }
  const { error: errorFromJoiValidation } = validateCustomerSchema(data);

  if(errorFromJoiValidation) {
    errorMessage = concatErrorMessages({ arrayOfErrors: errorFromJoiValidation.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  try {
    const customer = await updateCustomerById(req.params.id, data);

    if(!customer) return res.status(400).send('Invalid ID. Customer not found in database.');

    return res.send(customer);
  } catch (error) {
    return res.status(400).send('Failed in handling Mongo operation.');
  }
});

router.delete('/:id', async(req, res) => {
  try {
    const customer = await deleteCustomerById(req.params.id);

    if(!customer) return res.status(400).send('Invalid ID. Customer not found in database.');

    return res.send(customer);
  } catch (error) {
    return res.status(400).send('Failed in handling Mongo operation.' + error);
  }
});

module.exports = router;