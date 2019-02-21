var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyparser=require('body-parser');
var _ = require('lodash');


var userRouter = require('./routes/user');
var sellerRouter = require('./routes/seller');
var cartRouter = require('./routes/cart');
var orderRouter = require('./routes/order');

var app = express();
var config=require('./config');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
var mysql=require('mysql');
var myConnection = require('express-myconnection');
    
var dbOptions = {
      host:  config.database.host,
      user:  config.database.user,
      password:  config.database.password,
      port:  config.database.port,
      database:  config.database.db
    }
app.use(myConnection(mysql, dbOptions, 'pool'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/user', userRouter);
app.use('/seller', sellerRouter);
app.use('/cart',cartRouter);
app.use('/order',orderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(2019,()=>{
  console.log('success');
})
//module.exports = app;
