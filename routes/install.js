module.exports = (app,sha256) => {    
    let db = require('../database')
    const timeStamp = require('./modules/timestamp')
    
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
    default_contents = "INSERT INTO `contents` (`id`, `title`, `contents`, `writter`, `is_show`, `cover`, `category`)VALUES(1, 'Test Article 1', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '1', 0, '/image/default.jpeg', 'test'),(2, 'Test Article 2', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', '1', 0, '/image/default.jpeg', 'test'),(3, 'Test Article 3', '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>\r\n', '1', 0, '/image/default.jpeg', 'test');"
    default_profile = "INSERT INTO `profile` (`id`, `admin`, `name`, `bio`, `picture`)VALUES(1, 1, 'Admin', '<p>Default Admin Profile</p>\r\n', '/image/default_profile.png')"

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

    function check_table(sql) {
        return new Promise((resolve) => {
            db.query(sql, (err,result) => {
                if(err && err.code == "ER_NO_SUCH_TABLE") {
                    resolve(false)
                } else {
                    resolve(true)
                }
            })
        })
    }

    async function install() {
        await promise_install(contents_install).catch(reject => {timeStamp(reject)})
        await promise_install(admin_install).catch(reject => {timeStamp(reject)})
        await promise_install(profile_install).catch(reject => {timeStamp(reject)})
        await promise_install(pages_install).catch(reject => {timeStamp(reject)})
        await promise_install(admin_account_install).catch(reject => {timeStamp(reject)})
        await promise_install(default_contents).catch(reject => {timeStamp(reject)})
        await promise_install(default_profile).catch(reject => {timeStamp(reject)})
    }

    async function check_install() {
        await check_table(contents_check).then(resolve => {tables_status.contents = resolve})
        await check_table(admin_check).then(resolve => {tables_status.admin = resolve})
        await check_table(profile_check).then(resolve => {tables_status.profile = resolve})
        await check_table(pages_check).then(resolve => {tables_status.pages = resolve})
    }

    app.get("/install", (req,res) => {
        check_install().then(() => {
            res.render("install", {tables_status:tables_status})
            res.end()
        })
    })

    app.get("/install/start", (req,res) => {
        install().then(() => {
            res.cookie('alert', 'successfullyinstall')
            res.redirect('/install')
            res.end()
        })
    })
}