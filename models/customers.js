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

async function getCustomerEmail(customer_id) {
    var temp = await db.query('SELECT email FROM Customers WHERE customer_id= ?', [customer_id])
    return temp[0].email;
}

async function getCustomerFullname(customer_id) {
    var temp = await db.query("SELECT CONCAT(firstname, ' ', lastname) as fullname from Customers where customer_id = ?",[customer_id])
    return temp[0].fullname
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
        console.log("Authentication: successed")
        return true;
    } else {
        console.log("Authentication: failed")
        return false;
    }
}


async function insertFacebook(first_name, last_name, email, profile_url) {
    return await db.query("INSERT INTO Customers(account_type, firstname, lastname, customer_image, email) VALUES ('FACEBOOK', ?, ?, ?, ?) ", [first_name, last_name, profile_url, email])
}

async function insertNewCustomer(email, password, firstname, lastname, customer_image, account_type, token_firebase) {
    try{
        await db.query("INSERT INTO Customers(email, passwd, firstname, lastname, customer_image, account_type, token_firebase) VALUES (?,?,?,?,?,?,?) ", [email, password, firstname, lastname, customer_image, account_type, token_firebase])
        console.log('New Customer Created: '+email)
        return true
    } 
    catch(err) {
        console.log('Creating New Customer Failed')
        return false
    }
}

async function updateFirebaseToken(email, token){
    try{
        let result = await db.query('UPDATE Customers SET token_firebase = ? WHERE email = ? ', [token, email])
        console.log('firebaseToken updated to '+email)
        return result
    } 
    catch(err) {
        console.log('update firebaseToken error')
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

async function sendReport(customer_id, message, currentDate) {
    try {
        await db.query("INSERT INTO CustomerReports(created_at, customer_id, message) "+
                 "VALUES(?, ?, ?)", [currentDate, customer_id, message])
        console.log('Log Report Successfully')
        return true
    } catch (err) {
        console.log('Logging Report Failed')
        return false
    }
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
    let x = await db.query("SELECT v.vendor_id as vendorId,vendor_image as vendorImage,restaurant_name as restaurantName ,food_image as foodImage, food_name as foodName FROM Vendors v join Food f "
    + "where v.vendor_id = f.vendor_id and f.food_type = 'alacarte' and vendor_status = 'open' and admin_permission = 'APPROVED' and food_status = 'AVAILABLE' ")
    let y = Math.floor(Math.random() * x.length )
    console.log(y)
    return x[y]
}

async function getVendor() {
    let open = await db.query("SELECT vendor_id as vendorId,restaurant_name as restaurantName, vendor_image as vendorImage, vendor_status as vendorStatus, CEILING(vendor_queuing_time/60) as queuingTime  FROM Vendors  WHERE admin_permission = 'APPROVED' AND vendor_status = 'OPEN' ORDER BY vendor_id ASC")
    let close = await db.query("SELECT vendor_id as vendorId,restaurant_name as restaurantName, vendor_image as vendorImage, vendor_status as vendorStatus, vendor_queuing_time as queuingTime FROM Vendors WHERE admin_permission = 'APPROVED' AND vendor_status = 'CLOSED' ORDER BY vendor_id ASC")
    let x = []
    open.forEach(data => {
        x.push(data)
    })   
    close.forEach(data => {
        x.push(data)
    }) 
    return x             
}

async function reviewVendorV2(cid, oid, score, comment, createdAt) {
    try {
        await db.query("insert into Reviews(customer_id, order_id, score, comment, created_at) values (?, ?, ?, ?, ?)", [cid, oid, score, comment, createdAt])
        return null
    }catch (err){
        return err
    }
    
}

async function editProfileV2(cid, fname, lname, email, img) {
    let result = await db.query("update Customers set firstname = ?, lastname = ?, email = ?, customer_image = ? where customer_id = ?", [fname, lname, email, img, cid])
    return result
}

module.exports = {
    getAll,
    get,
    getCustomerID,
    getCustomerEmail,
    getCustomerFullname,
    isInDatabase,
    NormalAuth,
    insertFacebook,
    insertNewCustomer,
    updateFirebaseToken,
    changePasswords,
    getApprovedVendor,
    reviewVendorV2,
    editProfileV2,
    getApprovedVendor,
    getAccountType,
    sendReport,
    getAccountType,
    getCusInfo,
    getDensity,
    getRecommend,
    getVendor
}