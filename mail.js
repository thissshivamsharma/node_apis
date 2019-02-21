const nodemailer = require('nodemailer'),
    creds = require('./config/creds'),
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: creds.user,
            pass: creds.pass,
        },
    }),
    
    var mailOptions = {
        from: creds.user,
        to: 'myfriend@yahoo.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
      };

      
     transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      }); 


      module.exports={mail};

      

