const mongoose = require('mongoose');

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
  addNewCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById
};