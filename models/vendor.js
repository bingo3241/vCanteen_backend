const db = require('../db/db')

async function getAll() {
    return await db.query('SELECT * FROM orders');
}


async function updateOrderStatus(order_status,order_id) {
    try{
        let result = await db.query('UPDATE orders SET order_status = ? WHERE order_id = ?', [order_status,order_id])
        return [null,result]
    } 
    catch(err) {
        return [err,null]
    }
}

async function getCombMenu(vendor_id){
    try{
        let result = await db.query('SELECT food_id,food_name,food_price,food_image,food_status FROM food WHERE vendor_id = ? AND (food_type = "COMBINATION_MAIN" OR food_type = "COMBINATION_BASE") ', [vendor_id])
        return result
    } 
    catch(err) {
        return err
    }
}

async function getAlaMenu(vendor_id){
    try{
        let result = await db.query('SELECT food_id,food_name,food_price,food_image,food_status FROM food WHERE vendor_id = ? AND food_type = "ALACARTE" ', [vendor_id])
        return result
    } 
    catch(err) {
        return [err,null]
    }
}

async function getOrder(vendor_id){
    try{
        let result = await db.query('SELECT created_at,order_name,order_name_extra FROM orders WHERE vendor_id = ? AND order_status = "COOKING" ', [vendor_id])
        return result
    } 
    catch(err) {
        return [err,null]
    }
}



 module.exports = {
     getAll,
     updateOrderStatus,
     getCombMenu,
     getAlaMenu,
     getOrder
 }