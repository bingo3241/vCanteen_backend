module.exports = {
    mailto: function(password, email) {
        var API_KEY = 'aeacd2e09129e2ffef44fb19cdd4da31-9ce9335e-8f70b4ae';
        var DOMAIN = 'sandbox2d21c1642099472ebd59aa4c8e67858c.mailgun.org';
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