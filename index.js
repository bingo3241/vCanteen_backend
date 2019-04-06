var express = require('express');
var app = express();
var http = require('http').Server(app);




const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const customersModel = require('./models/customers');
const ordersModel = require('./models/orders')
const vendorsModel = require('./models/vendors')
const db = require('./db/db')
const firebase = require('./db/firebase')


const passwordModule = require('./helpers/password');
const emailModule = require('./helpers/email');

const jwt = require('./library/jwt');

const verifyJWT = (req, res, next) => {
  var token = req.body.token
  if (jwt.verify(token) != false) {
    next()
  }
  else {
    res.status(403).json('Token is invalid or expired')
  }
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.put('/v1/user-authentication/customer/password/recover', async (req,res) => {
    var email = req.body.email;
    if(await customersModel.isInDatabase(email)) {
        var customer_id = await customersModel.getCustomerID(email)
        var uid = await firebase.getUID(email);
        var newpassword = passwordModule.generate();
        console.log('New password generated')
        var hash = passwordModule.hash(newpassword);
        console.log('Hash: '+hash)
        let [err, result] = await customersModel.changePasswords(hash, customer_id);
        if (err) {
          res.status(500).json(err)
        } else if (result.affectedRows == 0){
          res.status(404).send()
        }else {
          console.log('Password has been updated')
          await firebase.updatePassword(uid, hash)
          emailModule.mailto(newpassword,email);
          res.status(200).json('Success');        }
    } else {
        res.status(404).json('Error!');
    }
})

app.put('/v1/user-authentication/customer/password/change' , async (req,res) => {
    var email = req.body.email;
    var customer_id = await customersModel.getCustomerID(email)
    var uid = await firebase.getUID(email)
    var pwd = req.body.passwordNew;
    let [err, result] = await customersModel.changePasswords(pwd,customer_id)
    if (err) {
        res.status(500).json(err)
      } else if (result.affectedRows == 0){
        res.status(404).send()
      }else {
        await firebase.updatePassword(uid, pwd)
        res.status(200).send('Password is changed')
      }
})

app.put('/v1/user-authentication/vendor/password/recover', async (req,res) => {
  console.log(req.body)
  var email = req.body.email;
  if(await vendorsModel.isInDatabase(email)) {
      var vendor_id = await vendorsModel.getVendorID(email)
      var uid = firebase.getUID(email)
      var newpassword = passwordModule.generate();
      console.log('New password generated')
      var hash = passwordModule.hash(newpassword);
      console.log('Hash: '+hash)
      let [err, result] = await vendorsModel.changePasswords(hash, vendor_id);
      if (err) {
        res.status(500).json(err)
      } else if (result.affectedRows == 0){
        res.status(404).send()
      }else {
        await firebase.updatePassword(uid, hash)
        console.log('Password has been updated')
        emailModule.mailto(newpassword,email);
        res.status(200).send('Success');
      }
  } else {
    res.status(404).send('Error!');
  }
})

app.put('/v1/user-authentication/vendor/password/change', async (req, res) => {
  var email = req.body.email
  var vendor_id = await vendorsModel.getVendorID(email);
  var uid = await firebase.getUID(email)
  console.log('UID: '+uid)
  var pwd = req.body.passwordNew;
  console.log(pwd);
  let [err, result] = await vendorsModel.changePasswords(pwd, vendor_id)
  if (err) {
      res.status(500).json(err)
    } else if (result.affectedRows == 0){
      res.status(404).send()
    }else {
      await firebase.updatePassword(uid, pwd)
      res.status(200).send('Password is changed')
    }
})

app.put('/v1/user-authentication/customer/verify/email', async (req, res) => {
  var email = req.body.email
  if (await customersModel.isInDatabase(email) == true) {
    res.status(200).send()
  } else {
    res.status(404).send()
  }
})

app.put('/v1/user-authentication/vendor/verify/email', async (req, res) => {
  var email = req.body.email
  if(await vendorsModel.isInDatabase(email) == true) {
    res.status(200).send()
  }else {
    res.status(404).send()
  }
})
app.post('/v1/user-authentication/customer/check/token', async (req,res) => {
  var output = new Object()
  if(req.body.account_type == 'FACEBOOK') {
      var email = req.body.email
      console.log('email: '+email)
      if(await customersModel.isInDatabase(email)) {
          output.status = 'success'
          output.customer_id = await customersModel.getCustomerID(email)
          output.token = jwt.sign(email);
          res.status(200).json(output)
      } else {
          var first_name = req.body.first_name
          var last_name = req.body.last_name
          var url = req.body.profile_url
          await customersModel.insertFacebook(first_name,last_name,email,url)
          output.status = 'success'
          output.customer_id = await customersModel.getCustomerID(email)
          output.token = jwt.sign(email);
          res.status(200).json(output)

      }
  } else if(req.body.account_type == 'NORMAL') {
      var email = req.body.email
      var password = req.body.password;
      if(await customersModel.NormalAuth(email, password)) {
          var output = new Object()
          output.status = 'success'
          output.customer_id = await customersModel.getCustomerID(email)
          output.token = jwt.sign(email)
          res.status(200).json(output)
      } else {
          res.status(404).json({status: 'error'})
      }
      console.log('email: '+email)
  }
})

app.post('/v1/user-authentication/vendor/check/token', async (req,res) => {
  var email = req.body.email
  var password = req.body.password;
  if(await vendorsModel.NormalAuth(email, password)) {
      var result = new Object()
      result.status = 'success'
      result.vendor_id = await vendorsModel.getVendorID(email)
      result.vendorToken = jwt.sign(email);
      res.status(200).json(result)
  } else {
      res.status(404).json({status: 'error'})
  }
  console.log('email: '+email)
})

app.post('/v1/user-authentication/customer/verify/token', async (req,res) => {
  var token = req.body.token
  if(jwt.verify(token) == false) {
      console.log("Verify failed")
      res.json({expired: true})
  } else {
      res.json({expired: jwt.isExpired(token)})
  }
})

app.post('/v1/user-authentication/vendor/verify/token', async (req,res) => {
  var token = req.body.token
  if(jwt.verify(token) == false) {
      console.log("Verify failed")
      res.json({expired: true})
  } else {
      res.json({expired: jwt.isExpired(token)})
  }
})

app.put('/v1/vendor-main/orderId/status', async (req,res) => {
    let order_id = req.body.orderId;
    console.log(order_id);
    var order_status = req.body.orderStatus;
    console.log(order_status);
    let [err, result] = await vendorsModel.updateOrderStatus(order_status,order_id)
    if (err) {
        res.status(500).json(err)
      } else if (result.affectedRows == 0){
        res.status(404).send()
      }else {
        res.status(200).send()
      }
})

app.get('/v1/menu-management/:vendorId/menu/', async (req, res) => {
  let vendor_id = req.params.vendorId
  const x = await vendorsModel.getCombMenu(vendor_id)
  const y = await vendorsModel.getAlaMenu(vendor_id)
  const result = { combinationList: await x, alacarteList: await y }
  if (result.combinationList == false && result.alacarteList == false) {
    res.status(404).send()
  } else {
    res.json(result)
  }
})

app.get('/v1/vendor-main/:vendorId/orders', async (req, res) => {
  let vendor_id = req.params.vendorId
  let result = { orderList: await vendorsModel.getOrder(vendor_id) }
  if (result.orderList == false) {
    res.status(404).send()
  } else {
    res.json(result)
  }
})

app.get('/v1/settings/:vendorId/info', async (req, res) => {
  let vendor_id = req.params.vendorId
  //console.log(vendor_id)
  let result = { vendorInfo: await vendorsModel.getVendorInfo(vendor_id), vendorPaymentMethod: await vendorsModel.getProvider(vendor_id) }
  if (result.vendorinfo == false) {
    res.status(404).send()
  } else {
    res.json(result)
  }
})

app.put('/v1/menu-management/vendorId/menu/foodId' , async(req,res) => {
  let {vendorId,foodId,foodName,price,foodStatus,foodType,foodImage} = req.body
  //console.log(vendor_id,food_id,food_name,food_price,food_status,food_type,food_image)
  let [err,result] = await vendorsModel.editMenu(vendorId,foodId,foodName,price,foodStatus,foodType,foodImage)
  if (err) {
    res.status(500).json(err)
  } else if (result.affectedRows == 0) {
    res.status(404).send()
  } else {
    res.status(200).send()
  }
})

app.post('/v1/menu-management/vendorId/menu', async(req,res) => {
  let {vendorId,foodName,price,foodStatus,foodType,foodImage} = req.body
  let [err,insertId] = await vendorsModel.createMenu(vendorId,foodName,price,foodStatus,foodType,foodImage)
  if (err) {
    res.status(500).json(err)
  } else {
    res.status(200).json({ food_id: insertId })
  }
})

app.get('/v1/menu-management/:vendorId/menu/:foodId', async (req, res) => {
  let vendor_id = req.params.vendorId
  let food_id = req.params.foodId
  const result = await vendorsModel.getMenu(vendor_id, food_id)
  if (result == false) {
    res.status(404).send()
  } else {
    res.json(result)
  }
})

app.delete('/v1/menu-management/:vendorId/menu/:foodId' , async (req,res) => {
  let vendor_id = req.params.vendorId
  let food_id = req.params.foodId
  let [err, result] = await vendorsModel.delMenu(vendor_id,food_id)
  if (err) {
    res.status(500).json(err)
  } else if (result.affectedRows == 0) {
    res.status(404).send()
  } else {
    res.status(200).send()
  }
})

app.put('/v1/settings/vendorId/status' , async(req,res) => {
  let vendor_id = req.body.vendorId
  let vendor_status = req.body.vendorStatus
  let [err,result] = await vendorsModel.updateVendorStatus(vendor_id,vendor_status)
  if (err) {
    res.status(500).json(err)
  } else if (result.affectedRows == 0) {
    res.status(404).send()
  } else {
    res.status(200).send()
  }
})

app.put('/v1/menu-management/vendorId/menu/foodId/status' , async(req,res) => {
  let vendor_id = req.body.vendorId
  let x = req.body.menuList
  let menu = []
  for (var i in x) {
    menu.push(x[i])
  }
  // x.forEach(food =>{
  //   menu.push(food)
  // })
  //console.log(menu[0])
  let y = await vendorsModel.editMenuStatus(vendor_id, menu)
  if (y == false) {
    res.status(200).send()
  } else if (y[0] == -1) {
    res.status(500).send(y[1])
  } else {
    res.status(404).send({ foodId: y })
  }
})

app.get('/v1/sales-record/vendor/:vendorId/sales', async (req,res) => { //wip
    var vendorId = req.params.vendorId;
    res.status(200).json(await ordersModel.getSaleRecords(vendorId))
})

app.get('/v1/orders/customers/:customerId/history', async (req, res) => {
  var customerId = req.params.customerId;
  res.status(200).json(await ordersModel.getHistory(customerId))
})

app.get('/v1/orders/customers/:customerId/in-progress', async (req, res) => {
  var customerId = req.params.customerId;
  res.status(200).json(await ordersModel.getInProgress(customerId))
})

app.get('/customer', async (req, res) => {
  res.json(await customersModel.getAll());
})

app.post('/hashtest', async (req, res) => {
  var a = req.body.text;
  res.json(passwordModule.hash(a));
})

app.get("/v1/orders/:id/slot", async (req, res) => {                 
    let id = req.params.id
    let slotNo = await ordersModel.getSlotNo(id)
    if (slotNo) {
      res.json(slotNo)
    } else {
      res.status(404).send()
    }
})
  
app.get("/v1/orders/:vid/menu", async (req, res) => {                     
  let vid = req.params.vid
  let result = await ordersModel.getVendorMenu(vid)
  res.json(result)
})

app.get("/v1/orders/:vid/menu/:fid", async (req, res) => {
  let vid = req.params.vid
  let fid = req.params.fid
  let foodAndExtra = await ordersModel.getFoodAndExtra(vid, fid)
  res.json(foodAndExtra)
})

app.get("/v1/orders/:vid/combination", async (req, res) => {
  let vid = req.params.vid
  let result = await ordersModel.getBaseMainExtraList(vid)
  res.json(result)
})

app.put("/v1/orders/:oid/status/collected", async (req, res) => {
  let oid = req.params.oid
  let [err, result] = await ordersModel.updateOrderStatusToCollected(oid)
  // if (err == "order_status_not_exist") {
  //   res.status(400).json({
  //     message: err
  //   })
  // } else if (err) {
  //   res.status(500).json(err)
  // } else if (result.affectedRows == 0){
  //   res.status(404).send()
  // }else {
  //   res.json(await orderModel.getOrderStatus(oid))
  // }
  res.json(result)
})

app.post("/v1/orders/new", async (req, res) => {
  let { orderList, customerId, vendorId, createdAt, customerMoneyAccountId, totalPrice } = req.body
  //let foods = req.body.foods
  let [err, result] = await ordersModel.postNewOrder(orderList, customerId, vendorId, createdAt, customerMoneyAccountId, totalPrice)
  if (err) res.status(400).send()
  else res.status(200).send()

})

app.get("/v1/customer-main/main", async (req, res) => {
  let result = await customersModel.getApprovedVendor()
  res.json(result)
})

app.get("/v1/orders/:cid/payment-method", async (req, res) => {
  let cid = req.params.cid
  let result = await ordersModel.getPaymentMethod(cid)
  res.json(result)
})
app.post("/testfirebase", async (req, res) => {
  let {test, testmsg, cid} = req.body
  let result = await db.query("select token_firebase from Customers where customer_id = ?", [cid])
  let token = result[0].token_firebase
  x = await sendToFirebase(test, testmsg, token)
  res.status(200).send()
})


app.put('/v1/vendor-main/order/status' , async(req,res) => {
  let order_id = req.body.orderId
  let order_status = req.body.orderStatus
  var currentDate = new Date()
  let cidA = await db.query("select customer_id from Orders where order_id = ?", [order_id])
  let cid = cidA[0].customer_id
  let tokenA = await db.query("select token_firebase from Customers where customer_id = ?", [cid])
  let token = "fns1WiD8_pU:APA91bEC3t2AdJMYbkGuwibNmtZVxGpfhoB6mQO-4_AdyETnZMpuxBtqqxDd3pSp5tu4ntHcKnoWPz2b72w7Tmn7Cu2ElKTPCJl1GolBgYKPZblEHYkKBWnKQnoCJYzjPhapQsxp9sVm"
  //tokenA[0].token_firebase
  if(order_status == "DONE"){
    firebase.sendToFirebase("One of your orders is ready for pick-up.", "Tap here to view order.", token)
    let x = await vendorsModel.assignSlot(order_id, currentDate)
    let [err, result] = await vendorsModel.updateOrderStatus(order_status, order_id)
    setTimeout(async () => {
      x = firebase.sendToFirebase("5 minutes left to pick up your order.", "Tap here to view order.", token)
    },5000)
    setTimeout(async () => {
      let orderStatus = await db.query("select order_status from Orders where order_id = ?", [order_id])
      if(orderStatus != "COLLECTED"){
        vendorsModel.updateOrderStatus("TIMEOUT", order_id)
        x = firebase.sendToFirebase("Your order has expired.", "Tap here to view order.", token)
        
      } 
    },10000)
    if (err) {
        res.status(500).json(err)
      } else if (result.affectedRows == 0){
        res.status(404).send()
      }else {
        res.status(200).send()
      } 
  }

  if(order_status == "CANCELLED"){
    x = firebase.sendToFirebase("One of your orders has been cancelled.", "Tap here to view order.", token)
    let [err, result] = await vendorsModel.updateOrderStatus(order_status ,order_id)
    if (err) {
      res.status(500).json(err)
    } else if (result.affectedRows == 0){
      res.status(404).send()
    }else {
      res.status(200).send()
    } 
  }
  
})





let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
