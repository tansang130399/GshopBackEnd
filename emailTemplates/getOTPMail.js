const fs = require('fs');
const path = require('path');

const getOTPCode = (email, otp) => {
    const templatePath = path.join(__dirname, "contentOTPMail.html");
    let html = fs.readFileSync(templatePath, "utf8");

    html = html
        .replace(/{{email}}/g, email)
        .replace(/{{otp}}/g, otp)

    return html;
};

module.exports = getOTPCode;