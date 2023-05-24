module.exports = (app,sha256) => {    
    let db = require('../database')
    const timeStamp = require('./modules/timestamp')
    //default admin account
    const username = "admin"
    const password = sha256(process.env.DEFAULT_PASSWORD)
    
    //SQL Check Install Commands
    contents_check = "SELECT * FROM contents"
    admin_check = "SELECT * FROM admin"
    profile_check = "SELECT * FROM profile"
    pages_check = "SELECT * FROM pages"

    //SQL Install Commands
    contents_install = "CREATE TABLE contents(id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL, contents MEDIUMTEXT NOT NULL, category VARCHAR(50) NOT NULL, writter VARCHAR(50) NOT NULL, cover VARCHAR(200) DEFAULT '/image/default.jpeg', is_show INT(1) DEFAULT 0 NOT NULL)"
    admin_install = "CREATE TABLE admin(id INT(6) AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(200) NOT NULL)"
    admin_account_install = "INSERT INTO admin(username,password) VALUES('admin','"+sha256(process.env.DEFAULT_PASSWORD)+"')"
    profile_install = "CREATE TABLE profile(id INT(6) AUTO_INCREMENT PRIMARY KEY, admin INT(6) NOT NULL, name VARCHAR(50) NOT NULL, bio VARCHAR(500), picture VARCHAR(200) DEFAULT '/image/default_profile.png')"
    pages_install = "CREATE TABLE pages(id INT(6) AUTO_INCREMENT PRIMARY KEY, title VARCHAR(200) NOT NULL, address VARCHAR(50) NOT NULL,HTML MEDIUMTEXT NOT NULL)"
    
    let tables_status = {
        contents: false,
        admin: false,
        profile: false,
        pages: false
    }

    function promise_install(sql) {
        return new Promise((resolve,reject) => {
            db.query(sql, (err,result) => {
                if(err) {
                    reject(err)   
                } else {
                    resolve()
                }
            })
        })
    }

    function check(sql) {
        db.query(sql, (err,result) => {
            if(err && err.code == "ER_NO_SUCH_TABLE") {
                return false
            }
            return true
        })
    }

    async function install() {
        await promise_install(contents_install).catch(reject => {timeStamp(reject)})
        await promise_install(admin_install).catch(reject => {timeStamp(reject)})
        await promise_install(profile_install).catch(reject => {timeStamp(reject)})
        await promise_install(pages_install).catch(reject => {timeStamp(reject)})
        await promise_install(admin_account_install).catch(reject => {timeStamp(reject)})
    }

    function check_install(tables_status) {
        tables_status.contents = check(contents_check)
        tables_status.admin = check(admin_check)
        tables_status.profile = check(profile_check)
        tables_status.pages = check(pages_check)
    }
    

    app.get("/install", (req,res) => {
        console.log(tables_status)
        res.render("install", {tables_status:tables_status})
        res.end()
    })

    app.get("/install/start", (req,res) => {
        install().then(() => {
            res.cookie('alert', 'successfullyinstall')
            res.redirect('/')
            res.end()
        })
    })
}