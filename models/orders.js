const db = require('../db/db');

async function getSaleRecords(vendorId) {
    var output = new Object() 
    output.order = await db.query("SELECT Orders.order_id AS orderId, Orders.order_name AS orderName, Orders.order_name_extra AS orderNameExtra, Orders.order_price AS orderPrice "+
                                "FROM Orders "+
                                "WHERE Orders.vendor_id = ? AND (Orders.order_status = 'COLLECTED' OR Orders.order_status = 'DONE' OR Orders.order_status = 'TIMEOUT') AND DATE(Orders.created_at) = CURDATE()", [vendorId])
    
    var temp = await db.query(  "SELECT order_name AS orderName, COUNT(order_name) AS amount "+
                                "FROM Orders "+
                                "WHERE DATE(created_at) = curdate() AND vendor_id = ? "+
                                "GROUP BY order_name "+
                                "ORDER BY COUNT(order_name) DESC "+
                                "LIMIT 1", [vendorId])

    output.bestSeller = temp[0]
    temp2 = await db.query("SELECT SUM(order_price) AS sum "+
                                            "FROM Orders "+
                                            "WHERE DATE(created_at) = curdate() AND vendor_id = ?",[vendorId])
    
    output.totalDailySales = {
        sum: Number(temp2[0].sum)
    }
    return output
    
}

function getInProgress(customerId) {
  return db.query("SELECT Orders.order_id AS orderId, Orders.order_name AS orderName, Orders.order_name_extra AS orderNameExtra, Food.food_image AS foodImage, Orders.order_price AS orderPrice, Vendors.restaurant_name AS restaurantName, Vendors.restaurant_number AS restaurantNumber, Orders.order_status AS orderStatus,  DATE_FORMAT(Orders.created_at, '%d/%m/%Y %H:%i') AS createdAt "+
                "FROM Orders, Contains, Food, Vendors "+
                "WHERE Orders.order_id = Contains.order_id AND Food.food_id = Contains.food_id AND Orders.customer_id = ? AND Orders.vendor_id = Vendors.vendor_id AND (Orders.order_status = 'COOKING' OR Orders.order_status = 'DONE') AND (Food.food_type = 'ALACARTE' OR Food.food_type = 'COMBINATION_MAIN') "+
                "ORDER BY Orders.order_id", [customerId])
}

function getHistory(customerId) {
  return db.query("SELECT Orders.order_id AS orderId , Orders.order_name AS orderName, Orders.order_name_extra AS orderNameExtra, Food.food_image AS foodImage, Orders.order_price AS orderPrice, Vendors.restaurant_name AS restaurantName, Vendors.restaurant_number AS restaurantNumber, Orders.order_status AS orderStatus,  DATE_FORMAT(Orders.created_at, '%d/%m/%Y %H:%i') AS createdAt "+
                "FROM Orders, Contains, Food, Vendors "+
                "WHERE Orders.order_id = Contains.order_id AND Food.food_id = Contains.food_id AND Orders.customer_id = ? AND Orders.vendor_id = Vendors.vendor_id AND (Orders.order_status = 'CANCELLED' OR Orders.order_status = 'TIMEOUT' OR Orders.order_status = 'COLLECTED') AND (Food.food_type = 'ALACARTE' OR Food.food_type = 'COMBINATION_MAIN') "+
                "ORDER BY Orders.order_id", [customerId])
    
}

async function updateOrderStatusToCollected(id) {
    try {
        let result = await db.query("update Orders set order_status = 'COLLECTED', was_at_slot_id = (select slot_id from Is_At where order_id =?) where order_id = ? and order_status = 'DONE'", [id, id])
        let del = await db.query("delete from Is_At where order_id = ?", [id])
        return [null, result]
    }
    catch (err) {
        return [err, null]
    }
}

async function getOrderStatus(id) {
    let orderStatus = await db.query("select * from Orders where order_id = ?", [id])
    return orderStatus.length == 1 ? orderStatus[0] : null
}

