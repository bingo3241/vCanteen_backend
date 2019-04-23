var express = require('express');
var app = express();
var http = require('http').Server(app);
var moment = require('moment-timezone');
moment.tz.setDefault("Asia/Bangkok");

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const adminModel = require('./models/admin')
const customersModel = require('./models/customers');
const ordersModel = require('./models/orders')
const vendorsModel = require('./models/vendors')
const moneyAccountsModel = require('./models/moneyAccounts')
const paymentModel = require('./models/payment')
const crowdEstimationModel = require('./models/crowdEstimations')

const db = require('./db/db')
const firebase = require('./db/firebase')

const passwordModule = require('./helpers/password');
const mailgun = require('./helpers/email');

const jwt = require('./library/jwt');

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
          mailgun.mailNewPassword(newpassword,email);
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
      var uid = await firebase.getUID(email)
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
        mailgun.mailNewPassword(newpassword,email);
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
  var isInDatabase = await customersModel.isInDatabase(email)
  if(isInDatabase == false) {
    return res.status(404).send()
  }
  var account_type = await customersModel.getAccountType(email)
  if (account_type == 'NORMAL' && isInDatabase == true) {
    res.status(200).send()
  } else if(account_type == 'FACEBOOK' && isInDatabase == true) {
    res.status(409).send()
  } else {
    res.status(404).send()
  }
})

app.put('/v1/user-authentication/vendor/verify/email', async (req, res) => {
  var email = req.body.email
  var isInDatabase = await vendorsModel.isInDatabase(email)
  if(isInDatabase == false) {
    return res.status(404).send()
  }
  var account_type = await vendorsModel.getAccountType(email)
  if (account_type == 'NORMAL' && isInDatabase == true) {
    res.status(200).send()
  } else if(account_type == 'FACEBOOK' && isInDatabase == true) {
    res.status(409).send()
  } else {
    res.status(404).send()
  }
})
app.post('/v1/user-authentication/customer/check/token', async (req,res) => {
  var output = new Object()
  var email = req.body.email
  var password = req.body.password
  var account_type = req.body.account_type
  console.log('Sign-in account type: '+account_type)
  if(await customersModel.isInDatabase(email) == false) {
    if(account_type == 'FACEBOOK') {
      var first_name = req.body.first_name
      var last_name = req.body.last_name
      var url = req.body.profile_url
      await customersModel.insertFacebook(first_name,last_name,email,url)
      await firebase.createUser(email)
      output.status = 'success'
      output.customer_id = await customersModel.getCustomerID(email)
      output.token = jwt.sign(email);
      res.status(200).json(output)
    } else {
      res.status(404).json({status: 'error'})
    }
  } else {
    var in_db = await customersModel.getAccountType(email)
    if(account_type != in_db) {
      console.log('Account type conflicted: input is '+account_type+' but in database is '+in_db)
      return res.status(409).json({status: 'wrong_type'})
    }
    if(account_type == 'FACEBOOK') {
      try {
        await customersModel.insertFirebaseToken(email, firebaseToken)
      } catch (err) {
        console.log('insert firebase token error')
      }
      output.status = 'success'
      output.customer_id = await customersModel.getCustomerID(email)
      output.token = jwt.sign(email)
      res.status(200).json(output)  
    } else if(account_type == 'NORMAL' && await customersModel.NormalAuth(email,password) == true) {
      try {
        await customersModel.insertFirebaseToken(email, firebaseToken)
      } catch (err) {
        console.log('insert firebase token error')
      }
      output.status = 'success'
      output.customer_id = await customersModel.getCustomerID(email)
      output.token = jwt.sign(email)
      res.status(200).json(output)
    } else {
      res.status(404).json({status: 'error'})
    }
  }
})

