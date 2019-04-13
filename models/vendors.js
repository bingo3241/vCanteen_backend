const db = require('../db/db');

function getAll() {
    return result = db.query('SELECT * FROM Vendors');
}

function get(id) {
    return db.query('SELECT * FROM Vendors WHERE vendor_id = ?', [id]);
}

async function getVendorID(email) {
    var temp = await db.query('SELECT Vendors.vendor_id FROM Vendors WHERE Vendors.email = ?', [email])
    return Number(temp[0].vendor_id);
}

async function isInDatabase(email) {
    var temp = await db.query('SELECT COUNT(email) AS Count FROM Vendors WHERE email = ?', [email])
    if( temp[0].Count == 1 ){
        console.log("In database?: true")
        return true;
    } else {
        console.log("In database?: false")
        return false;
    }
}

async function NormalAuth(email, password) {
    var temp = await db.query('SELECT COUNT(email) AS Count FROM Vendors WHERE email = ? AND passwd = ?', [email, password])
    if( temp[0].Count == 1 ){
        console.log("In database?: true")
        return true;
    } else {
        console.log("In database?: false")
        return false;
    }
}

async function changePasswords(pwd,vendor_id) {
    try {
        let result = await db.query('UPDATE Vendors SET passwd = ? WHERE vendor_id = ?', [pwd,vendor_id])
        return [null, result]
    }
    catch (err) {
        return [err, null]
    }
}

async function updateOrderStatus(order_status,order_id) {
    try{
        let result = await db.query('UPDATE Orders SET order_status = ? WHERE order_id = ?', [order_status,order_id])
        return [null,result]
    } 
    catch(err) {
        return [err,null]
    }
}

async function getCombMenu(vendor_id){
    try{
        let result = await db.query('SELECT food_id AS foodId,food_name AS foodName,food_price AS price,food_image AS foodImage,food_status AS foodStatus,food_type AS foodType FROM Food WHERE vendor_id = ? AND (food_type = "COMBINATION_MAIN" OR food_type = "COMBINATION_BASE") ', [vendor_id])
        return result
    } 
    catch(err) {
        return err
    }
}

async function getAlaMenu(vendor_id){
    try{
        let result = await db.query('SELECT food_id AS foodId,food_name AS foodName,food_price AS price,food_image AS foodImage,food_status AS foodStatus,food_type AS foodType FROM Food WHERE vendor_id = ? AND food_type = "ALACARTE" ', [vendor_id])
        return result
    } 
    catch(err) {
        return err
    }
}

async function getOrder(vendor_id){
    try{
        let result = await db.query('SELECT created_at AS timestamp,order_name AS orderName,order_name_extra AS orderNameExtra FROM Orders WHERE vendor_id = ? AND order_status = "COOKING" ', [vendor_id])
        return result
    } 
    catch(err) {
        return err
    }
}

async function getVendorInfo(vendor_id){
    try{
        let result = await db.query('SELECT restaurant_name AS vendorName,vendor_status AS vendorStatus,email AS vendorEmail,vendor_image AS vendorImage,account_type AS accountType FROM Vendors WHERE vendor_id = ? ', [vendor_id])
        return result
    } 
    catch(err) {
        return err
    }
}

async function getProvider(vendor_id){
    try{
        let result = await db.query('SELECT service_provider AS account FROM Vendor_Links NATURAL JOIN VendorMoneyAccounts WHERE vendor_id = ? ', [vendor_id])
        return result
    } 
    catch(err) {
        return err
    }
}

async function editMenu(vendorId,foodId,foodName,price,foodStatus,foodType,foodImage){
    try{
        let result = await db.query('UPDATE Food SET food_name = ?,food_price = ?,food_status = ?,food_type = ?,food_image = ? WHERE vendor_id = ? AND food_id =?', 
        [foodName,price,foodStatus,foodType,foodImage,vendorId,foodId])
        return [null,result]
    } 
    catch(err) {
        return [err,null]
    }
}

