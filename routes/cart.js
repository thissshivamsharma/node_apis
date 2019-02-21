var express = require('express');
var app=new express();
var router = express.Router();
var validatecart=require('../validation/validatecart');
const verifytoken=require('../jwt/verifytoken');

//adding products to cart API
router.post('/add',verifytoken.verifytoken,(req, res)=> {
    var user_id=req.data.id;
    var seller_id=req.body.seller_id;
    var product_name =req.body.product_name;
    var product_id=req.body.product_id;
    var quantity=req.body.quantity;
    var price =req.body.price;
    var total =quantity*price;
    

    var details = { ...req.body };
  var error = validatecart.addcartvalidation(details);
  
  if (error.length > 0) {
    res.send(error);
  }
  else{
    req.getConnection((err,connection)=>{
        if(err)
        console.log('connection failed');
        else{
            connection.query('select * from product where product_id=? and seller_id=?',[product_id,seller_id],(err,result)=>{
                if(err)
                {
                    console.log('error');
                }
                else
                {
                    if(result.length>0)
                    {
                        connection.query('INSERT INTO `cartinfo`( `user_id`,`seller_id`, `product_id`, `quantity`, `price`, `total`, `product_name`) \
            VALUES (?,?,?,?,?,?)',[user_id,seller_id,product_id,quantity,price,total,product_name],(err,result)=>{
                if(err)
                console.log('error');
                else
                res.send('added to cart'); 
        });
                    }
                    else{
                        console.log('seller does not have that product');
                    }
                }

            })
            
    }
    })
}

});


//updating products in cart API
 router.post('/update',verifytoken.verifytoken ,(req, res)=> {
     var user_id=req.data.id;
     var quantity=req.body.quantity;
     var product_id=req.body.product_id;

     var details = { ...req.body };
  var error = validatecart.updatecartvalidation(details);
  
  if (error.length > 0) {
    res.send(error);
  }
  else{
     req.getConnection((err,connection)=>{
         if(err)
        console.log('connection failed');
        else{
            connection.query('select * from cartinfo where product_id=? and user_id=?',[product_id,user_id],(err,result)=>{
                if(err)
                console.log('error');
                else{
                var price=result[0].price;
                var total=price*quantity; 
                connection.query('UPDATE `cartinfo` SET `quantity`=? \
            ,`total`=? WHERE product_id=? and user_id=?',[quantity,total,product_id,user_id],(err,result)=>{
                if(err)
                console.log('error');
                else
                res.send('done');
            }
                )   
            }
            //console.log(result[0].price);
            });
            
        }
     })
    }


 });


 //deleting 
 router.post('/delete',verifytoken.verifytoken, (req, res)=> {
    var user_id=req.data.id;   
    var product_id=req.body.product_id;

    var details = { ...req.body };
  var error = validatecart.deletecartvalidation(details);
  
  if (error.length > 0) {
    res.send(error);
  }
  else{
    req.getConnection((err,connection)=>{
        if(err)
       console.log('connection failed');
        else
        {
            connection.query('DELETE FROM `cartinfo` WHERE product_id=? and user_id=?',[product_id,user_id],(err,result)=>{
                if(err)
                console.log('error');
                else
                res.send('done');
            })
        }

    });
}


 });
 router.post('/checkout',verifytoken.verifytoken,(req, res)=> {
    var user_id=req.data.id;
    var seller_id=req.body.seller_id;
    var product_id=req.body.product_id;
    var product_name =req.body.product_name;
    var quantity=req.body.quantity;
    var price =req.body.price;
    var total =quantity*price;
    

    var details = { ...req.body };
  var error = validatecart.addcartvalidation(details);
  
  if (error.length > 0) {
    res.send(error);
  }
  else{
    req.getConnection((err,connection)=>{
        if(err)
        console.log('connection failed');
        else{
            connection.query('INSERT INTO `orderhistory`( `user_id`, `seller_id`, `product_id`, `product_name`, `quantity`, `price`) \
            select user_id , seller_id , product_id , product_name , quantity , price from cartinfo ',(err,result)=>{
                if(err)
                console.log('error');
                else{
                    connection.query('DELETE FROM `cartinfo` WHERE user_id=? and seller_id=? and product_id=?',[user_id,seller_id,product_id],(err,result)=>{
                        if(err)
                        {
                            console.log('error')
                        }
                        else
                        {
                            connection.query('UPDATE `products` SET `availability`=availability-quantity WHERE user_id=? and seller_id=? and product_id=? ',[user_id,seller_id,product_id],(err,result)=>{
                                if(err){
                                    console.log('something went wrong');
                                }
                                res.send('order placed sucessfully'); 
                            })
                        }

                    })
                }
                
        });
    }
    })
}

});


module.exports = router;