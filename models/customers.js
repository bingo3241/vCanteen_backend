const db = require('../db/db');

function getAll() {
  
    return db.query('SELECT * FROM Customers');
}

function get(id) {
    return db.query('SELECT * FROM Customers WHERE customer_id = ?', [id]);
}

function isInDatabase(email) {
    if(db.query('SELECT COUNT email FROM Customers WHERE email = ?', [email]) == 1 ){
        return true;
    } else {
        return false;
    }
}

function updatePassword(email, password) {
    return db.query('UPDATE Customers SET password = ? WHERE email = ?', [password, email]);

}

module.exports = {
    getAll,
    get,
    isInDatabase,
    updatePassword
}