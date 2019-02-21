var express = require('express');
var router = express.Router();
var validateuser = require('../validation/validateuser');
const jwt = require('jsonwebtoken');
const config=require('../config');

const verifytoken = require('../jwt/verifytoken');



//user login API
router.post('/login', (req, res) => {
  var user_name = req.body.user_name;
  var password = req.body.password;

  var details = { ...req.body };
  var error = validateuser.loginvalidation(details);
  if (error.length > 0) {
    res.send(error);
  }
  else {

    req.getConnection((err, connection) => {
      if (err)
        console.log('connection failed');
      else {
        connection.query('Select * from userinfo where user_name=? and password=?', [user_name, password], (err, result) => {
          if (err)
            console.log('error');
          else {
            if (result.length > 0) {
              user_id = result[0].user_id;
              email = result[0].email;
              jwt.sign({ id: user_id, email: email }, config.secretkey, { expiresIn: 60 * 60 }, (err, token) => {
                if (err) res.send(error);
                connection.query('UPDATE `userinfo` SET `token`=? WHERE `user_name`=? and `password`=?', [token, user_name, password], (err, result) => {
                  if (err)
                    console.log('error');
                  else {
                    res.send({
                      statuscode: 200,
                      message: 'Success',
                      result: {
                        username: user_name,
                        email: email,
                        token: token
                      }
                    })
                  }
                })
              })
            }
            else
              res.send({ result, status: 'failure', statuscode: 400, message: 'Invalid Credentials' });
          }
        }
        );
      };
    });
  }
});






//user signup API
router.post('/signup', (req, res) => {
  
  var user_name = req.body.user_name;
  var email = req.body.email;
  var password = req.body.password;
  var phone = req.body.phone;
  var address = req.body.address;


  var details = { ...req.body };
  var error = validateuser.signupvalidation(details);
  if (error.length > 0) {
    res.send(error);

  }
  else {
    req.getConnection((err, connection) => {
      if (err)
        console.log('connection failed');
      else {
        connection.query('select * from userinfo where email=? and phone =?', [email, phone], (err, result) => {
          if (err) {
            console.log('error')
          }
          else {
            if (result.length == 0) {
              //Token generation signup
              jwt.sign({ user_name: user_name }, config.secretkey, { expiresIn: 60 * 60 }, (err, token) => {
                if (err)
                  console.log('unable to create token');
                else {
                  console.log('token created');
                  connection.query('INSERT INTO `userinfo`( `user_name`, `email`, `password`, `phone`, `address`,`token`)\
                      VALUES (?,?,?,?,?,?)', [user_name, email, password, phone, address, token], (err, result) => {
                      if (err)
                        console.log('error');
                      else
                        res.send({
                          statuscode: 200,
                          message: 'Success',
                          result: {
                            username: user_name,
                            email: email,
                            token: token
                          }
                        })
                    });
                }

              });
            }
            else {
              res.send({
                statuscode: 403,
                message: 'Data already exist',
                result: {
                  username: user_name,
                  email: email,
                  phone: phone
                }
              })
            }
          }

        })
      }



    });
  };
});






module.exports = router;