async function getSlotNo(id) {
    let slotNo = await db.query("select slot_id as slotID from Is_At where order_id = ?", [id])
    return slotNo.length == 1 ? slotNo[0] : null
}

async function getVendorMenu(vid) {
    let minBasePrice = 999999999
    let minMainPrice = 999999999
    let minCombinationPrice = 0
    let availist = []
    let soldoutlist = []
    let hasCombination = true
    let vendor = await db.query("select restaurant_number as restaurantNumber, restaurant_name as restaurantName from Vendors where vendor_id = ?", [vid])  //need to add select vendor_image b4 deploy
    let menulist = await db.query("select * from Food where vendor_id = ? and food_type != 'alacarte'", [vid])
    let foodlist = await db.query("select * from Food where vendor_id = ? and food_type = 'alacarte'", [vid])
    menulist.forEach(menu => {
        if (menu.food_type === "COMBINATION_BASE") {
            if (menu.food_price < minBasePrice) minBasePrice = menu.food_price
        }
        if (menu.food_type === "COMBINATION_MAIN") {
            if (menu.food_price < minMainPrice) minMainPrice = menu.food_price
        }
    })
    foodlist.forEach(food => {
        const {food_id,food_name,food_price} = food
        if (food.food_status == "AVAILABLE") {
          availist.push({foodId:food_id,foodName:food_name,foodPrice:food_price})
        }
        if (food.food_status == "SOLD_OUT") {
          soldoutlist.push({foodId:food_id,foodName:food_name,foodPrice:food_price})
        }
    })    
    minCombinationPrice = minBasePrice+minMainPrice
    if (minBasePrice == 999999999 || minMainPrice == 999999999) {
        minCombinationPrice = null
        hasCombination = false
    }
    let response = {"vendor" : vendor[0], "availableList": availist, "soldOutList" : soldoutlist, "hasCombination" : hasCombination, "minCombinationPrice" : minCombinationPrice}
    return response
}

async function getFoodAndExtra(vid, fid) {
  let food = await db.query("select food_id as foodId, food_name as foodName, food_price as foodPrice from Food where food_id =?", [fid])
  let extraList = await db.query("select food_id as foodId, food_name as foodName, food_price as foodPrice, food_status as foodStatus from Food where food_type = 'EXTRA' and vendor_id = ?", [vid])
  let response = {"food" : food[0], "extralist" : extraList}
  return response
}

async function getBaseMainExtraList(vid) {
  let foodlist = await db.query("select food_id, food_name, food_price, food_status, food_type from Food where vendor_id = ? and food_type != 'ALACARTE'", [vid])
  let baselist = []
  let mainlist = []
  let extralist = []
  foodlist.forEach(menu => {
      const {food_id,food_name,food_price,food_status,food_type} = menu
      if (menu.food_type == "COMBINATION_BASE") {
          baselist.push({foodId:food_id,foodName:food_name,foodPrice:food_price,foodStatus:food_status,foodType:food_type})
      }
      if (menu.food_type == "COMBINATION_MAIN") {
          mainlist.push({foodId:food_id,foodName:food_name,foodPrice:food_price,foodStatus:food_status,foodType:food_type})
      }
      if (menu.food_type == "EXTRA") {
          extralist.push({foodId:food_id,foodName:food_name,foodPrice:food_price,foodStatus:food_status,foodType:food_type})
      }
  })
  let response = {"baseList" : baselist, "mainList" : mainlist, "extraList" : extralist}
  return response
}

