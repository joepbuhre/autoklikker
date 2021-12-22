const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql');
require('dotenv').config()


const mysql_insert = (object = { urls: String, count: Number, message: String, bg_image: String }) => {
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
    con.query(sql, object, function(err, result) {
        if (err) {
            throw err
        };
        console.log("1 record inserted");
    });
    con.end()
}

const sqlite_insert = (object = { urls: String, count: Number, message: String, bg_image: String }) => {
    
    const db = new sqlite3.Database('./database/autoklikker.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the in-memory SQlite database.');
    });
    db.run(`
    CREATE TABLE IF NOT EXISTS '`+process.env.DB_TABLE+`' (
      id INTEGER PRIMARY KEY,
      urls TEXT DEFAULT NULL,
      count INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      message varchar(255) DEFAULT NULL,
      bg_image TEXT DEFAULT NULL,
      appartment_data LONGTEXT DEFAULT NULL
    )`, (result) => {
        console.log(result)
    });
    db.run("INSERT INTO "+process.env.DB_TABLE+" (urls,count,message,bg_image) VALUES(?, ?, ?, ?)", [object.urls, object.count, object.message, object.bg_image] , (res) => {
      console.log(this)
    })
    db.close()
}

module.exports = {
  addto_db: (object = { urls: String, count: Number, message: String, bg_image: String }) => {
    const db_choice = process.env.DB_CHOICE
    if(db_choice === 'mysql'){
      mysql_insert(object)
    } else if (db_choice === 'sqlite'){
      sqlite_insert(object)
    }
  }
}