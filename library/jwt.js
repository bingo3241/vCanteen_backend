'use strict';

const jwt = require('jsonwebtoken');

var secretKEY = process.env.SECRET_KEY

var signOptions = {
    issuer:  'vCanteen',
    expiresIn:  "30d"
   };

var verifyOptions = {
issuer:  'vCanteen',
expiresIn:  "30d",
algorithm:  ["HS256"]
};

function sign(email) {
    var payload = {
        email: email
    }

    return jwt.sign(payload, secretKEY, signOptions)
    
}

function verify(token) {
    try {
        return jwt.verify(token, secretKEY, verifyOptions);
    } catch(err) {
        return false;
    }
 }

function decode(token) {
    return jwt.decode(token, {complete: true})
    //returns null if token is invalid
}

function isExpired(token) {
    const {exp} = decode(token)
    if (Date.now() / 1000 > exp) {
        return true;
      }
    else return false;
}

module.exports = {
    sign, 
    verify,
    decode,
    isExpired
}