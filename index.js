var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const customerModel = require('./models/customer');
const vendorModel = require('./models/vendor');
const passwordModule = require('./helpers/password');
const emailModule = require('./helpers/email');

app.get('/', async (req, res) => {
    //res.sendFile(__dirname + '/index.html');
    res.json(await vendorModel.getAll());
})


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

/*app.put('/v1/user-authentication/customer/password/recover', (req,res) => {
    var email = req.body.email;
    if(customerModel.isInDatabase(email) == true) {
        var newpassword = passwordModule.generate();
        var hash = passwordModule.hash(newpassword);
        emailModule.mailto(newpassword,email);
        res.json(200, 'OK');
    } else {
        res.json(404, 'Email not found');
    }
})*/

app.put('/v1/user-authentication/customer/password/change' , async (req,res) => {
    var customer_id = req.body.customerId;
    console.log(customer_id);
    var pwd = req.body.passwordNew;
    console.log(pwd);
    let [err, result] = await customerModel.changePassword(pwd,customer_id)
    if (err) {
        res.status(500).json(err)
      } else if (result.affectedRows == 0){
        res.status(404).send()
      }else {
        res.status(200).send()
      }
})

app.put('/v1/vendor-main/orderId/status', async (req,res) => {
    let order_id = req.body.order_id;
    console.log(order_id);
    var order_status = req.body.order_status;
    console.log(order_status);
    let [err, result] = await vendorModel.updateOrderStatus(order_status,order_id)
    if (err) {
        res.status(500).json(err)
      } else if (result.affectedRows == 0){
        res.status(404).send()
      }else {
        res.status(200).send()
      }
})
app.put('/v1/menu-management/vendorId/menu/' , async (req,res) => {
    let vendor_id = req.body.vendor_id
    let result = {combinationList: await vendorModel.getCombMenu(vendor_id), alacarteList: await vendorModel.getAlaMenu(vendor_id)}
    if(result.combinationList == false || result.alacarteList == false) {
      res.status(404).send()
    } else {
      res.json(result)
    }

})

app.post('/v1/vendor-main/vendorId/orders' , async(req,res) => {
  let vendor_id = req.body.vendor_id
  let result = {orderList : await vendorModel.getOrder(vendor_id)}
  if(result.orderList == false){
    res.status(404).send()
  }else{
    res.json(result)
  }
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