const db = require('../db/db');

async function getAll() {
    return await db.query('select * from Customers');
}

module.exports = {
    getAll
}