module.exports = {
    mailto: function(password, email) {
        var API_KEY = 'f7b249a2413b80c07dcc5025160ace4a-9ce9335e-1291a245';
        var DOMAIN = 'sandbox170d9ebcfa4c4ff1abd017d8f7352e94.mailgun.org';
        var mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

        const data = {
        from: 'Mailgun Sandbox <postmaster@sandbox170d9ebcfa4c4ff1abd017d8f7352e94.mailgun.org>',
        to: email,
        subject: 'Hello',
        text: 'Your new password: '+password
        };

        mailgun.messages().send(data, (error, body) => {
        console.log(body);
        });
    }
}