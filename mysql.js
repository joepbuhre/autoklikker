var mysql = require('mysql');
require('dotenv').config()

var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
});

con.connect(function(err) {
    if (err) {
        throw err
    };
    console.log("Connected!");
});
var sql = "INSERT INTO data SET ?";
var array = {
    urls: JSON.stringify(["1", "2"]),
    count: 2
}
con.query(sql, array, function(err, result) {
    if (err) {
        throw err
    };
    console.log("1 record inserted");
});