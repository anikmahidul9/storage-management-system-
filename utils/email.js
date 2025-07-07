import nodemailer from 'nodemailer';

const sendEmail = async options => {
  // 1) Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user:process.env.GMAIL_USER,
        pass:process.env.GMAIL_APP_PASSWORD,
    }
});

  // 2) Define email options
  const mailOptions = {
    from: 'Your App <noreply@yourapp.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // 3) Send email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;