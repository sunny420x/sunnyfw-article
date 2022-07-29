const util = require('util')
var mysql = require('mysql')
var db_info = require('./settings')

var con = mysql.createPool({
    connectionLimit: 10,
    host: db_info[0],
    user: db_info[1],
    password: db_info[2],
    database: db_info[3]
})

function hit_mysql_data(sql) {
  let status = []
  
  for(i in sql) {
    db.query(sql[i], (err) => {
      if(err) {
        status[i] = false
      } else {
        status[i] = true
      }
    })
  }

  return status
}

// var get_mysql_data = (sql,place_holder) => {
//   return new Promise((resolve,reject) => {
//     con.getConnection((err, connection) => {
//       if (err) {
//           if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//             console.error('[!] Database connection was closed.')
//           }
//           if (err.code === 'ER_CON_COUNT_ERROR') {
//             console.error('[!] Database has too many connections.')
//           }
//           if (err.code === 'ECONNREFUSED') {
//             console.error('[!] Database connection was refused.')
//           }
//       }

//       con.query(sql,place_holder,(err,result) => {
//         if(err) {
//           console.log(err)
//           return reject(err)
//         }

//         if(result == null) {
//           return reject({message:'MYSQL Error'})
//         }

//         resolve(result)
//       })
//       //if (connection) connection.release()
  
//       //return
//     })
//   })
// }

//con.query = util.promisify(con.query)

module.exports = con