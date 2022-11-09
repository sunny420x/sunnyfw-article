module.exports = (sha256) => {
    const db = require('../database')
    const timeStamp = require('./modules/timestamp')

    //default admin account
    const username = "admin"
    const password = sha256(process.env.DEFAULT_PASSWORD)

    db.query("CREATE TABLE contents(id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL, contents MEDIUMTEXT NOT NULL, writter INT(6) NOT NULL, is_show INT(1) DEFAULT 0 NOT NULL)", (err,result) => {
        timeStamp("[+] Create Table contents Successful!")
        db.query("CREATE TABLE admin(id INT(6) AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL, password VARCHAR(200) NOT NULL)", (err,result) => {
            timeStamp("[+] Create Table admin Successful!")
            db.query("INSERT INTO admin(username,password) VALUES(?,?)", [username,password], (err,result) => {
                timeStamp("[+] Create admin account Successful!")
            })
        })
    })
}