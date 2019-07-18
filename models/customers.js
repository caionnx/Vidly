const Joi = require('joi');
const mongoose = require('mongoose');

// Helpers functions for Joi validation
const customerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  phone: Joi.string().min(3).max(15).required(),
  isGold: Joi.boolean()
});
const JoiValidateCustomer = (customer) => customerSchema.validate(customer, { abortEarly: false });

const Customer = new mongoose.model('Customer', new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true
  },
  phone: {
    type: String,
    minlength: 3,
    maxlength: 15,
    required: true
  },
  isGold: {
    type: Boolean,
    default: false
  }
}));

function getAllCustomers() {
  return Customer.find();
}

async function getCustomerById(id) {
  return Customer.findById(id);
}

function addNewCustomer(data) {
  const customer = new Customer(data);
  return customer.save();
}

async function updateCustomerById(id, data) {
  try {
    let customer = await Customer.findById(id);
    
    if(!customer) return null;
    
    //Updating
    customer.set({ ...data })
    
    return customer.save();
  } catch (error) {
    return Promise.reject(error);
  }
}

function deleteCustomerById(id) {
  return Customer.findByIdAndRemove(id);
}

module.exports = {
  Customer,
  addNewCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
  JoiValidateCustomer
};