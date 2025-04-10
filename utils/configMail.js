const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: "465",
    secure: true,
    auth: {
        user: "pn93948848@gmail.com",
        pass: "gixysjvuxxjtocrz",
    }
});

module.exports = { transporter };
