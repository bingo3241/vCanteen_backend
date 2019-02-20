//Credit: https://stackoverflow.com/users/822354/hajikelist
module.exports = {
    generate: function( len ) {
    var length = (len)?(len):(15);
    var lowercase= "abcdefghijklmnopqrstuvwxyz"; //to upper 
    var numeric = '0123456789';
    var uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var password = "";
    var character = "";
    var crunch = true;
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
}