async function postNewOrder(orderList, customerId, vendorId, createdAt, customerMoneyAccountId, totalPrice) {
    try {
    let vendorAcc = await db.query("select vm.balance, vm.money_account_id as moneyAccId from VendorMoneyAccounts vm join Vendor_Links vl on vm.money_account_id = vl.money_account_id where vl.vendor_id = ?",[vendorId])
    let custAcc = await db.query("select balance, money_account_id as moneyAccId from CustomerMoneyAccounts where money_account_id = ?", [customerMoneyAccountId])
    custAcc[0].balance -= totalPrice
    vendorAcc[0].balance += totalPrice
    await db.query("update CustomerMoneyAccounts set balance = ? where money_account_id = ?", [custAcc[0].balance, customerMoneyAccountId])
    await db.query("update VendorMoneyAccounts set balance = ? where money_account_id = ?", [vendorAcc[0].balance, vendorAcc[0].moneyAccId])
    let transacResult = await db.query("insert into Transactions(created_at, customer_money_account_id, vendor_money_account_id) values (?, ?, ?)", [createdAt, customerMoneyAccountId, vendorAcc[0].moneyAccId])
    await orderList.forEach(async order => {
        let fids = []
        let esttime = 0
        let {orderPrice, orderName, orderNameExtra, foodList} = order
        foodList.forEach(food => {
            fids.push(food.foodId)
        })
        for (let i = 0; i<foodList.length;i++)  {
            let time = await db.query("select prepare_duration from Food where food_id =?", [foodList[i].foodId])
            esttime += time[0].prepare_duration
            console.log("time = "+time+" est = "+esttime)
        }
        let orderResult = await db.query("insert into Orders(order_name, order_name_extra, order_status, order_price, customer_id, created_at, vendor_id, transaction_id, order_prepare_duration) values (?, ?, 'COOKING', ?, ?, ?, ?, ?, ?)", [orderName, orderNameExtra, orderPrice, customerId, createdAt, vendorId, transacResult.insertId, esttime])
        let returnres = {"orderId" : orderResult.insertId, "orderName" : orderName, "orderNameExtra" : orderNameExtra, "orderStatus" : "COOKING"}
        console.log(returnres)
        fids.forEach(fid => {
            db.query("insert into Contains(order_id, food_id) values (?, ?)", [orderResult.insertId, fid])
        })
      
    })
    return null
    } catch (err){
        return err
    }
}

async function getPaymentMethod (cid) {
    let paymentMethod = await db.query("select a.money_account_id as customerMoneyAccountId, a.service_provider as serviceProvider from Customer_Links l join CustomerMoneyAccounts a on l.money_account_id = a.money_account_id where l.customer_id = ?", [cid])
    let response = {"availablePaymentMethod" : paymentMethod}
    return response
}

async function getVendorMenuV2(vid) {
    let minBasePrice = 999999999
    let minMainPrice = 999999999
    let minCombinationPrice = 0
    let availist = []
    let soldoutlist = []
    let hasCombination = true
    let vendor = await db.query("select restaurant_name as restaurantName, vendor_image as vendorImage from Vendors where vendor_id = ?", [vid])  //need to add select vendor_image b4 deploy
    let combilist = await db.query("select * from Food where vendor_id = ? and food_type != 'alacarte'", [vid])
    let alaclist = await db.query("select f.food_price, f.food_name, f.food_id, f.prepare_duration, c.catagory_name from Food f join Classifies cl join Catagories c on f.food_id = cl.food_id and cl.catagory_id = c.catagory_id where vendor_id = ? and food_type = 'alacarte'", [vid])
    combilist.forEach(menu => {
        if (menu.food_type === "COMBINATION_BASE") {
            if (menu.food_price < minBasePrice) minBasePrice = menu.food_price
        }
        if (menu.food_type === "COMBINATION_MAIN") {
            if (menu.food_price < minMainPrice) minMainPrice = menu.food_price
        }
    })
    alaclist.forEach(food => {
        const {food_id,food_name,food_price,catagory_name} = food
        let timetakes = Math.ceil(food.prepare_duration/60)
        if (food.food_status == "AVAILABLE") {
          availist.push({foodId:food_id,foodName:food_name,foodPrice:food_price,catagory:catagory_name,prepareDuration:timetakes})
        }
        if (food.food_status == "SOLD_OUT") {
          soldoutlist.push({foodId:food_id,foodName:food_name,foodPrice:food_price,catagory:catagory_name,prepareDuration:timetakes})
        }
    })    
    minCombinationPrice = minBasePrice+minMainPrice
    if (minBasePrice == 999999999 || minMainPrice == 999999999) {
        minCombinationPrice = null
        hasCombination = false
    }
    let response = {"vendor" : vendor[0], "availableList": availist, "soldOutList" : soldoutlist, "hasCombination" : hasCombination, "minCombinationPrice" : minCombinationPrice}
    return response
}

