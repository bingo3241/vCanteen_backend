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

async function sendReport(customer_id, message) {
    let now = new Date()
    let thistime = now.getTime()+7*60*60*1000
    let currentDate = new Date(thistime)
    try {
        await db.query("INSERT INTO CustomerReports(created_at, customer_id, message) "+
                 "VALUES(?, ?, ?)", [currentDate, customer_id, message])
        console.log('Report Sent Successfully')
        return true
    } catch (err) {
        console.log('Sending Report Failed')
        return false
    }
}



module.exports = {
    getAll,
    get,
    getCustomerID,
    getCustomerEmail,
    isInDatabase,
    NormalAuth,
    insertFacebook,
    updateFirebaseToken,
    changePasswords,
    getApprovedVendor,
    getAccountType,
    sendReport,
}