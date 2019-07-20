const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { concatErrorMessages } = require('../helpers');
// Functions that will operate directly in the database
const {
  addNewUser,
  getAllUsers,
  getUserById,
  JoiValidateUser
} = require('../models/users');

router.get('/', async (req, res) => {
  const users = await getAllUsers();

  return res.send(users);
});

router.post('/', async (req, res) => {
  let data = { ...req.body };
  let errorMessage;
  const { error } = JoiValidateUser(data);
  
  if (error) {
    errorMessage = concatErrorMessages({ arrayOfErrors: error.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  const { user: newUser, token } = await addNewUser({ ...data });
  return res.header('x-auth-token', token).send(newUser);
});

router.get('/me', authMiddleware, async(req, res) => {
  const user = await getUserById(req.user._id);

  return res.send(user);
});

module.exports = router;