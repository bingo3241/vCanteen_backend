var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var CryptoJS = require("crypto-js");

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/forget_password', function(req, res) {
    const passwordModule = require('./random_password_generator');
    const sjcl = require('./sjcl');
    const emailModule = require('./email');
    var newpassword = passwordModule.generate();
    console.log('New password: '+newpassword);
    var hash = sjcl.hash.sha256.hash(newpassword);
    console.log('HASH :'+sjcl.codec.hex.fromBits(hash).toString().toUpperCase());
    res.send('<h><b>This is /forget_password<b></h>')
    // emailModule.mailto(newpassword, 'bingo6689@gmail.com');
    

})

io.on('connection', function(socket){
    console.log('a user connected :'+socket.id);
});
  
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
http.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});