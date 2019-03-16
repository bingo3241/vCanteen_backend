var mysql = require('mysql');

//gcp db
var con = mysql.createConnection({
    host: "35.240.232.120",
    user: "root",
    password: "root",
    database: "test",
})

//local db
// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "root",
//     database: "testdb",
//     port: "8889"
// })

con.connect()

function query(sql, params = []) {
    return new Promise( (resolve, reject) => {
        con.query(sql, params, function(err, result, fields) {
            if (err) {
                reject(err)
            }
            resolve(result)
        })
    })
    
}
module.exports = {
    query
}