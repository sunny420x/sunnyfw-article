module.exports = (sha256) => {
    const db = require('../database')
    const timeStamp = require('./modules/timestamp')
    //default admin account
    const username = "admin"
    const password = sha256(process.env.DEFAULT_PASSWORD)
    //SQL Commands
    sql1 = "CREATE TABLE contents(id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL, contents MEDIUMTEXT NOT NULL, category VARCHAR(50) NOT NULL, writter VARCHAR(50) NOT NULL, cover VARCHAR(200) DEFAULT '/image/default.jpeg', is_show INT(1) DEFAULT 0 NOT NULL)"
    sql2 = "CREATE TABLE admin(id INT(6) AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL, password VARCHAR(200) NOT NULL)"
    sql3 = "INSERT INTO admin(username,password) VALUES(?,?)"
    sql4 = "CREATE TABLE profile(id INT(6) AUTO_INCREMENT PRIMARY KEY, admin INT(6) NOT NULL, name VARCHAR(50) NOT NULL, bio VARCHAR(500), picture VARCHAR(200) DEFAULT '/image/default_profile.png')"
    //Install Contents Table.
    db.query(sql1, (err,result) => {
        if(err) throw err;
        timeStamp("[+] Create Table contents Successful!")
    })
    //Install Admin Table.
    db.query(sql2, (err,result) => {
        if(err) throw err;
        timeStamp("[+] Create Table admin Successful!")
    })
    //Install Profile Table.
    db.query(sql4, (err,result) => {
        if(err) throw err;
        timeStamp("[+] Create Table profile Successful!")
    })
    //Check If admin account is exist or create new one using .env details.
    db.query('SELECT * FROM admin', (err,result) => {
        if(result.length == 0) {
            db.query(sql3, [username,password], (err,result) => {
                if(err) throw err;
                timeStamp("[+] Create admin account Successful!")
            })
        }
    })
}