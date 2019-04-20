const db = require('../db/db');

async function getAdminID(email) {
    var temp = await db.query('SELECT admin_id FROM Admin WHERE email = ?', [email])
    return Number(temp[0].admin_id);
}

async function auth(email, password) {
    var temp = await db.query('SELECT COUNT(email) AS Count FROM Admin WHERE email = ? AND passwd = ?', [email, password])
    if( temp[0].Count == 1 ){
        console.log("Authentication: successed")
        return true;
    } else {
        console.log("Authentication: failed")
        return false;
    }
}

module.exports = {
    getAdminID,
    auth
}