app.post('/v1/user-authentication/vendor/check/token', async (req,res) => {
  var output = new Object()
  var email = req.body.email
  var password = req.body.password
  var account_type = req.body.account_type
  var firebaseToken = req.body.firebaseToken
  console.log('Sign-in account type: '+account_type)
  if(await vendorsModel.isInDatabase(email) == false) {
    if(account_type == 'FACEBOOK') {
      await vendorsModel.insertFacebook(email)
      await firebase.createUser(email)
      output.status = 'success'
      output.vendor_id = await vendorsModel.getVendorID(email)
      output.vendorToken = jwt.sign(email);
      res.status(200).json(output)
    } else {
      res.status(404).json({status: 'error'})
    }
  } else {
    var in_db = await vendorsModel.getAccountType(email)
    if(account_type != in_db) {
      console.log('Account type conflicted: input is '+account_type+' but in database is '+in_db)
      return res.status(409).json({status: 'wrong_type'})
    }
    if(account_type == 'FACEBOOK') {
      try {
        await vendorsModel.insertFirebaseToken(email, firebaseToken)
      } catch (err) {
        console.log('insert firebase token error')
      }
      output.status = 'success'
      output.vendor_id = await vendorsModel.getVendorID(email)
      output.vendorToken = jwt.sign(email)
      res.status(200).json(output)  
    } else if(account_type == 'NORMAL' && await vendorsModel.NormalAuth(email,password) == true) {
      try {
        await vendorsModel.insertFirebaseToken(email, firebaseToken)
      } catch (err) {
        console.log('insert firebase token error')
      }
      output.status = 'success'
      output.vendor_id = await vendorsModel.getVendorID(email)
      output.vendorToken = jwt.sign(email)
      res.status(200).json(output)
    } else {
      res.status(404).json({status: 'error'})
    }
  }
})

app.post('/v1/user-authentication/customer/verify/token', async (req,res) => {
  let {email, token} = req.body
  if(jwt.verify(token) == false) {
      console.log("Invalid token")
      res.json({expired: true})
  } else if(jwt.verify(token).email != email) {
    console.log("This token was issued for another user")
    res.json({expired: true})
  } else {
      res.json({expired: jwt.isExpired(token)})
  }
})

