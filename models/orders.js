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

function getInProgress(customerId) {
  return db.query("SELECT Orders.order_id, Orders.order_name, Orders.order_name_extra, Food.food_image, Orders.order_price, Vendors.restaurant_name, Vendors.restaurant_number, Orders.order_status, Orders.created_at "+
                                  "FROM Orders, Contains, Food, Vendors "+
                                  "WHERE Orders.order_id = Contains.order_id AND Food.food_id = Contains.food_id AND Orders.customer_id = ? AND Orders.vendor_id = Vendors.vendor_id AND (Orders.order_status = 'COOKING' OR Orders.order_status = 'DONE') AND (Food.food_type = 'ALACART' OR Food.food_type = 'COMBINATION_MAIN')", [customerId])
  
}

function getHistory(customerId) {
  return db.query("SELECT Orders.order_id, Orders.order_name, Orders.order_name_extra, Food.food_image, Orders.order_price, Vendors.restaurant_name, Vendors.restaurant_number, Orders.order_status, Orders.created_at "+
                  "FROM Orders, Contains, Food, Vendors "+
                  "WHERE Orders.order_id = Contains.order_id AND Food.food_id = Contains.food_id AND Orders.customer_id = ? AND Orders.vendor_id = Vendors.vendor_id AND (Orders.order_status = 'CANCELLED' OR Orders.order_status = 'TIMEOUT' OR Orders.order_status = 'COLLECTED')", [customerId])
}

module.exports = {
  // getSaleRecord,
  getInProgress,
  getHistory
}