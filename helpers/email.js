function mailto(password, email) {
    var API_KEY = process.env.MAILGUN_API_KEY;
    var DOMAIN = process.env.MAILGUN_DOMAIN;
    var mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

    const data = {
    from: 'vCanteen <vcanteen@gmail.com>',
    to: email,
    subject: 'Hello, Your new password is here!',
    text: 'Your new password: '+password
    };

    mailgun.messages().send(data, (error, body) => {
        if(!error) {
            console.log(body);
        } else {
            console.log(error);
        }

    });
}
