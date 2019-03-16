var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const customerModel = require('./models/customer');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/forget_password', function(req, res) {
    // var email = req.body.email;
    var email = 'bingo6689@gmail.com';
    const passwordModule = require('./helpers/password');
    const emailModule = require('./helpers/email');
    //GENERATE NEW PASSWORD
    var newpassword = passwordModule.generate();
    console.log('New password: '+newpassword);
    //HASHING NEW PASSWORD
    var hash = passwordModule.hash(newpassword);
    console.log('HASH :'+ passwordModule.toUpperCase(hash));
    res.send('<h><b>New password has been sent to your email<b></h>')
    //SENT PLAINTEXT NEW PASSWORD TO USER
    emailModule.mailto(newpassword, email);
    //TODO: INSERT HASHED NEW PASSWORD INTO DB
})

app.get('/customer', async (req,res) => {
    res.json(await customerModel.getAll());
})

app.post('/sign_in', function(req, res) {
    
})



io.on('connection', function(socket){
    console.log('a user connected :'+socket.id);
});
  
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
http.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});