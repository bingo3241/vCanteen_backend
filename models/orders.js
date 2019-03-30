const db = require('../db/db');

// async function getSaleRecord(vendorId) {
//     let orders = db.query("select distinct orders.order_id from orders, contain, food where orders.order_id = contain.order_id AND food.food_id = contain.food_id AND (Orders.order_status = 'DONE' or Orders.order_status = 'COLLECTED' or Orders.order_status = 'TIMEOUT') AND orders.vendor_id = ?", [vendorId]);
//     let currentOrderID = null;
//     let allFoodType = ['ALARCATE','COMBINATION_BASE','COMBINATION_MAIN','COMBINATION_EXTRA'];

//     orders.forEach(({orderID,foodName,foodType}) => {
//       if(!tempMap[foodName]){
//         tempMap[foodName] = foodType;
//       }
//       if(currentOrderID !== orderID){
//       currentOrderID = orderID;
//         output.push({orderID,foodName});
//       }else{
//         const target = output.length - 1;
//         output[target].foodName = output[target].foodName + ', ' + foodName 
//       }
//     })

//     const finalOutput = output.map((element) => { 
//       const {foodName} = element;
//       const splittedFood = foodName.split(',');
//       const sorted = splittedFood.sort((current,next) => {
//         const scurrent = current.trim();
//         const snext = next.trim();
//         const currentFoodType = tempMap[scurrent];
//         const nextFoodType = tempMap[snext];
//         return allFoodType.indexOf(currentFoodType) > allFoodType.indexOf(nextFoodType);
//       });
//       return {...element,foodName:sorted.join()};
//     })

//     return finalOutput;
   
// }

async function getMenuItems(customerId) {
  // var inProgress = [];
  // var temp = await db.query("SELECT DISTINCT Orders.order_id, Orders.order_name, Orders.order_name_extra, Orders.order_price, Vendors.restaurant_name, Vendors.restaurant_number, Orders.order_status, Orders.created_at "+
  //                           "FROM Orders, Contains, Food, Vendors "+
  //                           "WHERE Orders.order_id = Contains.order_id AND Food.food_id = Contains.food_id AND Orders.customer_id = ? AND Orders.vendor_id = Vendors.vendor_id AND (Orders.order_status = 'DONE' OR Orders.order_status = 'COOKING')", [customerId])
  // temp.forEach(({order_id,order_name,order_name_extra,food_image,order_price,restaurant_name,order_status,created_at}) => {
  //     var temp2 = db.query("SELECT Food.food_image "+
  //     "FROM Orders, Contains, Food "+
  //     "WHERE Orders.order_id = Contains.order_id AND Food.food_id = Contains.food_id AND Orders.order_id = ?", [order_id])
  //     var image = temp2.food_image
  //     inProgress.push({order_id,order_name,order_name_extra, 
  //       food_image: image,
  //       order_price,restaurant_name,order_status,created_at});
  // })

  return {inProgress: await db.query("SELECT Orders.order_id, Orders.order_name, Orders.order_name_extra, Food.food_image, Orders.order_price, Vendors.restaurant_name, Vendors.restaurant_number, Orders.order_status, Orders.created_at "+
                                  "FROM Orders, Contains, Food, Vendors "+
                                  "WHERE Orders.order_id = Contains.order_id AND Food.food_id = Contains.food_id AND Orders.customer_id = ? AND Orders.vendor_id = Vendors.vendor_id AND (Orders.order_status = 'COOKING' OR Orders.order_status = 'DONE') AND (Food.food_type = 'ALACART' OR Food.food_type = 'COMBINATION_MAIN')", [customerId]),
  
  history: await db.query("SELECT Orders.order_id, Orders.order_name, Orders.order_name_extra, Food.food_image, Orders.order_price, Vendors.restaurant_name, Vendors.restaurant_number, Orders.order_status, Orders.created_at "+
                              "FROM Orders, Contains, Food, Vendors "+
                              "WHERE Orders.order_id = Contains.order_id AND Food.food_id = Contains.food_id AND Orders.customer_id = ? AND Orders.vendor_id = Vendors.vendor_id AND (Orders.order_status = 'CANCELLED' OR Orders.order_status = 'TIMEOUT' OR Orders.order_status = 'COLLECTED')", [customerId])
  }
}

module.exports = {
  // getSaleRecord,
  getMenuItems
}