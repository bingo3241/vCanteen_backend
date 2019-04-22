const db = require('../db/db');

async function linkCustomerPayment(customer_id, money_account_id) {
    console.log('Linking customer_id = '+customer_id+' and money_account_id = '+money_account_id+'...')
    try {
        await db.query("INSERT INTO Customer_Links(customer_id, money_account_id) VALUES(?,?)", [customer_id, money_account_id])
        console.log('Linking Customer Payment Successed')
        return true
    } catch (err) {
        console.log('Linking Customer Payment Failed: '+err)
        return false
    }
}

async function unlinkCustomerPayment(customer_id, money_account_id) {
    console.log('Unlinking customer_id = '+customer_id+' and money_account_id = '+money_account_id+'...')
    try {
        await db.query("DELETE FROM Customer_Links WHERE customer_id = ? AND money_account_id = ?", [customer_id, money_account_id])
        console.log('Unlinking CustomerPayment Successed')
        return true
    } catch (err) {
        console.log('Unlinking Customer Payment Failed: '+err)
        return false
    }
}

async function linkVendorPayment(vendor_id, money_account_id) {
    try {
        let linked = await isVendorAlreadyLinked(vendor_id)
        if(linked != false) {
            console.log('This vendor is already linked with money_account_id: '+linked.money_account_id)
            await unlinkVendorPayment(vendor_id, linked.money_account_id)
        }
        console.log('Linking vendor_id = '+vendor_id+' and money_account_id = '+money_account_id+'...')
        await db.query("INSERT INTO Vendor_Links(vendor_id, money_account_id) VALUES(?,?)", [vendor_id, money_account_id])
        console.log('Linking Vendor Payment Successed')
        return true
    } catch (err) {
        console.log('Linking Vendor Payment failed: '+err)
        return false
    }
}

async function unlinkVendorPayment(vendor_id, money_account_id) {
    console.log('Unlinking vendor_id = '+vendor_id+' and money_account_id = '+money_account_id+'...')
    try {
        await db.query("DELETE FROM Vendor_Links WHERE vendor_id = ? AND money_account_id = ?", [vendor_id, money_account_id])
        console.log('Unlinking Vendor Payment Successed')
        return true
    } catch (err) {
        console.log('Unlinking Vendor Payment Failed: '+err)
        return false
    }
}

async function getVendorPaymentMethod(vendor_id) {
    console.log('VendorId: '+vendor_id)
    try {
        let result = await db.query("SELECT VendorMoneyAccounts.money_account_id AS vendorMoneyAccountId, service_provider AS serviceProvider "+
                                    "FROM Vendor_Links, VendorMoneyAccounts "+
                                    "WHERE Vendor_Links.money_account_id = VendorMoneyAccounts.money_account_id AND Vendor_Links.vendor_id = ?", [vendor_id])
        console.log(result)
        return result
    } catch (err) {
        console.log('Get Payment Method Failed: '+err)
        return false
    }
}

async function isVendorAlreadyLinked(vendor_id) {
        let result = await db.query("SELECT money_account_id FROM Vendor_Links WHERE vendor_id = ?",[vendor_id])
        var count = result.length
        if(count = 0) {
            return false
        } else {
            return result[0]
        }
}


module.exports = {
    linkCustomerPayment,
    unlinkCustomerPayment,
    linkVendorPayment,
    unlinkVendorPayment,
    getVendorPaymentMethod,
    isVendorAlreadyLinked
}