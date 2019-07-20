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

  try {
    const { user: newUser, token } = await addNewUser({ ...data });
    return res.header('x-auth-token', token).send(newUser);
  } catch (error) {
    errorMessage = `Failed at mongo validation:\n${error.message}`
    return res.status(400).send(errorMessage);
  }
});

router.get('/me', authMiddleware, async(req, res) => {
  try {
    const user = await getUserById(req.user._id);

    return res.send(user);
  } catch (error) {
    return res.status(400).send('Failed in handling Mongo operation.');
  }
});

module.exports = router;