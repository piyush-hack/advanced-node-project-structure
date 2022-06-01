const mailgun = require("mailgun-js")({
  apiKey: process.env.MAILGUN_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const sendMailgun = (data) => {
   let maildata = {
    from: `Team ${data.company} <support@hexaok.com>`,
    to: data.to,
    subject: data.subject,
    text: data.text,
    html : data.html || null,
    attachment: data.attachment || null,
    inline : data.inline || null
  };

  mailgun.messages().send(maildata, function (error, body) {
    if (error) {
      // console.log(error);
    }
    // console.log(body);
  });
};

module.exports = {
    sendMailgun,
};