app.post('/v1/user-authentication/vendor/verify/token', async (req,res) => {
  let {email, token} = req.body
  if(jwt.verify(token) == false) {
      console.log("Invalid token")
      res.json({expired: true})
  } else if(jwt.verify(token).email != email) {
    console.log("This token was issued for another user")
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
  let { orderList, customerId, vendorId, customerMoneyAccountId, totalPrice } = req.body
  let now = new Date()
  let thistime = now.getTime()+7*60*60*1000
  now = new Date(thistime)
  let err = await ordersModel.postNewOrder(orderList, customerId, vendorId, now, customerMoneyAccountId, totalPrice)
  if (err) res.status(400).json(err)
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
  let cancel_reason = req.body.cancelReason
  let now = new Date()
  let thistime = now.getTime()+7*60*60*1000
  let currentDate = new Date(thistime)
  let cidA = await db.query("select customer_id from Orders where order_id = ?", [order_id])
  let cid = cidA[0].customer_id
  console.log(cid)
  let tokenA = await db.query("select token_firebase from Customers where customer_id = ?", [cid])
  let token = tokenA[0].token_firebase
  console.log(token)
  if(order_status == "DONE"){
    firebase.sendToFirebase("One of your orders is ready for pick-up.", "Tap here to view order.", token)
    let x = await vendorsModel.assignSlot(order_id, currentDate)
    console.log(order_id)
    let [err, result] = await vendorsModel.updateCancelReason(order_id,order_status,cancel_reason)
    setTimeout(async () => {
      x = firebase.sendToFirebase("5 minutes left to pick up your order.", "Tap here to view order.", token)
    },10*1000)
    setTimeout(async () => {
      let orderStatusA = await db.query("select order_status from Orders where order_id = ?", [order_id])
      let orderStatus = orderStatusA[0].order_status
      if(orderStatus != "COLLECTED"){
        await vendorsModel.updateCancelReason(order_id,"TIMEOUT",cancel_reason)
        x = firebase.sendToFirebase("Your order has expired.", "Tap here to view order.", token)
        await db.query("UPDATE Orders SET was_at_slot_id = (SELECT slot_id FROM Is_At WHERE order_id = ? ) WHERE order_id = ? ", [order_id,order_id])
        await db.query("DELETE FROM Is_At WHERE order_id = ?", [order_id])       
      } 
    },20*1000)
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
    console.log(order_id)
    let [err, result] = await vendorsModel.updateCancelReason(order_id,order_status,cancel_reason)
    if(err) {
      res.status(500).json(err)
    } else if (result.affectedRows == 0){
      res.status(404).send()
    }else {
      res.status(200).send()
    } 
  }
  
})

app.put('/v1/settings/vendor/orders/cancel-all' , async(req,res) => {
  let vendor_id = req.body.vendorId
  let cancel_reason = req.body.cancelReason
  console.log(vendor_id)
  let x = await vendorsModel.getToken(vendor_id)
  db.query('UPDATE Vendors SET vendor_queuing_time = ? WHERE vendor_id = ?', [0,vendor_id])
  x.forEach(id => {
    firebase.sendToFirebase(cancel_reason, "Tap here to view order.", id.token_firebase)
  }) 
  let[err,result] = await vendorsModel.closeVendor(vendor_id,cancel_reason)
  if (err) {
    res.status(500).json(err)
  } else if (result.affectedRows == 0){
    res.status(404).send()
  }else {
    res.status(200).send()
  } 
})


//--------------------------------------------------------------------------------V2---------------------------------------------------------------------------------

app.post('/v2/user-authentication/admin/signin', async (req,res) => {
  var output = new Object()
  let {email, password} = req.body
  var authed = await adminModel.auth(email, password)
  if(authed) {
    output.status = 'success'
    output.adminId = await adminModel.getAdminID(email)
    output.token = jwt.sign(email)
    res.status(200).json(output)
  } else {
    res.status(404).json({status: 'error'})
  }
})

app.put('/v2/user-authentication/customer/verify/email', async (req,res) => {
  let {email} = req.body
  if(await customersModel.isInDatabase(email) == true) {
    var account_type = await customersModel.getAccountType(email)
    res.status(200).json({accountType: account_type})
  } else {
    res.status(404).send('Email not found')
  }
})

app.put('/v2/user-authentication/customer/verify/facebook', async (req,res) => {
  var output = new Object()
  let {email, firebaseToken} = req.body
  var isInDatabase = await customersModel.isInDatabase(email)
  if(isInDatabase == false) {
    return res.status(404).send('Email not found')
  }
  var account_type = await customersModel.getAccountType(email)
  if(account_type == 'FACEBOOK') {
    await customersModel.updateFirebaseToken(email, firebaseToken)
    output.customerId = customersModel.getCustomerID(email)
    output.accountType = account_type
    output.customerSessionToken = jwt.sign(email)
    res.status(200).json(output)
  } else if(account_type == 'NORMAL'){
    output.accountType = account_type
    res.status(200).json(output)
  }
})

app.post('/v2/user-authentication/customer/signin', async (req,res) => {
  var output = new Object()
  let {email, password, firebaseToken} = req.body
  var authed = await customersModel.NormalAuth(email, password)
  if(authed) {
    await customersModel.updateFirebaseToken(email, firebaseToken)
    output.status = 'success'
    output.customerId = await customersModel.getCustomerID(email)
    output.customerSessionToken = jwt.sign(email)
    res.status(200).json(output)
  } else {
    res.status(404).json({status: 'error'})
  }
})

app.post('/v2/user-authentication/customer/new', async (req,res) => {
  let {email, password, firstname, lastname, customerImage, accountType, serviceProvider, accountNumber, firebaseToken} = req.body
  if(accountType == 'NORMAL') {
    var customerCreated = await customersModel.insertNewCustomer(email, password, firstname, lastname, customerImage, accountType, firebaseToken)
    if(customerCreated == false) {
      return res.status(500).end()
    }
    var moneyAccountCreated = await moneyAccountsModel.createCustomer(serviceProvider, accountNumber)
    if(moneyAccountCreated == false) {
      return res.status(500).end()
    }
    var customer_id = await customersModel.getCustomerID(email)
    var money_account_id = await moneyAccountsModel.getCustomerAccountID(accountNumber)
    var linked = await paymentModel.linkCustomerPayment(customer_id, money_account_id)
    if(linked) {
      var output = new Object()
      output.customerId = customer_id
      output.customerSessionToken = jwt.sign(email)
      res.status(200).json(output)
    } else {
      res.status(500).end()
    }
  } else if(accountType == 'FACEBOOK') {
    var customerCreated = await customersModel.insertNewCustomer(email, 'firebaseOnlyNaja', firstname, lastname, customerImage, accountType, firebaseToken)
    if(customerCreated == false) {
      return res.status(500).end()
    }
    var moneyAccountCreated = await moneyAccountsModel.createCustomer(serviceProvider, accountNumber)
    if(moneyAccountCreated == false) {
      return res.status(500).end()
    }
    var customer_id = await customersModel.getCustomerID(email)
    var money_account_id = await moneyAccountsModel.getCustomerAccountID(accountNumber)
    var linked = await paymentModel.linkCustomerPayment(customer_id, money_account_id)
    if(linked) {
      var output = new Object()
      output.customerId = customer_id
      output.customerSessionToken = jwt.sign(email)
      res.status(200).json(output)
    } else {
      res.status(500).end()
    }
  }
})

app.put('/v2/user-authentication/vendor/verify/email', async (req,res) => {
  let {email} = req.body
  if(await vendorsModel.isInDatabase(email) == true) {
    var account_type = await vendorsModel.getAccountType(email)
    res.status(200).json({accountType: account_type})
  } else {
    res.status(404).send('Email not found')
  }
})

app.put('/v2/user-authentication/vendor/verify/facebook', async (req,res) => {
  var output = new Object()
  let {email, firebaseToken} = req.body
  var isInDatabase = await vendorsModel.isInDatabase(email)
  if(isInDatabase == false) {
    return res.status(404).send('Email not found')
  }
  var account_type = await vendorsModel.getAccountType(email)
  if(account_type == 'FACEBOOK') {
    await vendorsModel.updateFirebaseToken(email, firebaseToken)
    output.vendorId = await vendorsModel.getVendorID(email)
    output.accountType = account_type
    output.vendorSessionToken = jwt.sign(email)
    res.status(200).json(output)
  } else if(account_type == 'NORMAL'){
    output.accountType = account_type
    res.status(200).json(output)
  }
})

app.post('/v2/user-authentication/vendor/signin', async (req,res) => {
  var output = new Object()
  let {email, password, firebaseToken} = req.body
  var authed = await vendorsModel.NormalAuth(email, password)
  if(authed) {
    await vendorsModel.updateFirebaseToken(email, firebaseToken)
    output.vendorId = await vendorsModel.getVendorID(email)
    output.vendorSessionToken = jwt.sign(email)
    res.status(200).json(output)
  } else {
    res.status(409).json({status: 'error'})
  }
})

app.post('/v2/user-authentication/vendor/new', async (req,res) => {
  let {email, password, vendorName, phoneNumber, fourDigitPin, accountType, serviceProvider, accountNumber, firebaseToken} = req.body
  if(accountType == 'NORMAL') {
    var vendorCreated = await vendorsModel.insertNewVendor(email, password, accountType, vendorName, phoneNumber, fourDigitPin, firebaseToken)
    if(vendorCreated == false) {
      return res.status(500).send('Creating Vendor Error')
    }
    var vendor_id = await vendorsModel.getVendorID(email)
    console.log('vendor_id: '+vendor_id)
    var extraInserted = await vendorsModel.preinsertExtra(vendor_id)
    if(extraInserted == false) {
      return res.status(500).send('Insert Food Extra Error')
    }
    var moneyAccountCreated = await moneyAccountsModel.createVendor(serviceProvider, accountNumber)
    if(moneyAccountCreated == false) {
      return res.status(500).send('Creating Vendor Money Account Error')
    }
    var money_account_id = await moneyAccountsModel.getVendorAccountID(accountNumber)
    if(await paymentModel.linkVendorPayment(vendor_id, money_account_id)) {
      var output = new Object()
      output.vendorId = vendor_id
      output.vendorSessionToken = jwt.sign(email)
      res.status(200).json(output)
    } else {
      res.status(500).send('Linking Error')
    }
  } else if(accountType == 'FACEBOOK') {
    var vendorCreated = await vendorsModel.insertNewVendor(email, 'firebaseOnlyNaja', accountType, vendorName, phoneNumber, fourDigitPin, firebaseToken)
    if(vendorCreated == false) {
      return res.status(500).end()
    }
    var vendor_id = await vendorsModel.getVendorID(email)
    var extraInserted = await vendorsModel.preinsertExtra(vendor_id)
    if(extraInserted == false) {
      return res.status(500).end()
    }
    var moneyAccountCreated = await moneyAccountsModel.createVendor(serviceProvider, accountNumber)
    if(moneyAccountCreated == false) {
      return res.status(500).end()
    }
    var money_account_id = await moneyAccountsModel.getVendorAccountID(accountNumber)
    var linked = await paymentModel.linkVendorPayment(vendor_id, money_account_id)
    if(linked) {
      var output = new Object()
      output.vendorId = vendor_id
      output.vendorSessionToken = jwt.sign(email)
      res.status(200).json(output)
    } else {
      res.status(500).end()
    }
  }
})

app.post('/v2/settings/customer/report', async (req,res) => {
  let {customerId, message} = req.body
  let now = new Date()
  let thistime = now.getTime()+7*60*60*1000
  let currentDate = new Date(thistime)
  console.log('customerId: '+customerId+' created a report')
  let success = await customersModel.sendReport(customerId, message, currentDate)
  if(success) {
    var customer_email = await customersModel.getCustomerEmail(customerId)
    var customer_name = await customersModel.getCustomerFullname(customerId)
    mailgun.mailReport('Customer', customer_name, customer_email, message)
    res.status(200).send('Report sent')
  } else {
    res.status(500).send('Error')
  }
})

app.post('/v2/settings/vendor/report', async (req,res) => {
  let {vendorId, message} = req.body
  let success = await vendorsModel.sendReport(vendorId, message)
  if(success) {
    var vendor_email = await vendorsModel.getVendorEmail(vendorId)
    var restaurant_name = await vendorsModel.getVendorName(vendorId)
    mailgun.mailReport('Vendor', restaurant_name, vendor_email, message)
    res.status(200).send('Report sent')
  } else {
    res.status(500).send('Error')
  }
})

app.post('/v2/payments/customer/link', async (req,res) => {
  let {customerId, serviceProvider, accountNumber} = req.body
  var createdMoneyAccount = await moneyAccountsModel.createCustomer(serviceProvider, accountNumber)
  if(createdMoneyAccount == false) {
    res.status(500).send('Creating Customer Money Account Error')
  }
  var money_account_id = await moneyAccountsModel.getCustomerAccountID(accountNumber)
  if(await paymentModel.linkCustomerPayment(customerId, money_account_id)) {
    res.status(200).send('Linking Completed')
  } else {
    res.status(500).send('Linking Error')
  }
})

app.delete('/v2/payments/customer/:customerId/:customerMoneyAccountId', async (req,res) => {
  var customer_id = req.params.customerId
  var money_account_id = req.params.customerMoneyAccountId
  if(await paymentModel.unlinkCustomerPayment(customer_id, money_account_id)) {
    res.status(200).send('Unlinked')
  } else {
    res.status(500).send('Unlinking Error')
  }
})

app.post('/v2/payments/vendor/link', async (req,res) => {
  let {vendorId, serviceProvider, accountNumber} = req.body
  var createdMoneyAccount = await moneyAccountsModel.createVendor(serviceProvider, accountNumber)
  if(createdMoneyAccount == false) {
    res.status(500).send('Creating Vendor Money Account Error')
  }
  var money_account_id = await moneyAccountsModel.getVendorAccountID(accountNumber)
  if(await paymentModel.linkVendorPayment(vendorId, money_account_id)) {
    res.status(200).send('Linking Completed')
  } else {
    res.status(500).send('Linking Error')
  }
})

app.delete('/v2/payments/vendor/:vendorId/:vendorMoneyAccountId', async (req,res) => {
  var vendor_id = req.params.vendorId
  var money_account_id = req.params.vendorMoneyAccountId
  if(await paymentModel.unlinkVendorPayment(vendor_id, money_account_id)) {
    res.status(200).send('Unlinked')
  } else {
    res.status(500).send('Unlinking Error')
  }
})

app.get('/v2/payments/:vendorId/payment-method', async (req,res) => {
  var vendor_id = req.params.vendorId
  res.status(200).json({availablePaymentMethod: await paymentModel.getVendorPaymentMethod(vendor_id)})
})



app.get('/v2/orders/all-vendors' , async(req,res) => {
  let result = await customersModel.getVendor()
  if(result == false) {
    res.status(404).send()
  } else {
    res.json({"vendorList":result})
  }
})



app.put("/v2/admin-main/vendor/permission", async(req,res) => {
      let vendor_id = req.body.vendorId
      let admin_permission = req.body.adminPermission
      let [err,result]= await adminModel.changeVendorPermission(vendor_id,admin_permission)
      if (err) {
        res.status(500).json(err)
      } else if (result.affectedRows == 0){
        res.status(404).send()
      }else {
        res.json(result)
      } 
})

app.get('/v2/admin-main/main' , async(req,res) => {
  let result = await adminModel.getVendor()
  if (result == false) {
    res.status(404).send()
  } else {
    res.json({"vendorList": result})
  }
})

app.get('/v2/orders/:orderId/cancellation-reason' , async(req,res) => {
  let order_id = req.params.orderId
  let result = await ordersModel.getCancelReason(order_id)
  if (result == false) {
    res.status(404).send()
  } else {
    res.json({"cancelReason": result})
  }
})

app.post("/v2/orders/customer/rating", async (req, res) => {
  let {customerId, orderId, score, comment} = req.body
  let now = new Date()
  let thistime = now.getTime()+7*60*60*1000
  let currentDate = new Date(thistime)
  let err = await customersModel.reviewVendorV2(customerId, orderId, score, comment, currentDate)
  if (err) {
    res.status(400).send()
  }else res.status(200).send()
})

app.get("/v2/orders/:vid/menu", async (req, res) => {                     
  let vid = req.params.vid
  let result = await ordersModel.getVendorMenuV2(vid)
  res.json(result)
})

app.get("/v2/menu-management/:vid/menu/:fid", async (req, res) => {
  res.json(await vendorsModel.getFoodByIdV2(req.params.fid))
})

app.get("/v2/settings/:vid/info/reviews", async (req,res) => {   //tested
  res.json(await vendorsModel.getReviewV2(req.params.vid))
})

app.get("/v2/settings/:vid/info", async (req, res) => {   //tested
  res.json(await vendorsModel.getVendorInfoV2(req.params.vid))
})

app.get("/v2/orders/customers/:cid/in-progress", async (req, res) => { //tested
  res.json(await ordersModel.getInProgressV2(req.params.cid))
})
app.get('/v2/orders/customers/:customerId/history', async (req, res) => { //tested
  var customerId = req.params.customerId;
  res.status(200).json(await ordersModel.getHistoryV2(customerId))
})

app.put("/v2/user-authentication/verify/pin", async (req, res) => { //tested
  let {vendorId, fourDigitPin} = req.body
  let result = await vendorsModel.verifyPinV2(vendorId, fourDigitPin)
  if (result) res.status(200).send()
  else res.status(404).send()
})

app.put("/v2/user-authentication/vendor/pin", async (req, res) => { //tested
  let {vendorId, fourDigitPin} = req.body
  let result = await vendorsModel.editPinV2(vendorId, fourDigitPin)
  if (result.affectedRows == 1) res.status(200).send()
  else res.status(400).send()
})

app.put("/v2/menu-management/menu", async (req, res) => {  
  let {vendorId, foodId, foodName, foodPrice, foodStatus, foodType, foodImage, prepareDuration, categoryName} = req.body
  let err = await vendorsModel.editMenuV2(vendorId, foodId, foodName, foodPrice, foodStatus, foodType, foodImage, categoryName, prepareDuration)
  if(err) res.json(err)
  else res.status(200).send()
})
 
app.post("/v2/menu-management/menu", async (req, res) => {  
  let {vendorId, foodName, price, foodStatus, foodType, foodImage, prepareDuration, categoryName} = req.body
  let [result, err] = await vendorsModel.addMenuV2(vendorId, foodName, price, foodStatus, foodType, foodImage, categoryName, prepareDuration)
  if (err) res.status(400).send()
  else res.json({foodId:result.insertId})
})

app.put("/v2/profile-management/customer/profile", async (req, res) => {
  let {customerId, firstname, lastname, email, profileImage} = req.body
  let result = await customersModel.editProfileV2(customerId, firstname, lastname, email, profileImage)
  if (result.affectedRows == 1) res.status(200).send()
  else res.status(400).send()
})

app.put("/v2/profile-management/vendor/profile", async (req, res) => {
  let {vendorId, restaurantName, email} = req.body
  let result = await vendorsModel.editProfileV2(vendorId, restaurantName, email)
  if (result.affectedRows == 1) res.status(200).send()
  else res.status(400).send()
})

app.put("/v2/profile-management/vendor/image", async (req, res) => {
  let {vendorId, vendorImage} = req.body
  let result = await vendorsModel.editProfileImgV2(vendorId, vendorImage)
  if (result.affectedRows == 1) res.status(200).send()
  else res.status(400).send()
})

app.put('/v2/vendor-main/order/status' , async(req,res) => {
  let order_id = req.body.orderId
  let order_status = req.body.orderStatus
  let cancel_reason = req.body.cancelReason
  let now = new Date()
  let thistime = now.getTime()+7*60*60*1000
  let currentDate = new Date(thistime)
  let cidA = await db.query("select customer_id from Orders where order_id = ?", [order_id])
  let cid = cidA[0].customer_id
  console.log(cid)
  let tokenA = await db.query("select token_firebase from Customers where customer_id = ?", [cid])
  let token = tokenA[0].token_firebase
  console.log(token)
  if(order_status == "DONE"){
    firebase.sendToFirebase("One of your orders is ready for pick-up.", "Tap here to view order.", token)
    let x = await vendorsModel.assignSlot(order_id, currentDate)
    let y = await db.query('SELECT CEILING(vendor_queuing_time/60) as v FROM Vendors WHERE vendor_id = (SELECT vendor_id from Orders WHERE order_id = ?)', [order_id])
    let z = await db.query('SELECT CEILING(order_prepare_duration/60) as o FROM Orders WHERE order_id = ?',[order_id])
    let a = y[0].v
    let b = z[0].o
    console.log(a-b)
    console.log(order_id)
    await db.query('UPDATE Vendors SET vendor_queuing_time = ? WHERE vendor_id = (SELECT vendor_id from Orders WHERE order_id = ?)', [a-b,order_id])
    let [err, result] = await vendorsModel.updateCancelReason(order_id,order_status,cancel_reason)
    setTimeout(async () => {
      x = firebase.sendToFirebase("5 minutes left to pick up your order.", "Tap here to view order.", token)
    },30*1000)
    setTimeout(async () => {
      let orderStatusA = await db.query("select order_status from Orders where order_id = ?", [order_id])
      let orderStatus = orderStatusA[0].order_status
      if(orderStatus != "COLLECTED"){
        await vendorsModel.updateCancelReason(order_id,"TIMEOUT",cancel_reason)
        x = firebase.sendToFirebase("Your order has expired.", "Tap here to view order.", token)
        await db.query("UPDATE Orders SET was_at_slot_id = (SELECT slot_id FROM Is_At WHERE order_id = ? ) WHERE order_id = ? ", [order_id,order_id])
        await db.query("DELETE FROM Is_At WHERE order_id = ?", [order_id])       
      } 
    },50*1000)
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
    let y = await db.query('SELECT vendor_queuing_time as v FROM Vendors WHERE vendor_id = (SELECT vendor_id from Orders WHERE order_id = ?)', [order_id])
    let z = await db.query('SELECT order_prepare_duration as o FROM Orders WHERE order_id = ?',[order_id])
    let a = y[0].v
    let b = z[0].o
    await db.query('UPDATE Vendors SET vendor_queuing_time = ? WHERE vendor_id = (SELECT vendor_id from Orders WHERE order_id = ?)', [a-b,order_id])
    console.log(order_id)
    let [err, result] = await vendorsModel.updateCancelReason(order_id,order_status,cancel_reason)
    if(err) {
      res.status(500).json(err)
    } else if (result.affectedRows == 0){
      res.status(404).send()
    }else {
      res.status(200).send()
    } 
  }
  
})

app.get("/v2/orders/:oid/slot-old", async (req, res) => {
  res.json(await ordersModel.getSlotIdV2(req.params.oid))
})

app.get("/v2/menu-management/:vid/menu", async (req, res) => {
  res.json(await ordersModel.getListV2(req.params.vid))
})

app.post('/v2/user-authentication/admin/verify/token', async (req,res) => {
  let {email, token} = req.body
  if(jwt.verify(token) == false) {
      console.log("Invalid token")
      res.json({expired: true})
  } else if(jwt.verify(token).email != email) {
    console.log("This token was issued for another user")
    res.json({expired: true})
  } else {
      res.json({expired: jwt.isExpired(token)})
  }
})
app.get('/v2/customer-main/:customerId/home' , async(req,res) => {
  let customer_id = req.params.customerId
  let result = { customer: await customersModel.getCusInfo(customer_id), percentDensity: await customersModel.getDensity(),recommend: await customersModel.getRecommend()}
  if(result.customer == false && result.percentDensity == false && result.recommend == false) {
    res.status(404).send()
  } else {
    res.json(result)
  }
})

app.get('/v2/crowd-estimation/current', async (req,res) => {
  let result = await crowdEstimationModel.getLatestRecord()
  if(result == false) {
    res.status(404).end()
  } else {
    res.status(200).json(result)
  }
})

app.get('/v2/crowd-estimation/current/all', async (req,res) => {
  let result1 = await crowdEstimationModel.getLatestRecord()
  let latestDay = await crowdEstimationModel.getDayOfLatestRecord()
  let result2 = await crowdEstimationModel.getHourlyStat(latestDay)
  if(result1 == false || result2 == false) {
    res.status(404).end()
  } else {
    var output = new Object()
    output.percentDensity = result1.percentDensity
    output.latestTime = result1.latestTime
    output.hourlyCrowdStat = result2
    res.status(200).json(output)
  }
})

app.get('/v2/crowd-estimation/:day', async (req,res) => {
  return res.status(200).json(await crowdEstimationModel.getHourlyStat(req.params.day))
})

app.post('/v2/crowd-estimation/prediction', async (req,res) => {
  let {created_at, percent_density} = req.body
  var inserted = await crowdEstimationModel.insertRecord(created_at, percent_density)
  if(inserted) {
    res.status(200).end()
  } else {
    res.status(500).end()
  }
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
