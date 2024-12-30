const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1. Create a transport service
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'c257c8fd11326d',
      pass: '4d7c070a679e5b',
    },
  });

  //2. define the email options

  const mailOptions = {
    from: 'Adi <adiyouaresosmart@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //3. Actually send the email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
