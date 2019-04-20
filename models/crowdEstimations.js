const db = require('../db/db')

async function getLatestRecord() {
    try{
        let result = await db.query("SELECT percent_density AS percentDensity, created_at AS latestTime "+
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

module.exports = {
    getLatestRecord
}