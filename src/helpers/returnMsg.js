// Return a json messsage with status (true or false)
const normalMsg = (res, statusCode, status, msg) => {
  return res.status(statusCode).json(
    {
      status: status,
      message: msg
    }
  );
}

// Return a json message with status 
// and authentication token
const loginMsg = (res, statusCode, status, msg, token) => {
  return res.status(statusCode).json(
    {
      status: status,
      message: msg,
      token: token
    }
  );
}


module.exports = {
  normalMsg,
  loginMsg
}