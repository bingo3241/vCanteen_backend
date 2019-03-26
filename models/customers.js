const db = require('../db/db');

async function getAll() {
  
    return await db.query('SELECT * FROM Customers');
}

async function get(id) {
    return await db.query('SELECT * FROM Customers WHERE customer_id = ?', [id]);
}

async function isInDatabase(email) {
    if(await db.query('SELECT COUNT email FROM Customers WHERE email = ?', [email]) == 1 ){
        return true;
    } else {
        return false;
    }
}

async function updatePassword(email, password) {
    return await db.query('UPDATE Customers SET password = ? WHERE email = ?', [password, email]);

}

module.exports = {
    getAll,
    get,
    isInDatabase,
    updatePassword
}