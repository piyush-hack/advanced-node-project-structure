const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = (data) => {
  const msg = {
    to: data.to,
    from: "admin@trinarybits.com",
    subject: data.subject,
    html: data.html,
  };
  sgMail.send(msg);
};

module.exports = {
  sendMail,
};
