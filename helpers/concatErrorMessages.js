const begginingOfMessage = 'The response has the following errors:\n';

// Recursively creates a message through an array
const concatErrorMessages = ({ arrayOfErrors = [], param, idx = 0, message = begginingOfMessage }) => {
  let newMessage;
  const error = arrayOfErrors[idx] || {};
  newMessage = error[param] ? `${message}\n${error[param]}` : message;
  if(idx === arrayOfErrors.length) {
    return newMessage;
  } else {
    return concatErrorMessages({
      arrayOfErrors,
      param,
      idx: idx + 1,
      message: newMessage
    });
  }
};

module.exports = concatErrorMessages;