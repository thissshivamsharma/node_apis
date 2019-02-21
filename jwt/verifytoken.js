
const jwt = require('jsonwebtoken');
const config=require('../config');

function verifytoken(req, res, next) {
  var token = req.headers['accesstoken'];
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, config.secretkey, function (err, decoded) {
    if (err)
      return res.status(500).send({ auth: false, message: 'Session time Expired please login again' });
    else {
      req.data = {
        id: decoded.id,
        email: decoded.email
        
      }
      next();
    }


  });


}

module.exports={verifytoken}