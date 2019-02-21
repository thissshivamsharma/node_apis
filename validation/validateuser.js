var generalvalidation=require('../validation/generalvalidation');


const loginvalidation=(details) =>{

    var error =generalvalidation.isempty(details);
    return error;
    

};


const signupvalidation=(details) =>{

    var error =generalvalidation.isempty(details);
    if(generalvalidation.isnumeric(details.phone)== false){}
    else
    error.push(generalvalidation.isnumeric(details.phone));

    if(generalvalidation.isemail(details.email)== false){}
    else
    error.push(generalvalidation.isemail(details.email));

    return error;
    

};

//   const errors = validationResult(req);
//   console.log(errors); 
//   if (!errors.isEmpty()) {
//         return res.status(422).json({ errors: errors.array(), statuscode: 422, status: 'failure' });
//     }
//     else return;
// };


module.exports.loginvalidation=loginvalidation;
module.exports.signupvalidation=signupvalidation;