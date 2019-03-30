var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const customerModel = require('./models/customer');
const vendorModel = require('./models/vendor');

app.put('/v1/user-authentication/customer/password/change' , async (req,res) => {
    var customer_id = req.body.customerId;
    console.log(customer_id);
    var pwd = req.body.passwordNew;
    console.log(pwd);
    let [err, result] = await customerModel.changePasswords(pwd,customer_id)
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

app.get('/v1/menu-management/:vendorId/menu/' , async (req,res) => {
    let vendor_id = req.params.vendorId
    const x = await vendorModel.getCombMenu(vendor_id)
    const y = await vendorModel.getAlaMenu(vendor_id)
    const result = {combinationList: await x ,alacarteList: await y }
    if (result.combinationList == false && result.alacarteList == false) {
      res.status(404).send()
    }else {
      res.json(result)
    }     
})

app.get('/v1/vendor-main/:vendorId/orders' , async(req,res) => {
  let vendor_id = req.params.vendorId
  let result = {orderList : await vendorModel.getOrder(vendor_id)}
  if (result.orderList == false) {
    res.status(404).send()
  }else {
    res.json(result)
  } 
})

app.get('/v1/settings/:vendorId/info' , async(req,res) => {
  let vendor_id = req.params.vendorId
  //console.log(vendor_id)
  let result = { vendorinfo : await vendorModel.getVendorInfo(vendor_id) , vendorPaymentMethod : await vendorModel.getProvider(vendor_id)}
  if (result.vendorinfo == false) {
    res.status(404).send()
  }else {
    res.json(result)
  } 
})

app.put('/v1/menu-management/vendorId/menu/foodId' , async(req,res) => {
  let {vendor_id,food_id,food_name,food_price,food_status,food_type,food_image} = req.body
  //console.log(vendor_id,food_id,food_name,food_price,food_status,food_type,food_image)
  let [err,result] = await vendorModel.editMenu(vendor_id,food_id,food_name,food_price,food_status,food_type,food_image)
  if (err) {
    res.status(500).json(err)
  } else if (result.affectedRows == 0){
    res.status(404).send()
  }else {
    res.status(200).send()
  }
})

app.post('/v1/menu-management/vendorId/menu', async(req,res) => {
  let {vendor_id,food_name,food_price,food_status,food_type,food_image} = req.body
  let [err,insertId] = await vendorModel.createMenu(vendor_id,food_name,food_price,food_status,food_type,food_image)
  if (err) {
     res.status(500).json(err)
   } else {
     res.status(200).json({food_id : insertId})
   }
})

app.get('/v1/menu-management/:vendorId/menu/:foodId' , async (req,res) => {
  let vendor_id = req.params.vendorId
  let food_id = req.params.foodId
  const result = await vendorModel.getMenu(vendor_id,food_id)
  if (result == false) {
    res.status(404).send()
  }else {
    res.json(result)
  }     
})

app.delete('/v1/menu-management/vendorId/menu/foodId' , async (req,res) => {
  let vendor_id = req.body.vendor_id
  let food_id = req.body.food_id
  let [err, result] = await vendorModel.delMenu(vendor_id,food_id)
  if (err) {
    res.status(500).json(err)
  } else if (result.affectedRows == 0){
    res.status(404).send()
  }else {
    res.status(200).send()
  }
})

app.put('/v1/settings/vendorId/status' , async(req,res) => {
  let vendor_id = req.body.vendor_id
  let vendor_status = req.body.vendor_status
  let [err,result] = await vendorModel.updateVendorStatus(vendor_id,vendor_status)
  if (err) {
    res.status(500).json(err)
  } else if (result.affectedRows == 0){
    res.status(404).send()
  }else {
    res.status(200).send()
  }
})

app.put('/v1/menu-management/vendorId/menu/foodId/status' , async(req,res) => {
  let vendor_id = req.body.vendor_id
  let x = req.body.menuList
  let menu = []
  for(var i in x){
    menu.push(x[i])
  }
  // x.forEach(food =>{
  //   menu.push(food)
  // })
  //console.log(menu[0])
  let y = await vendorModel.editMenuStatus(vendor_id,menu)    
  if (y == false) {
    res.status(200).send()
  }else if (y[0] == -1) {
    res.status(500).send(y[1])
  }else{
    res.status(404).send({foodId : y})
  }
})


app.get('/x' , async(req,res) => {
 let x = await vendorModel.getTime()
 console.log(x)
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