const express = require('express');
const router = express.Router();
const { concatErrorMessages } = require('../helpers');
// Functions that will operate directly in the database
const {
  authUser,
  JoiValidateRequest
} = require('../models/auth');

router.post('/', async (req, res) => {
  let data = { ...req.body };
  let errorMessage;
  const { error } = JoiValidateRequest(data);
  
  if (error) {
    errorMessage = concatErrorMessages({ arrayOfErrors: error.details, param: 'message' });
    return res.status(400).send(errorMessage);
  }

  try {
    const authToken = await authUser({ ...data });
    
    return res.send(authToken);
  } catch (error) {
    errorMessage = `Failed at mongo validation:\n${error.message}`
    return res.status(400).send(errorMessage);
  }
});

module.exports = router;