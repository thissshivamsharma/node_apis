var express = require('express');
var app=new express();
var router = express.Router();
const { check ,validationResult} = require('express-validator/check');

//router.post('/history', (req, res)=> {});




//seller setting status API
router.post('/status/seller',[check('status').not().isEmpty().isNumeric()
,check('oid').not().isEmpty().isNumeric(),check('product_id').not().isEmpty().isNumeric()], (req, res)=> {
console.log("------", statu);    
    var status=req.body.status;
    var oid=req.body.oid;
    var product_id=req.body.product_id;
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() ,statuscode:422,status:'failure'});
  }
    if(status=='1')
     var statu='Delivered';
    if(status=='2')
     var statu='cancelled';
console.log("------", statu);
    
    req.getConnection('UPDATE `orderhistory` SET status=? WHERE oid=? and product_id=?',[statu,oid,product_id],(err,result)=>{
        if(err)
                console.log('error');
                else
                res.send('done');
    });
});





//user setting status API
router.post('/status/user',[check('status').not().isEmpty().isNumeric()
,check('oid').not().isEmpty().isNumeric(),check('product_id').not().isEmpty().isNumeric()], (req, res)=> {
    var status=req.body.status;
    var oid=req.body.oid;
    var product_id=req.body.product_id;
    if(status=='1')
     status='Delivered';
    if(status=='2')
     status='cancelled';

     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(422).json({ errors: errors.array() ,statuscode:422,status:'failure'});
     }

    req.getConnection('UPDATE `orderhistory` SET `status`=? WHERE oid=? and product_id=?',[status,oid,product_id],(err,result)=>{
        if(err)
                console.log('error');
                else
                res.send('done');
    });
});


module.exports = router;