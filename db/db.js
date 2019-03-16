// var mysql = require('mysql2');

// // //gcp db
// var con = mysql.createConnection({
//     host: "35.240.206.151",
//     user: "root",
//     password: "root",
//     database: "test-db",
// })

// //local db
// // var con = mysql.createConnection({
// //     host: "localhost",
// //     user: "root",
// //     password: "root",
// //     database: "testdb",
// //     port: "8889"
// // })

// con.connect()

// function query(sql, params = []) {
//   return new Promise( (resolve, reject) => {
//     con.query(sql, params, function(err, result, fields) {
//         if (err) {
//             reject(err)
//         }
//         resolve(result)
//     })
//   })
// }


//Fixie Socks (Only for HEROKU)
'use strict';

const SocksConnection = require('socksjs');
const mysql = require('mysql2');
const fixieUrl = process.env.FIXIE_SOCKS_HOST;
const fixieValues = fixieUrl.split(new RegExp('[/(:\\/@)/]+'));

const mysqlServer = {
  host: '35.240.206.151',
  port: 3306
};

const dbUser = 'root';
const dbPassword = 'root';
const db = 'test-db';

const fixieConnection = new SocksConnection(mysqlServer, {
  user: fixieValues[0],
  pass: fixieValues[1],
  host: fixieValues[2],
  port: fixieValues[3],
});

const mysqlConnPool = mysql.createPool({
  user: dbUser,
  password: dbPassword,
  database: db,
  stream: fixieConnection
});

function query(sql, params = []) {
  return new Promise( (resolve, reject) => {
    mysqlConnPool.query(sql,params, function(err, rows, fields) {
      // Connection is automatically released when query resolves
      if(err) {
        reject(err);
      }
      resolve(rows)
   })
  });
}







module.exports = {
    query
}