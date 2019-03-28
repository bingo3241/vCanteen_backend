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

async function changePassword(pwd,customer_id) {
    try {
        let result = await db.query('UPDATE Customers SET passwd = ? WHERE customer_id = ?', [pwd,customer_id])
        return [null, result]
    }
    catch (err) {
        return [err, null]
    }
}

module.exports = {
    getAll,
    isInDatabase,
    changePassword
}
