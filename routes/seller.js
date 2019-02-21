const express = require('express');

const router = express.Router();

const multer = require('multer');

const config=require('../config');

const jwt = require('jsonwebtoken');

const verifytoken=require('../jwt/verifytoken');

//const loadTemplate=require('../mail/mail');

const responses=require('../response/responses');

//const constant=require('../response/constant');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/')
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname)
  }
})

const filefilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
    cb(null, true);
  else
    cb(error, false)
};

const upload = multer({
  storage: storage, limits: {
    fileSize: 1024 * 1024 * 5
  }, fileFilter: filefilter
})
const validateseller = require('../validation/validateseller');



//login API

router.post('/login', (req, res) => {
  var seller_name = req.body.seller_name;
  var password = req.body.password;

  var details = { ...req.body };
  var error = validateseller.loginvalidation(details);
  if (error.length > 0) {
    res.send(error);
  }
  else {
    req.getConnection((err, connection) => {
      if (err)
        console.log('connection failed');
      else {
        connection.query('Select * from sellerinfo where seller_name=? and password=?', [seller_name, password], (err, result) => {
          if (err)
          responses.sendError(error.message, res);
          else {
            if (result.length > 0) {
              seller_id = result[0].seller_id;
              email = result[0].email;
              jwt.sign({ id: seller_id, email: email }, config.secretkey, { expiresIn: 60 * 60 }, (err, token) => {
                if (err) res.send(error);
                connection.query('UPDATE `sellerinfo` SET `token`=? WHERE `seller_name`=? and `password`=?', [token, seller_name, password], (err, result) => {
                  if (err)
                  responses.sendError(error.message, res);
                  else {
                    res.send({
                      statuscode: 200,
                      message: 'Success',
                      result: {
                        sellername: seller_name,
                        email: email,
                        token: token
                      }
                    })
                  }

                })
              });
            }
            else
              res.send({
                statuscode: 403,
                message: 'Invalid credentials',
                result: {
                  null:'Null'
                }
              });
          }
        }
        );
      };
    });
  }
});






//signup API

router.post('/signup', (req, res) => {
  var seller_name = req.body.seller_name;
  var email = req.body.email;
  var password = req.body.password;
  var phone = req.body.phone;
  var shopaddress = req.body.shopaddress;

  var details = { ...req.body };
  var error = validateseller.signupvalidation(details);
  if (error.length > 0) {
    res.send(error);
  }
  else {
    req.getConnection((err, connection) => {
      if (err)
        console.log('connection failed');
      else {
        connection.query('select * from sellerinfo where email=? and phone =?', [email, phone], (err, result) => {
          if (err) {
            console.log('error')
          }
          else {
            if (result.length > 0) {
              //Token generation signup
              jwt.sign({ seller_name: seller_name },config.secretkey, { expiresIn: 60 * 60 }, (err, token) => {
                if (err)
                  console.log('unable to create token');
                else {
                  console.log('token created');
                  connection.query('INSERT INTO `sellerinfo`( `seller_name`, `email`, `password`, `phone`, `shopaddress`,`token`)\
                VALUES (?,?,?,?,?,?)', [seller_name, email, password, phone, shopaddress, token], (err, result) => {
                      if (err)
                        console.log('error');
                      else
                      loadTemplate(welcome,details).then(()=>{
                        res.send({
                          statuscode: 200,
                          message: 'Success',
                          result: {
                            sellername: seller_name,
                            email: email,
                            token: token
                          }
                        })
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
                  sellername: seller_name,
                  email: email,
                  phone: phone
                }
              })
            }
          }

        })



      }
    });
  }
});





//product add API

router.post('/productadd', verifytoken.verifytoken, upload.array('image', 4), (req, res) => {

  var seller_id = req.data.id;
  var product_name = req.body.product_name;
  var price = req.body.price;
  var availability = req.body.availability;
  var description = req.body.description;

  var details = { ...req.body };
  var error = validateseller.productaddvalidation(details);

  if (error.length > 0) {
    res.send(error);
  }
  else {
    req.getConnection((err, connection) => {
      if (err)
        console.log('connection failed');
      else {
        connection.query('INSERT INTO `products`( `seller_id`, `product_name`, `price`, `availability`,`description`)\
      VALUES (?,?,?,?,?)', [seller_id, product_name, price, availability, description], (err, result) => {
            if (err)
              console.log('error');
            else
              res.send({
                statuscode: 200,
                message: 'Success',
                result: {
                  productname: product_name,
                  price: price,
                }
              })
          });
      }
    });

  }
});






//product delete API

router.post('/productdelete', verifytoken.verifytoken, (req, res) => {
  var seller_id = req.data.id;
  var product_id = req.body.product_id;

  var details = { ...req.body };
  var error = validateseller.productdelete(details);

  if (error.length > 0) {
    res.send(error);
  }
  else {
    req.getConnection((err, connection) => {
      if (err)
        console.log('connection failed');
      else {
        connection.query('select * from products where seller_id=? and product_id=?', [seller_id, product_id], (err, result) => {

          if (err)
            console.log('error');
          else if (result.length > 0) {
            connection.query('DELETE FROM `products` WHERE seller_id=? and product_id=?', [seller_id, product_id], (err, result) => {
              if (err)
                console.log('error');
              else
                res.send('done');
            });
          }
          else
            res.send({
              statuscode: 403,
              message: 'Failure',
              result: {
                Null:"Null"
              }
            });
        });

      }
    })
  }
});





//product update API

router.post('/productupdate', verifytoken.verifytoken, (req, res) => {
  var seller_id = req.data.id;
  var product_id = req.body.product_id;
  var price = req.body.price;
  var availability = req.body.availability;

  var details = { ...req.body };
  var error = validateseller.productupdate(details);

  if (error.length > 0) {
    res.send(error);
  }
  else {
    req.getConnection((err, connection) => {
      if (err)
        console.log('connection failed');
      else {
        connection.query('select * from products where seller_id=? and product_id=?', [seller_id, product_id], (err, result) => {

          if (err)
            console.log('error');
          else {
            if(result.length > 0)
           {
            connection.query('UPDATE `products` SET `price`=?,`availability`=? WHERE seller_id=? and product_id=?', [price, availability, seller_id, product_id], (err, result) => {
              if (err)
                console.log('error');
              else
                res.send({
                  statuscode: 200,
                  message: 'Sucess'
                });
            });
           }
           else
            res.send({
              statuscode: 403,
              message: 'Failure',
              result: {
                Null:"Null"
              }
            });
            
          }
          
        });

      }

    })
  }
});



module.exports = router;    