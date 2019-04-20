const db = require('../db/db');

function getAll() {
    return result = db.query('SELECT * FROM Customers');
}

function get(id) {
    return db.query('SELECT * FROM Customers WHERE customer_id = ?', [id]);
}

async function getCustomerID(email) {
    var temp = await db.query('SELECT Customers.customer_id FROM Customers WHERE Customers.email = ?', [email])
    return Number(temp[0].customer_id);
}

async function isInDatabase(email) {
    var temp = await db.query('SELECT COUNT(email) AS Count FROM Customers WHERE email = ?', [email])
    if( temp[0].Count == 1 ){
        console.log(""+email+" in database?: true")
        return true;
    } else {
        console.log(""+email+" in database?: false")
        return false;
    }
}

async function NormalAuth(email, password) {
    var temp = await db.query('SELECT COUNT(email) AS Count FROM Customers WHERE email = ? AND passwd = ?', [email, password])
    if( temp[0].Count == 1 ){
        console.log("Authentication: true")
        return true;
    } else {
        console.log("Authentication: false")
        return false;
    }
}


async function insertFacebook(first_name, last_name, email, profile_url) {
    return await db.query("INSERT INTO Customers(account_type, firstname, lastname, customer_image, email) VALUES ('FACEBOOK', ?, ?, ?, ?) ", [first_name, last_name, profile_url, email])
}

async function insertFirebaseToken(email, token){
    try{
        let result = await db.query('UPDATE Customers SET token_firebase = ? WHERE email = ? ', [token, email])
        console.log('firebaseToken inserted to '+email)
        return result
    } 
    catch(err) {
        console.log('insert firebaseToken error')
        return err
    }
}

async function changePasswords(pwd,customer_id) {
    try {
        let result = await db.query('UPDATE Customers SET passwd = ? WHERE customer_id = ?', [pwd,customer_id])
        return [null, result]
    }
    catch (err) {
        return [err, null]
    }
}

async function getApprovedVendor() { //id name, number, image, status
    let result = db.query("select vendor_id as vendorId, restaurant_name as restaurantName, restaurant_number as restaurantNumber, vendor_image as vendorImage, vendor_status as vendorStatus from Vendors where admin_permission = 'APPROVED' order by vendorStatus desc")
    return result
}

async function getAccountType(email) {
    let result = await db.query("SELECT Customers.account_type FROM Customers WHERE Customers.email = ?", [email])
    return result[0].account_type
}

async function getCusInfo(customer_id) {
    let result = await db.query("SELECT firstname, lastname, email, customer_image as customerImage FROM Customers WHERE customer_id = ? ", [customer_id])
    return result[0]
}

async function getDensity() {
    let result = await db.query("SELECT percent_density as percentDensity FROM CrowdEstimations c WHERE c.record_id = (SELECT MAX(c2.record_id) FROM CrowdEstimations c2) ")
    return result[0].percentDensity
}

async function getRecommend() {
    let x = await db.query("SELECT DISTINCT vendor_id as vendorId, food_image as foodImage, food_name as foodName FROM Food WHERE food_type = 'ALACARTE' ")
    let y = Math.floor(Math.random() * x.length )
    console.log(y)
    return x[y]
}


async function getVendor() {
    let open = await db.query("SELECT vendor_id as vendorId,restaurant_name as restaurantName, vendor_image as vendorImage, vendor_status as vendorStatus FROM Vendors  WHERE admin_permission = 'APPROVED' AND vendor_status = 'OPEN' ORDER BY vendor_id ASC")
    let close = await db.query("SELECT vendor_id as vendorId,restaurant_name as restaurantName, vendor_image as vendorImage, vendor_status as vendorStatus FROM Vendors WHERE admin_permission = 'APPROVED' AND vendor_status = 'CLOSED' ORDER BY vendor_id ASC")
    let x = []   
    for (let i = 0; i<open.length; i++) {  
            let waittime = await db.query("select sum(order_prepare_duration) as time from Orders where vendor_id = (select distinct vendor_id from Orders where vendor_id = ?) AND order_status = 'COOKING'", [open[i].vendorId])
            x.push({"vendorId": open[i].vendorId, "restaurantName": open[i].restaurantName, "vendorImage": open[i].vendorImage, "queuingTime": Math.ceil(waittime[0].time/60)})
    } 
    close.forEach(data => {
        x.push(data)
    })
    return x             
}




module.exports = {
    getAll,
    get,
    getCustomerID,
    isInDatabase,
    NormalAuth,
    insertFacebook,
    insertFirebaseToken,
    changePasswords,
    getApprovedVendor,
    getAccountType,
    getCusInfo,
    getDensity,
    getRecommend,
    getVendor
}