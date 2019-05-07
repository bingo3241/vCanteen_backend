const db = require('../db/db')

async function getLatestRecord() {
    try{
        let result = await db.query("SELECT percent_density AS percentDensity, DATE_FORMAT(created_at,'%H:%i') AS latestTime "+
                                    "FROM CrowdEstimations "+
                                    "WHERE created_at = ("+
                                    "SELECT MAX(created_at) "+
                                    "FROM CrowdEstimations "+
                                    "LIMIT 1)")
        return result[0]

    } catch(err) {
        console.log('crowdEstimations.getLatestData error')
        return false
        
    } 
}
async function getDayOfLatestRecord() {
    let result = await db.query("SELECT DATE_FORMAT(created_at, '%W') AS day "+
                                "FROM CrowdEstimations "+
                                "WHERE created_at = ("+
                                "SELECT MAX(created_at) "+
                                "FROM CrowdEstimations "+
                                "LIMIT 1)")
    return result[0].day
}

async function getHourlyStat(day) {
    let result = await db.query("SELECT DATE_FORMAT(hour_of_day,'%H:%i') AS hourOfDay, crowd_stat AS crowdStat FROM CrowdStat WHERE day_of_week = ?", [day])
    return result
}

async function  insertRecord(created_at, percent_density) {
    try{
        await db.query("INSERT INTO CrowdEstimations(created_at, percent_density) VALUES(?,?)", [created_at, percent_density])
        return true

    } catch(err) {
        console.log('Insert Record Error: '+err)
        return false
        
    } 
}


module.exports = {
    getLatestRecord,
    getDayOfLatestRecord,
    getHourlyStat,
    insertRecord,
}