async function createMenu(vendorId,foodName,price,foodStatus,foodType,foodImage){
    try{
        let result = await db.query("INSERT INTO Food(vendor_id,food_name,food_price,food_status,food_type,food_image) values(?, ?, ?, ?, ?, ?)", 
        [vendorId,foodName,price,foodStatus,foodType,foodImage])
        return [null, result.insertId]
    }catch(err) {
        return [err, null]
    }
}

async function getFoodId(vendor_id,food_name,food_price,food_status,food_type,food_image){
    try{
        let result = await db.query('SELECT food_id FROM Food WHERE vendor_id=? AND food_name=? AND food_price=? AND food_status=? AND food_type=? AND food_image=?', 
        [vendor_id,food_name,food_price,food_status,food_type,food_image])
        return result
    } 
    catch(err) {
        return err
    }
}


async function getMenu(vendor_id,food_id){
    try{
        let result = await db.query('SELECT food_id AS foodId,food_name AS foodName,food_price AS price,food_status AS foodStatus,food_image AS foodImage,food_type AS foodType FROM Food WHERE vendor_id=? AND food_id=?' , [vendor_id,food_id])
        return result
    } 
    catch(err) {
        return err
    }
}

async function delMenu(vendor_id,food_id){
    try {
        let result = await db.query("DELETE FROM Food WHERE vendor_id = ? AND food_id = ?", [vendor_id,food_id])
        return [null, result]
    }
    catch (err) {
        return [err, null]
    }
}

async function updateVendorStatus(vendor_id,vendor_status){
    try{
        let result = await db.query('UPDATE Vendors SET vendor_status = ? WHERE vendor_id = ?' , 
        [vendor_status,vendor_id])
        return [null,result]
    } 
    catch(err) {
        return [err,null]
    }
}

async function editMenuStatus(vendor_id,menu){  
    try{
        var a = []
        for(i=0; i<menu.length;i++){
        result = await db.query('UPDATE Food SET food_status = ? WHERE food_id =?  AND vendor_id = ? ', 
        [menu[i].food_status,menu[i].food_id,vendor_id])
            if(result.affectedRows == 0){
            a.push(menu[i].food_id)
            }
        }
        console.log(a)
        return a
    } 
    catch(err) {
        return [-1,err]
    }
}
async function assignSlot(order_id,currentDate){
    var x = await db.query('SELECT slot_id FROM Is_At')
    var y = []
    var z
    x.forEach(comp =>{
        y.push(comp)
    })
    do{
        z = Math.floor(Math.random() * 500) + 1
    }while(y.includes(z)){
        z = Math.floor(Math.random()*500) + 1
    }
    return await db.query('INSERT INTO Is_At(order_id,done_time,slot_id) values(?, ?, ?)' , [order_id,currentDate,z])
}



async function assignSlot(order_id,currentDate){
    var x = await db.query('SELECT slot_id FROM Is_At')
    var y = []
    var z
    x.forEach(comp =>{
        y.push(comp)
    })
    do{
        z = Math.floor(Math.random() * 500) + 1
    }while(y.includes(z)){
        z = Math.floor(Math.random()*500) + 1
    }
    return await db.query('INSERT INTO Is_At(order_id,done_time,slot_id) values(?, ?, ?)' , [order_id,currentDate,z])
}

async function reviewVendor(cid, vid, score, comment, createdAt) {
    try {
        await db.query("insert into Reviews(customer_id, vendor_id, score, comment, createed_at) values (?, ?, ?, ?, ?)", [cid, vid, score, comment, createdAt])
        return null
    }catch (err){
        return err
    }
    
}

module.exports = {
    getAll,
    get,
    getVendorID,
    isInDatabase,
    NormalAuth,
    updateOrderStatus,
    getCombMenu,
    getAlaMenu,
    getOrder,
    getVendorInfo,
    getProvider,
    editMenu,
    createMenu,
    getFoodId,
    getMenu,
    delMenu,
    updateVendorStatus,
    editMenuStatus,
    assignSlot,
    changePasswords,
    reviewVendor,
}