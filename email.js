module.exports = {
    mailto: function(password, email) {
        var API_KEY = process.env.MAILGUN_API_KEY;
        var DOMAIN = process.env.MAILGUN_DOMAIN;
        var mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

        const data = {
        from: 'Excited User <me@samples.mailgun.org>',
        to: email,
        subject: 'Hello',
        text: 'Your new password: '+password
        };

        mailgun.messages().send(data, (error, body) => {
        console.log(body);
        });
    }
}