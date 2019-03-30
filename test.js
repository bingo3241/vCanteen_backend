const db = require('./db/db')

db.query("UPDATE Customers SET passwd = 'password' WHERE customer_id = 2")