const db = require('../db/db');

async function changeVendorPermission(vendor_id,admin_permission){
    try{
        await db.query('UPDATE Vendors SET admin_permission = ? WHERE vendor_id = ?' , [admin_permission,vendor_id])
        let x = await db.query('SELECT vendor_status as vendorStatus FROM Vendors WHERE vendor_id = ?' , [vendor_id])
        return [null,x]
    } catch(err) {
        return [err,null]
    }
}

async function getVendor() {
    let x = []
    let a = await db.query("SELECT vendor_status as vendorStatus, vendor_id as vendorId, vendor_image as vendorImage, restaurant_name as restaurantName, email as vendorEmail, phone_number as vendorPhoneNumber, account_type as vendorAccountType, admin_permission as vendorAdminPermission FROM `vcanteen-db-v2`.Vendors WHERE admin_permission = 'PENDING' ORDER BY vendor_id DESC ")
    a.forEach(data => {
        x.push(data)
    })
    let b = await db.query("SELECT vendor_status as vendorStatus, vendor_id as vendorId, vendor_image as vendorImage, restaurant_name as restaurantName, email as vendorEmail, phone_number as vendorPhoneNumber, account_type as vendorAccountType, admin_permission as vendorAdminPermission FROM `vcanteen-db-v2`.Vendors WHERE admin_permission != 'PENDING' ORDER BY vendor_id DESC ")
    b.forEach(data => {
        x.push(data)
    })
    return x
}

module.exports = {
    changeVendorPermission,
    getVendor
}