const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/adminAuth');
const { concatErrorMessages } = require('../helpers');
// Functions that will operate directly in the database
const {
  addNewCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
  JoiValidateCustomer
} = require('../models/customers');

router.get('/', async (req, res) => {
  const customers = await getAllCustomers();

  return res.send(customers);
});

router.post('/', authMiddleware, async (req, res) => {
  let data = { ...req.body };
  let errorMessage;
  const { error } = JoiValidateCustomer(data);
  
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

router.put('/:id', authMiddleware, async(req, res) => {
  let errorMessage;
  let data = { ...req.body }
  const { error: errorFromJoiValidation } = JoiValidateCustomer(data);

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

router.delete('/:id', adminMiddleware, async(req, res) => {
  try {
    const customer = await deleteCustomerById(req.params.id);

    if(!customer) return res.status(400).send('Invalid ID. Customer not found in database.');

    return res.send(customer);
  } catch (error) {
    return res.status(400).send('Failed in handling Mongo operation.' + error);
  }
});

module.exports = router;