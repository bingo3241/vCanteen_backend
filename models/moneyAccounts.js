const db = require('../db/db');

async function createCustomer(service_provider, account_number) {
    let temp = await db.query("SELECT COUNT(*) AS count FROM CustomerMoneyAccounts WHERE account_number = ?", [account_number])
    if(Number(temp[0].count) == 1) {
        console.log('Customer Money Account Already Existed')
        return true
    }
    try {
        await db.query("INSERT INTO CustomerMoneyAccounts(balance, service_provider, account_number) "+
                       "VALUES(?,?,?)", [10000,service_provider,account_number])
        console.log('Create Customer Money Account Successfully')
        return true
    } catch(err) {
        console.log('Create Customer Money Account Failed')
        return false
    }
}

async function createVendor(service_provider, account_number) {
    let temp = await db.query("SELECT COUNT(*) AS count FROM VendorMoneyAccounts WHERE account_number = ?", [account_number])
    if(Number(temp[0].count) == 1) {
        console.log('Vendor Money Account Already Existed')
        return true
    }
    try {
        await db.query("INSERT INTO VendorMoneyAccounts(balance, service_provider, account_number) "+
                       "VALUES(?,?,?)", [10000,service_provider,account_number])
        console.log('Create Vendor Money Account Successfully')
        return true
    } catch(err) {
        console.log('Create Vendor Money Account Failed')
        return false
    }
}

async function getCustomerAccountID(account_number) {
    try {
        let result = await db.query("SELECT money_account_id FROM CustomerMoneyAccounts WHERE account_number = ?", [account_number])
        var id = result[0].money_account_id
        console.log('Customer Account Money ID: '+id)
        return id
    } catch (err) {
        console.log("Get Customer Money Account ID Failed")
        return null
    }
}

async function getVendorAccountID(account_number) {
    try {
        let result = await db.query("SELECT money_account_id FROM VendorMoneyAccounts WHERE account_number = ?", [account_number])
        var id = result[0].money_account_id
        console.log('Vendor Account Money ID: '+id)
        return id
    } catch (err) {
        console.log("Get Vendor Money Account ID Failed")
        return null
    }
}

module.exports = {
    createCustomer,
    createVendor,
    getCustomerAccountID,
    getVendorAccountID
}