async function getInProgressV2(customerId) {
    let inproglist = await db.query("SELECT Orders.order_id AS orderId, Orders.order_name AS orderName, Orders.order_name_extra AS orderNameExtra, Food.food_image AS foodImage, Orders.order_price AS orderPrice, Vendors.restaurant_name AS restaurantName, Orders.order_status AS orderStatus, Orders.order_prepare_duration, Vendors.vendor_queuing_time, DATE_FORMAT(Orders.created_at, '%d/%m/%Y %H:%i') AS createdAt "+
                    "FROM Orders, Contains, Food, Vendors "+
                    "WHERE Orders.order_id = Contains.order_id AND Food.food_id = Contains.food_id AND Orders.customer_id = ? AND Orders.vendor_id = Vendors.vendor_id AND (Orders.order_status = 'COOKING' OR Orders.order_status = 'DONE') AND (Food.food_type = 'ALACARTE' OR Food.food_type = 'COMBINATION_MAIN') "+
                    "ORDER BY Orders.order_id", [customerId])
    let res = []
    for (let i = 0; i<inproglist.length; i++) {
        if (inproglist[i].orderStatus == "COOKING") {
            let waittime = await db.query("select sum(order_prepare_duration) as time from Orders where order_id <= ?", [inproglist[i].orderId])
            res.push({"orderId": inproglist[i].orderId, "orderName": inproglist[i].orderName, "orderNameExtra": inproglist[i].orderNameExtra, "orderPrice": inproglist[i].orderPrice, "restaurantName": inproglist[i].restaurantName, "orderStatus": inproglist[i].orderStatus, "createdAt" : inproglist[i].createdAt, "orderEstimatedTime": Math.ceil(waittime[0].time/60)})

        }else res.push({"orderId": inproglist[i].orderId, "orderName": inproglist[i].orderName, "orderNameExtra": inproglist[i].orderNameExtra, "orderPrice": inproglist[i].orderPrice, "restaurantName": inproglist[i].restaurantName, "orderStatus": inproglist[i].orderStatus, "createdAt" : inproglist[i].createdAt, "orderEstimatedTime": 0})
    }
    return res             
}
  
async function getHistoryV2(customerId) {
    let histres = await db.query("select o.order_id, o.order_name, o.order_name_extra, o.order_price, v.restaurant_name, o.order_status, o.created_at, r.created_at as reviewed_at from Orders o join Reviews r join Vendors v on o.order_id = r.order_id and v.vendor_id = o.vendor_id where o.customer_id = ? and (o.order_status = 'TIMEOUT' or o.order_status = 'CANCELLED' or o.order_status = 'COLLECTED') order by o.order_id", [customerId])
    console.log(histres)
    let finalres = []
    histres.forEach(res => {
        if (res.reviewed_at == null) {
            finalres.push({"orderId" : res.order_id, "orderName" : res.order_name, "orderNmaeExtra" : res.order_name_extra, "orderPrice" : res.orde_price, "restaurantName" : res.restaurant_name, "orderStatus" : res.order_status, "createdAt" : res.created_at, "hasRated" : false})
        }else {
            finalres.push({"orderId" : res.order_id, "orderName" : res.order_name, "orderNmaeExtra" : res.order_name_extra, "orderPrice" : res.orde_price, "restaurantName" : res.restaurant_name, "orderStatus" : res.order_status, "createdAt" : res.created_at, "hasRated" : true})
        }
    })
    return finalres
}

module.exports = {
  // getSaleRecord,
  getInProgress,
  getHistory,
  updateOrderStatusToCollected,
  getOrderStatus,
  getSlotNo,
  getVendorMenu,
  getFoodAndExtra,
  getBaseMainExtraList,
  postNewOrder,
  getSaleRecords,
  getPaymentMethod,
  getVendorMenuV2,
  getInProgressV2,
  getHistoryV2,
}
