var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/forget_password', function(req, res) {
    const passwordModule = require('./random_password_generator');
    const emailModule = require('./email');
    let password = passwordModule.generate();
    console.log('New password: '+password);
    emailModule.mailto(password, 'bingo6689@gmail.com');
    res.send('New password: '+password);

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