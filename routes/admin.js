module.exports = (app,sha256) => {
    const db = require('../database')
    const timeStamp = require('./modules/timestamp')

    app.get("/admin", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            db.query("SELECT * FROM contents ORDER BY id DESC", (err,contents) => {
                if(err) throw err;
                res.render("admin/home", {contents:contents})
                res.end()
            })
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })

    app.get("/admin/login", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
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
                timeStamp('[+] Login Successfully for '+username)
                res.end()
            }
        })
    })

    //START Create Edit Delete Contents
    app.get("/admin/contents/add", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            res.render('admin/contents/add')
            res.end()
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })
    app.get("/admin/contents/edit/:id", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            var id = req.body.id
            db.query("SELECT * FROM contents WHERE id = ?", [id], (err,content) => {
                if(err) throw err;
                if(content.length > 0) {
                    res.render('admin/contents/edit', {content:content[0]})
                    res.end()
                } else {
                    timeStamp("[!] Cannot fetch contents id = "+id)
                }
            })
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })
    app.post("/admin/contents/add", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            var title = req.body.title
            var content = req.body.content
            var writter = req.body.writter
            var is_show = req.body.is_show

            db.query("INSERT INTO contents(title,content,writter,is_show) VALUES(?,?,?,?)", (err,result) => {
                timeStamp('[+] Inserted '+title+' into contents')
                res.redirect('/admin/contents')
                res.end()
            })
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })

    app.post("/admin/contents/edit", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            var id = req.body.id
            var title = req.body.title
            var content = req.body.content
            var writter = req.body.writter
            var is_show = req.body.is_show

            db.query("UPDATE contents SET title = ?, content = ?, writter = ?, is_show = ? WHERE id = ?", [title,content,writter,is_show,id], (err,result) => {
                if(err) throw err
                res.redirect('/admin/contents/'+id)
                res.end()
            })
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })

    app.get("/admin/content/delete/:id", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            var id = req.params.id

            db.query("DELETE FROM contents WHERE id = ?", [id], (err,result) => {
                if(err) throw err
                res.redirect('/admin/contents')
                res.end()
            })
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })
    //END Create Edit Delete Contents
}