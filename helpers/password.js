//Credit: https://stackoverflow.com/users/822354/hajikelist
const sjcl = require('../library/sjcl');

function generate ( len ) {
    var length = (len)?(len):(15);
    var lowercase= "abcdefghijklmnopqrstuvwxyz"; //to upper 
    var numeric = '0123456789';
    var uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var password = "";
    var character = "";
    while( password.length<length ) {
        entity1 = Math.ceil(lowercase.length * Math.random()*Math.random());
        entity2 = Math.ceil(numeric.length * Math.random()*Math.random());
        entity3 = Math.ceil(uppercase.length * Math.random()*Math.random());
        hold = lowercase.charAt( entity1 );
        character += hold;
        character += numeric.charAt( entity2 );
        character += uppercase.charAt( entity3 );
        password = character;
    }
    password=password.split('').sort(function(){return 0.5-Math.random()}).join('');
    return password.substr(0,len);
}

function hash (input) {
    var output = sjcl.hash.sha256.hash(input);
    return sjcl.codec.hex.fromBits(output).toString();
}

module.exports = {
    generate,
    hash
}

