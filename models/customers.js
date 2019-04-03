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
        console.log("In database?: true")
        return true;
    } else {
        console.log("In database?: false")
        return false;
    }
}

 async function updatePassword(email, passwd) {
    var customer_id = await getCustomerID(email);
    customer_id = Number(customer_id)
    console.log('CustomerID: '+customer_id)
    return db.query('UPDATE Customers SET passwd = ? WHERE customer_id = ?', [passwd, customer_id]);

}

async function insertFacebook(first_name, last_name, email, profile_url) {
    return await db.query("INSERT INTO Customers SET account_type = 'FACEBOOK', firstname = ?, lastname = ?, customer_image = ?, email = ? ", [first_name, last_name, profile_url, email])
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
    let result = db.query("select vendor_id as vendorId, restaurant_name as restaurantName, restaurant_number as restaurantNumber, vendor_image as vendorImage, vendor_status as vendorStatus from Vendors where admin_permission = 'APPROVED'")
    return result
}

module.exports = {
    getAll,
    get,
    getCustomerID,
    isInDatabase,
    NormalAuth,
    updatePassword,
    insertFacebook,
    changePasswords,
    getApprovedVendor
}