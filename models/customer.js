const db = require('../db/db');

async function getAll() {
    return await db.query('SELECT * FROM Customers');
}

async function isInDatabase(email) {
    if(await db.query('SELECT COUNT email FROM Customers WHERE email = ?', [email]) == 1 ){
        return true;
    } else {
        return false;
    }
}

async function updatePassword(email, hash) {
    await db.query('UPDATE Customers SET password = ? WHERE email = ?', [hash, email]);

}

module.exports = {
    getAll,
    isInDatabase
}