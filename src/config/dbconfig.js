const knexConn = require('knex').knex


module.exports.getDb = _ => {
    if (process.env.DB_CHOICE === 'sqlite') {
        return knexConn({
            client: 'sqlite3',
            connection: {
                filename: './database/autoklikker.db'
            },
            useNullAsDefault: true

        })
    }
}

module.exports.create_table = async _ => {
    const knex = this.getDb()
    const tablenames = [
        'autoklikker_klikvoorwonen',
        'autoklikker_mvgm'
    ]
    for (let i = 0; i < tablenames.length; i++) {
        const table = tablenames[i];
        await knex.schema.dropTableIfExists(table)
        console.log('dropped table')
    }


    Promise.all(tablenames.map(name => (
        knex.schema.createTableIfNotExists(name, table => {
            table.string('id').primary(),
                table.text('data'),
                table.timestamp('created_at').defaultTo(knex.fn.now())
        })
    )))
        .then(res => {
            console.log('created table')
        })
        .catch(err => {
            console.log(err)
        })
        .finally(_ => {
            knex.destroy()
        })
}


module.exports.addto_db = async (table, object = [{ id: String, data: String }]) => {
    const knex = this.getDb()
    const newValues = []
    for (let i = 0; i < object.length; i++) {
        const item = object[i];
        await knex
            .insert(item)
            .into(table)
            .then(res => newValues.push(item))
            .catch(err => {
                console.log(err)
                console.log(item)
            })
    }
    knex.destroy()
    return newValues
}







// const mysql_insert = (object = { urls: String, count: Number, message: String, bg_image: String }) => {
//     var con = mysql.createConnection({
//         host: process.env.DB_HOST,
//         user: process.env.DB_USER,
//         password: process.env.DB_PASS,
//         database: process.env.DB_DATABASE,
//     });

//     con.connect(function(err) {
//         if (err) {
//             throw err
//         };
//         console.log("Connected!");
//     });
//     var sql = "INSERT INTO data SET ?";
//     con.query(sql, object, function(err, result) {
//         if (err) {
//             throw err
//         };
//         console.log("1 record inserted");
//     });
//     con.end()
// }

// const sqlite_insert = (table, object = [{ id: String, data: Object }]) => {

//     const db = new sqlite3.Database('./database/autoklikker.db', (err) => {
//         if (err) {
//             return console.error(err.message);
//         }
//         console.log('Connected to the in-memory SQlite database.');
//     });
//     console.log(object)
//     for (let i = 0; i < object.length; i++) {
//         const el = object[i];
//         db.run(`INSERT INTO ${table} (id, data) VALUES(?, ?)`, [el.id, el.data], (res) => {})
//     }

//     db.close()
// }

// const sqlite_createtable = (query = String) => {
//     const db = new sqlite3.Database('./database/autoklikker.db', (err) => {
//         if (err) {
//             return console.error(err.message);
//         }
//     });

//     db.run(`
//   CREATE TABLE IF NOT EXISTS autoklikker_klikvoorwonen (
//     id INTEGER PRIMARY KEY,
//     data TEXT,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//   )`, (result) => {})

//   db.run(`
//   CREATE TABLE IF NOT EXISTS autoklikker_mvgm (
//       id VARCHAR(256) PRIMARY KEY,
//       data TEXT,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//   )
//   `)
// }

// const mysql_create_table = (query = String) => {
//     var con = mysql.createConnection({
//         host: process.env.DB_HOST,
//         user: process.env.DB_USER,
//         password: process.env.DB_PASS,
//         database: process.env.DB_DATABASE,
//     });

//     con.connect(function(err) {
//         if (err) {
//             throw err
//         };
//     });
//     var sql = `
//   CREATE TABLE IF NOT EXISTS autoklikker_klikvoorwonen (
//     id INTEGER PRIMARY KEY,
//     urls TEXT DEFAULT NULL,
//     count INTEGER NOT NULL,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     message varchar(255) DEFAULT NULL,
//     bg_image TEXT DEFAULT NULL,
//     appartment_data LONGTEXT DEFAULT NULL
//   )`

//     con.query(sql, function(err, result) {
//         if (err) {
//             throw err
//         };
//     });
//     con.end()
// }

// module.exports = {
//     addto_db: (table, object) => {
//         const db_choice = process.env.DB_CHOICE
//         if (db_choice === 'mysql') {
//             mysql_insert(table, object)
//         } else if (db_choice === 'sqlite') {
//             sqlite_insert(table, object)
//         }
//     },
//     create_table: () => {
//         const db_choice = process.env.DB_CHOICE
//         if (db_choice === 'mysql') {
//             mysql_create_table()
//         } else if (db_choice === 'sqlite') {
//             sqlite_createtable()
//         }
//     }
// }