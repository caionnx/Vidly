const Joi = require('joi');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

// Helpers functions for Joi validation
const JoiUserSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().min(3).max(50).required(),
  password: Joi.string().min(3).max(50).required(),
});
const JoiValidateUser = (user) => JoiUserSchema.validate(user, { abortEarly: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    maxlength: 50,
    required: true
  },
  email: {
    type: String,
    unique: true,
    minlength: 3,
    maxlength: 50,
    required: true
  },
  password: {
    type: String,
    minlength: 3,
    maxlength: 1024,
    required: true
  },
  isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function() {
  return jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
}

const User = new mongoose.model('User', userSchema);

function getAllUsers() {
  return User.find();
}

async function getUserById(id) {
  return User.findById(id).select('-password');
}

async function addNewUser(data) {
  const { name, email, password } = data;
  const userInDB = await User.findOne({ email });
  if(userInDB) return Promise.reject({ message: 'User already registered.' })
  
  const hashedPassword = await bcrypt.hash(password, 10); // Second param as number of rounds for salt
  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  // Add a token so the user is already logged in
  const token = user.generateAuthToken();
  return { user: { name, email, _id: user._id }, token };
}

module.exports = {
  User,
  addNewUser,
  getAllUsers,
  getUserById,
  JoiValidateUser
};