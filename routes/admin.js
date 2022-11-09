module.exports = (app,sha256) => {
    const db = require('../database')
    const timeStamp = require('./modules/timestamp')

    var is_admin = require('./modules/check_admin')
    app.get("/admin", (req,res) => {
        if(is_admin == true) {
            res.render("admin/home")
            res.end()
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })

    app.get("/admin/login", (req,res) => {
        if(is_admin == true) {
            res.redirect("/admin")
            res.end()
        } else {
            res.render("admin/login")
            res.end()
        }
    })

    app.post("/admin/login", (req,res) => {
        var username = req.body.username
        var password_hash = sha256(req.body.password)
        var remember = req.body.remember
        
        if(remember == 1) {
            var expires = 29.6 * 24 * 60 * 60 * 1000
        } else { 
            var expires = 24 * 60 * 60 * 1000
        }

        db.query("SELECT * FROM admin WHERE username = ? and password = ?", [username,password_hash], (err,result) => {
            if(result.length == 1) {
                req.session.loggedin = true
                req.session.username = username
                res.cookie('login_info', username+":"+password_hash, {signed: true, maxAge: expires})
                res.redirect('/admin')
                timeStamp('[+] Login OK for '+username)
                res.end()
            }
        })
    })
}