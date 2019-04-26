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

async function getVendorEmail(vendor_id) {
    var temp = await db.query('SELECT email FROM Vendors WHERE vendor_id= ?', [vendor_id])
    return temp[0].email;
}

async function getVendorName(vendor_id) {
    var temp = await db.query("SELECT restaurant_name FROM Vendors where vendor_id = ?", [vendor_id])
    return temp[0].restaurant_name
}

async function isInDatabase(email) {
    console.log('Input Email: '+email)
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
        console.log("Authentication: successed")
        return true;
    } else {
        console.log("Authentication: failed")
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

async function updateOrderStatus(order_status,order_id, cancelReason) {
    try{
        let result = await db.query('UPDATE Orders SET order_status = ?, cancel_reason = ? WHERE order_id = ?', [order_status, cancelReason, order_id])
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
        let result = await db.query('SELECT created_at AS timestamp,order_name AS orderName,order_name_extra AS orderNameExtra, order_id AS orderId FROM Orders WHERE vendor_id = ? AND order_status = "COOKING" ', [vendor_id])
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


async function getAccountType(email) {
    let result = await db.query("SELECT Vendors.account_type FROM Vendors WHERE Vendors.email = ?", [email])
    var account_type = result[0].account_type
    console.log('account_type: '+account_type)
    return account_type
}

async function insertFacebook(email) {
    try{
        let result = await db.query("UPDATE Customers SET account_type = 'FACEBOOK', email = ? ", [email])
        console.log('Facebook-type account created: '+email)
        return result
    } 
    catch(err) {
        return err
    }
}

async function insertNewVendor(email, password, account_type, restaurant_name, phone_number, four_digit_pin, firebase_token) {
    console.log(account_type)
    try{
        await db.query("INSERT INTO Vendors(email, passwd, account_type, restaurant_name, vendor_image, phone_number, four_digit_pin, token_firebase, admin_permission,vendor_status, score) VALUES (?,?,?,?,?,?,?,?,?,?,?) ", [email, password, account_type, restaurant_name, null, phone_number, four_digit_pin, firebase_token, "PENDING", "CLOSED",0.0])
        console.log('New Vendor Created: '+email)
        return true
    } 
    catch(err) {
        console.log(err)
        return false
    }
}

async function updateFirebaseToken(email, token){
    try{
        let result = await db.query('UPDATE Vendors SET token_firebase = ? WHERE email = ? ', [token, email])
        console.log('firebaseToken inserted to '+email)
        return result
    } 
    catch(err) {
        console.log('Update firebaseToken error')
        return err
    }
}

async function closeVendor(vendor_id,cancel_reason){
    try{
        let result = await db.query('UPDATE Orders SET order_status = "CANCELLED",cancel_reason = ? WHERE vendor_id = ? AND order_status = "COOKING" ' , 
        [cancel_reason,vendor_id])
        console.log('Close vendor success')
        return [null,result]
    } 
    catch(err) {
        console.log('Close vendor failed')
        return [err,null]
    }
}

async function sendReport(vendor_id, message) {
    let now = new Date()
    let thistime = now.getTime()+7*60*60*1000
    let currentDate = new Date(thistime)
    try {
        await db.query("INSERT INTO VendorReports(created_at, vendor_id, message) "+
                       "Values(?, ?, ?)", [currentDate, vendor_id, message])
        console.log('Report Sent Successfully')
        return true
    } catch (err) {
        console.log('Sending Report Failed')
        return false
    }
}

async function updateCancelReason(order_id,order_status,cancel_reason){
    try{
        let result = await db.query('UPDATE Orders SET order_status = ?, cancel_reason = ? WHERE order_id = ?' , 
        [order_status,cancel_reason,order_id])
        return [null,result]
    } 
    catch(err) {
        return [err,null]
    }
}

async function getToken(vendor_id){
    let x = await db.query('SELECT DISTINCT token_firebase from Customers c JOIN Orders o on c.customer_id = o.customer_id WHERE vendor_id =?', [vendor_id])
    console.log(x)
    return x
}


//-----------------------------------------------------------------------V2------------------------------------------------------------------------------------------


async function getFoodByIdV2(fid) {
    let res = await db.query("select * from Food where food_id = ?", [fid])
    res = res[0]
    let category = await db.query("select category_name from Classifies where food_id = ?", [fid])
    let resp = {"foodId": res.food_id, "food_name": res.food_name, "price": res.food_price, "foodStatus": res.food_status, "foodImage": res.food_image, "foodType": res.food_type, "category": category[0].category_name}
    //console.log(category)
    return resp
}

async function getReviewV2(vid) {
    let score = await db.query("select avg(r.score) as score from Orders o join Reviews r on o.order_id = r.order_id and o.vendor_id = ?", [vid])
    let reviewlist = await db.query("select o.order_name, o.order_name_extra, r.score, r.comment, r.created_at from Orders o join Reviews r on o.order_id = r.order_id and o.vendor_id = ?", [vid])
    let resultlist = []
    //console.log(score)
    //console.log(reviewlist)
    reviewlist.sort((a,b) => {
        return b.created_at - a.created_at
    })
    reviewlist.forEach(review => {
        const date = new Date(review.created_at);
        const month = date.toLocaleString('en-us', { month: 'long' });
        const day = date.toLocaleString('en-us', { day: '2-digit' });
        const year = date.toLocaleString('en-us', { year: 'numeric' });
        let newdate = (month+" "+day+", "+year);
        resultlist.push({"orderName": review.order_name, "orderNameExtra": review.order_name_extra, "score": review.score, "comment": review.comment, "createdAt": newdate})
    })
    let res = {"vendorScore": score[0].score, "reviewList": resultlist}
    console.log(res)
    return res
}
async function getVendorInfoV2(vid) {
    let vacc = await db.query("select vm.service_provider as account from Vendor_Links vl join VendorMoneyAccounts vm on vl.money_account_id = vm.money_account_id and vl.vendor_id = ?", [vid])
    let vinfo = await db.query("select restaurant_name, vendor_status, email, vendor_image, account_type from Vendors where vendor_id = ?", [vid])
    let score = await db.query("select avg(r.score)as score from Orders o join Reviews r on o.order_id = r.order_id and o.vendor_id = ?", [vid])
    let res = {"vendorInfo": [{"vendorName": vinfo[0].restaurant_name, "vendorStatus": vinfo[0].vendor_status, "vendorEmail": vinfo[0].email, "vendorImage": vinfo[0].vendor_image, "accountType": vinfo[0].account_type, "score": score[0].score}], "vendorPaymentMethod": vacc}
    return res
    
}

async function verifyPinV2(vid, pin) {
    let dbpin = await db.query("select four_digit_pin from Vendors where vendor_id = ?", [vid])
    if (dbpin[0].four_digit_pin == pin) return true
    else return false
}

async function editPinV2(vid, pin) {
    let res = await db.query("update Vendors set four_digit_pin = ? where vendor_id = ?", [pin, vid])
    return res
}

async function editMenuV2(vid, fid, fname, fprice, fstatus, ftype, fimg, catname, ptime) {
    let current = await db.query("select food_type from Food  where food_id = ?", [fid])
    console.log("current: "+current[0].food_type+"  new: "+ ftype+"  foodID :"+ fid)
    try {
        res = await db.query("update Food set food_name = ?, food_price =?, food_status = ?, food_type = ?, food_image = ?, prepare_duration = ? where food_id = ?", [fname, fprice, fstatus, ftype, fimg, ptime,   fid])
        if (ftype == "ALACARTE") {
            if (current[0].food_type == "ALACARTE") {
                await db.query("update Classifies set category_name = ? where food_id = ?", [catname, fid])
            }else {
                await db.query("insert into Classifies(category_name, food_id) values(?, ?)", [catname, fid])
            }
        }else {
            if (current[0].food_type == "ALACARTE") {
                await db.query("delete from Classifies where food_id = ?", [fid])
            }
        }
        return null
    }catch (err) {
        return err
    } 
}

async function addMenuV2(vid, fname, fprice, fstatus, ftype, fimg, catname, ptime) {
    let res
    try {
        if (ftype == "COMBINATION_BASE" || ftype == "COMBINATION_MAIN") {
            res = await db.query("insert into Food(food_name, food_price, food_status, food_type, food_image, prepare_duration, vendor_id) values (?, ?, ?, ?, ?, ?, ?)", [fname, fprice, fstatus, ftype, fimg, ptime, vid])
        }else {
            res = await db.query("insert into Food(food_name, food_price, food_status, food_type, food_image, prepare_duration, vendor_id) values (?, ?, ?, ?, ?, ?, ?)", [fname, fprice, fstatus, ftype, fimg, ptime, vid])
            await db.query("insert into Classifies (food_id, category_name) values (?, ?)", [res.insertId, catname])
        }
        return [res, null]
    } catch (err) {
        return [null, err]
    }
}

async function editProfileV2(vid, rname, email) {
    let result = db.query("update Vendors set restaurant_name = ?, email = ? where vendor_id = ?", [rname, email, vid])
    return result
}
async function editProfileImgV2(vid, img) {
    let result = db.query("update Vendors set vendor_image = ? where vendor_id = ?", [img, vid])
    return result
}

async function preinsertExtra(vendor_id) {
    try{
        await db.query("INSERT INTO Food(food_name, food_price, food_type, vendor_id, prepare_duration) "+
        "VALUES ('Extra Size', 10, 'EXTRA', ?, 0), "+
        "('No Vegetable', 0, 'EXTRA', ?, 0), "+
        "('Not Spicy', 0, 'EXTRA', ?, 0)", [vendor_id, vendor_id, vendor_id])
        console.log('Food Extra Created for VendorID: '+vendor_id)
        return true
    } 
    catch(err) {
        console.log('Creating Food Extra Failed')
        return false
    }
}



module.exports = {
    getAll,
    get,
    getVendorID,
    getVendorEmail,
    getVendorName,
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
    getFoodByIdV2,
    getReviewV2,
    getVendorInfoV2,
    verifyPinV2,
    editPinV2,
    editMenuV2,
    addMenuV2,
    editProfileV2,
    editProfileImgV2,
    changePasswords,
    getAccountType,
    insertFacebook,
    insertNewVendor,
    updateFirebaseToken,
    closeVendor,
    sendReport,
    updateCancelReason,
    preinsertExtra,
    getToken
}