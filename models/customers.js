const db = require('../db/db');

function getAll() {
  
    return db.query('SELECT * FROM Customers');
}

function get(id) {
    return db.query('SELECT * FROM Customers WHERE customer_id = ?', [id]);
}

async function getCustomerID(email) {
    var temp = await db.query('SELECT Customers.customer_id FROM Customers WHERE Customers.email = ?', [email])
    return temp[0].customer_id;
}

async function FacebookAuth(email) {
    var temp = await db.query('SELECT COUNT(email) AS Count FROM Customers WHERE email = ?', [email])
    if( temp[0].Count == 1 ){
        console.log("In database?: true")
        return true;
    } else {
        console.log("In database?: false")
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

function updatePassword(email, password) {
    return db.query('UPDATE Customers SET password = ? WHERE email = ?', [password, email]);

}

module.exports = {
    getAll,
    get,
    getCustomerID,
    FacebookAuth,
    NormalAuth,
    updatePassword
}