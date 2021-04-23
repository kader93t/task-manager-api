const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcom = (email, name) => {
  const msg = {
    to: email,
    from: 'abaek93@gmail.com',
    subject: 'Thanks for you joining us',
    text: `Welcom to the application, ${name}.`,
    html: '<strong>Task manager</strong>',
  };

  sgMail.send(msg);
};

const sendCnacelation = (email, name) => {
  const msg = {
    to: email,
    from: 'abaek93@gmail.com',
    subject: 'Sorry to see you go',
    text: `GoodBye, ${name}, we hope to see you back.`,
    html: '<strong>Task manager</strong>',
  };

  sgMail.send(msg);
};

module.exports = {
  sendWelcom,
  sendCnacelation,
};
