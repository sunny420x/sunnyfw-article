module.exports = (sha256) => {
    const db = require('../database')
    const timeStamp = require('./modules/timestamp')

    //default admin account
    const username = "admin"
    const password = sha256(process.env.DEFAULT_PASSWORD)

    sql1 = "CREATE TABLE contents(id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL, contents MEDIUMTEXT NOT NULL, category VARCHAR(50) NOT NULL, writter VARCHAR(50) NOT NULL, cover VARCHAR(200) DEFAULT '/image/default.jpeg', is_show INT(1) DEFAULT 0 NOT NULL)"
    sql2 = "CREATE TABLE admin(id INT(6) AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL, password VARCHAR(200) NOT NULL)"
    sql3 = "INSERT INTO admin(username,password) VALUES(?,?)"
    sql4 = "CREATE TABLE profile(id INT(6) AUTO_INCREMENT PRIMARY KEY, admin INT(6) NOT NULL, name VARCHAR(50) NOT NULL, bio VARCHAR(500), picture VARCHAR(200) DEFAULT '/image/default_profile.png')"

    db.query(sql1, (err,result) => {
        timeStamp("[+] Create Table contents Successful!")
        db.query(sql2, (err,result) => {
            timeStamp("[+] Create Table admin Successful!")
            db.query(sql3, [username,password], (err,result) => {
                timeStamp("[+] Create admin account Successful!")
                db.query(sql4, (err,result) => {
                    timeStamp("[+] Create Table profile Successful!")
                })
            })
        })
    })
}