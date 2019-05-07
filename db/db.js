'use strict';

const SocksConnection = require('socksjs');
const mysql = require('mysql2');
const fixieUrl = process.env.FIXIE_SOCKS_HOST;
const fixieValues = fixieUrl.split(new RegExp('[/(:\\/@)/]+'));

const mysqlServer = {
  host: process.env.GCP_HOST,
  port: process.env.GCP_PORT
};

const dbUser = process.env.GCP_USER;
const dbPassword = process.env.GCP_PASSWORD;
const db = process.env.GCP_DB;

var pool = mysql.createPool({
  user: dbUser,
  password: dbPassword,
  database: db,
  stream: function() {
    return new SocksConnection(mysqlServer, {
      user: fixieValues[0],
      pass: fixieValues[1],
      host: fixieValues[2],
      port: fixieValues[3],
    });
 }
});

function query(sql, params = []) {
  return new Promise( (resolve, reject) => {
    pool.getConnection(function(err, connection) {
      if(err) { 
        console.log(err); 
        reject(err) 
      }
      connection.query(sql, params, function(err, results) {
        pool.releaseConnection(connection); // always put connection back in pool after last query
        if(err) { 
          console.log(err);  
          reject(err)
        }
        resolve(results)
      });
    });
  }) 
}


module.exports = {
    query
}