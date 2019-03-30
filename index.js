var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const customersModel = require('./models/customers');
const ordersModel = require('./models/orders')

const passwordModule = require('./helpers/password');
const emailModule = require('./helpers/email');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// app.get('/forget_password', function(req, res) {
//     // var email = req.body.email;
//     var email = 'bingo6689@gmail.com';
//     //GENERATE NEW PASSWORD
//     var newpassword = passwordModule.generate();
//     console.log('New password: '+newpassword);
//     //HASHING NEW PASSWORD
//     var hash = passwordModule.hash(newpassword);
//     console.log('HASH :'+ passwordModule.toUpperCase(hash));
//     res.send('<h><b>New password has been sent to your email<b></h>')
//     //SENT PLAINTEXT NEW PASSWORD TO USER
//     emailModule.mailto(newpassword, email);
//     //TODO: INSERT HASHED NEW PASSWORD INTO DB
// })

app.put('/v1/user-authentication/customer/password/recover', async (req,res) => {
    var email = req.body.email;
    if(customersModel.isInDatabase(email) == true) {
        var newpassword = passwordModule.generate();
        var hash = passwordModule.hash(newpassword);
        customersModel.updatePassword(email,hash);
        emailModule.mailto(newpassword,email);
        res.json(200, 'OK');
    } else {
        res.json(404, 'Email not found');
    }
})

// app.get('/v1/sales-record/vendor/sales', async (req,res) => { //wip
//     var vendorId = req.body.vendorId;
//     res.json(202, await ordersModel.getSaleRecord(vendorId))
    
// })

app.get('/v1/orders/customers/:customerId', async (req,res) => {
    var customerId = req.params.customerId;
    res.status(200).json(await ordersModel.getMenuItems(customerId))
})

app.get('/customer', async (req,res) => {
    res.json(await customersModel.getAll());
})

app.post('/hashtest', async (req, res) => {
    var a = req.body.text;
    res.json(passwordModule.hash(a));
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