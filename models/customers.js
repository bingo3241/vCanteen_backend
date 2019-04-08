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
    return await db.query("INSERT INTO Customers SET account_type = 'FACEBOOK', firstname = ?, lastname = ?, customer_image = ?, email = ? ", [first_name, last_name, profile_url, email])
}

async function insertFirebaseToken(email, token){
    try{
        let result = await db.query('INSERT INTO Customers SET token_firebase = ? WHERE email = ? ', [token, email])
        console.log('firebaseToken inserted to '+email)
        return result
    } 
    catch(err) {
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
    getAccountType
}