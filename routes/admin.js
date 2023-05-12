module.exports = (app,sha256) => {
    const db = require('../database')
    const timeStamp = require('./modules/timestamp')
    const get_admin_info = require('./modules/get_admin_info')

    app.get("/admin", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(req.cookies.alert != undefined) {
            var alert = req.cookies.alert
            res.clearCookie('alert')
        }
        if(is_admin == true) {
            db.query("SELECT id,title FROM contents ORDER BY id DESC", (err,contents) => {
                if(err) throw err;
                if(alert != undefined) {
                    res.render("admin/home", {contents:contents,alert:alert,is_admin:is_admin})
                    res.end()
                } else {
                    res.render("admin/home", {contents:contents,is_admin:is_admin})
                    res.end()
                }
            })
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })

    app.get("/admin/login", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(req.cookies.alert != undefined) {
            var alert = req.cookies.alert
            res.clearCookie('alert')
        }
        if(is_admin == true) {
            res.redirect("/admin")
            res.end()
        } else {
            res.render("admin/login", {alert:alert})
            res.end()
        }
    })

    app.get('/admin/logout', (req,res) => {
        if (req.session.loggedin) {
            timeStamp('[+] '+req.signedCookies.login_info+' has been logged out.')
            req.session.destroy()
            res.clearCookie('login_info')
            res.cookie('alert', 'loggedout')
            res.redirect('/admin/login')
            res.end()
        } else {
            res.redirect('/admin/login')
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
                res.cookie('alert', "loggedin")
                res.redirect('/admin')
                timeStamp('[+] Login Successfully for '+username)
                res.end()
            } else {
                res.cookie('alert', 'wrongpassword')
                res.redirect('/admin/login')
                res.end()
            }
        })
    })

    // Create Edit Delete Contents
    app.get("/admin/contents/add", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        var admin_info = require('./modules/get_admin_info')(req,res)
        if(is_admin == true) {
            res.render('admin/contents/add', {
                is_admin:is_admin,
                admin_info:admin_info[0],
                is_admin:is_admin
            })
            res.end()
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })
    app.post("/admin/contents/add", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            var title = req.body.title
            var contents = req.body.contents
            var writter = req.body.writter
            var cover = req.body.cover
            var category = req.body.category
            var is_show = req.body.is_show

            if(is_show != 1) {
                is_show = 0
            }

            db.query("INSERT INTO contents(title,contents,writter,cover,category,is_show) VALUES(?,?,?,?,?,?)", 
            [title,contents,writter,cover,category,is_show], (err,result) => {
                if(err) throw err;
                timeStamp('[+] Inserted '+title+' into contents')
                res.redirect('/admin')
                res.end()
            })
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })
    app.get("/admin/contents/edit/:id", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            if(req.cookies.alert != undefined) {
                var alert = req.cookies.alert
                res.clearCookie('alert')
            }
            var id = req.params.id
            db.query("SELECT * FROM contents WHERE id = ? LIMIT 1", [id], (err,content) => {
                if(err) throw err;
                if(content.length > 0) {
                    if(alert != undefined) {
                        res.render('admin/contents/edit', {content:content[0],alert:alert,is_admin:is_admin})
                        res.end()
                    } else {
                        res.render('admin/contents/edit', {content:content[0],is_admin:is_admin})
                        res.end()
                    }
                } else {
                    timeStamp("[!] Cannot Fetch Contents id = "+id)
                }
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
            var cover = req.body.cover
            var category = req.body.category
            var is_show = req.body.is_show
            if(is_show != 1) {
                is_show = 0
            }
            db.query("UPDATE contents SET title = ?, contents = ?, writter = ?, cover = ?, category = ?, is_show = ? WHERE id = ?",
            [title,content,writter,cover,category,is_show,id], (err,result) => {
                if(err) throw err
                res.cookie('alert', 'successfullyupdate')
                res.redirect('/admin/contents/edit/'+id)
                res.end()
            })
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })
    app.get("/admin/contents/delete/:id", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            var id = req.params.id
            db.query("DELETE FROM contents WHERE id = ?", [id], (err,result) => {
                if(err) throw err
                res.cookie('alert', 'successfullydelete')
                res.redirect('/admin')
                res.end()
            })
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })
    
    // Profile Management
    app.get("/admin/profile", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            if(req.cookies.alert != undefined) {
                var alert = req.cookies.alert
                res.clearCookie('alert')
            }
            const admin_info = get_admin_info(req)
            const admin_username = admin_info[0]
            const admin_password = admin_info[1]
            db.query("SELECT id FROM admin WHERE username = ? AND password = ?", [admin_username,admin_password], (err,admin_id) => {
                if(err) throw err;
                admin_id = admin_id[0]
                db.query("SELECT * FROM profile WHERE admin = ?", [admin_id], (err,profile) => {
                    if(err) throw err;
                    if(alert != undefined) {
                        res.render('admin/profile',{profile:profile,alert:alert,is_admin:is_admin})
                        res.end()
                    } else {
                        res.render('admin/profile',{profile:profile,is_admin:is_admin})
                        res.end()
                    }
                })
            })
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })
    app.post('/admin/profile/edit', (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            const admin_info = get_admin_info(req)
            const admin_username = admin_info[0]
            const admin_password = admin_info[1]
            
            const name = req.body.name
            const bio = req.body.bio
            const picture = req.body.picture

            db.query("SELECT id FROM admin WHERE username = ? AND password = ?", [admin_username,admin_password], (err,admin_id) => {
                if(err) throw err;
                admin_id = admin_id[0]
                db.query("UPDATE profile SET name = ?, bio = ?, picture = ? WHERE admin = ?", [name,bio,picture,admin_id], (err,result) => {
                    if(err) throw err;
                    res.cookie('alert', 'successfullyupdate')
                    res.redirect('/admin/profile')
                    res.end()
                })
            })
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })

    // Change Password
    app.get("/admin/change_password", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            if(req.cookies.alert != undefined) {
                var alert = req.cookies.alert
                res.clearCookie('alert')
            }
            if(alert != undefined) {
                res.render('admin/change_password', {alert:alert,is_admin:is_admin})
                res.end()
            } else {
                res.render('admin/change_password', {is_admin:is_admin})
                res.end()
            }
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })
    app.post("/admin/change_password", (req,res) => {
        var is_admin = require('./modules/check_admin')(req,res)
        if(is_admin == true) {
            const admin_info = get_admin_info(req)
            const admin_username = admin_info[0]
            const admin_password = admin_info[1]

            const current_password = req.body.current_password
            const new_password = req.body.new_password

            db.query("SELECT password FROM admin WHERE password = ?", [sha256(current_password)], (err,check_password) => {
                if(err) throw err;
                if(check_password.length > 0) {
                    db.query("UPDATE admin SET password = ? WHERE username = ? AND password = ?", [sha256(new_password),admin_username,admin_password], (err,result) => {
                        if(err) throw err;
                        res.cookie('alert', 'successfullyupdate')
                        res.redirect('/admin/logout')
                        res.end()
                    })
                } else {
                    res.cookie('alert', 'wrongpassword')
                    res.redirect('/admin/change_password')
                    res.end()
                }
            })
        } else {
            res.redirect("/admin/login")
            res.end()
        }
    })
}