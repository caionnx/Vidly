const Joi = require('joi');
const bcrypt = require('bcrypt');
const { User } = require('./users');

// Helpers functions for Joi validation
const requestSchema = Joi.object({
  email: Joi.string().email().min(3).max(50).required(),
  password: Joi.string().min(3).max(50).required(),
});
const JoiValidateRequest = (data) => requestSchema.validate(data, { abortEarly: false });

async function authUser(data) {
  const { email, password } = data;
  const invalidAuthError = { message: 'Invalid email or password.' };

  try {
    const userInDB = await User.findOne({ email });
    const validPassword = await bcrypt.compare(password, userInDB.password);
    if(!validPassword) return Promise.reject(invalidAuthError);

    return userInDB.generateAuthToken();
  } catch (error) {
    return Promise.reject(invalidAuthError);
  }
}

module.exports = {
  authUser,
  JoiValidateRequest
};