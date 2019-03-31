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

 async function updatePassword(email, passwd) {
    var vendor_id = await getCustomerID(email);
    console.log('VendorID: '+customer_id)
    return db.query('UPDATE Vendors SET passwd = ? WHERE vendor_id = ?', [passwd, vendor_id]);

}

module.exports = {
    getAll,
    get,
    getVendorID,
    isInDatabase,
    NormalAuth,
    updatePassword
}