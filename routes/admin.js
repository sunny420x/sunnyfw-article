module.exports = function(app){
    var db = require('../database')
    const crypto = require('crypto')

    function timeStamp(message){
        console.log('[' + new Date().toLocaleString('en-GB', {
            timezone:'Asia/Bangkok'
        }).substring(11,23) + ' ] ->', message)
    }

    //Variables Settings
    var default_password = "adminadmin"
    const onlyLettersPattern = /^[A-Za-z]+$/

    function gettime() {
        let ts = Date.now()
    
        let date_ob = new Date(ts)
        let date = date_ob.getDate()
        let month = date_ob.getMonth() + 1
        let year = date_ob.getFullYear()
    
        // prints date & time in YYYY-MM-DD format
        let result = date + "/" + month + "/" + year
        return result
    }
    
    //Admin
    app.get('/admin', (req,res) => {
        if(req.signedCookies.admin_info != undefined) {
            if(!req.session.admin) {
                req.session.admin = true
                req.session.admin_info = req.signedCookies.admin_info
            }
        }

        if(req.session.admin) {
            res.render('admin/home',{
                admin_name:req.session.admin_name,
                nav:'home'
            })
            res.end()
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.get('/admin/login', (req,res) => {
        if(req.signedCookies.admin_info != undefined) {
            if(!req.session.admin) {
                req.session.admin = true
                req.session.admin_info = req.signedCookies.admin_info
                timeStamp('[+] Login By Cookie for '+req.session.admin_info)
            }
        }

        if(req.session.admin) {
            res.redirect('/admin')
            res.end()
        } else {
            res.render('login')
            res.end()
        }
    })
    app.get('/admin/logout', (req,res) => {
        if(req.session.admin) {
            timeStamp('[+] '+req.signedCookies.admin_info+' has been logged out.')
            req.session.destroy()
            res.clearCookie('admin_info')
        }       
        res.redirect('/admin')
        res.end()
    })
    app.post('/admin/login', (req,res) => {
        const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex')
        var username = req.body.username
        var password = req.body.password
        var password_hash = sha256(req.body.password)

        db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username,password_hash], (err,result) => {
            if(result.length > 0) {
                req.session.admin = true
                req.session.admin_info = username
                res.cookie('admin_info', username+":"+password_hash, {signed: true, maxAge: 24 * 60 * 60 * 1000})
                timeStamp('[+] Login OK for '+username)
                res.redirect('/admin')
                res.end()
            } else {
                timeStamp('[!] Login Deny for '+username+':'+password+' -> Error: '+err)
                res.redirect('/admin/login')
                res.end()
            }
        })
    })
    app.get('/admin/:table', (req,res) => {

        if(req.session.admin) {
            var table = req.params.table
            if(table.match(onlyLettersPattern)) {
                db.query("SELECT * FROM "+table+" ORDER BY id DESC", (err,result) => {
                    if(err) throw err
                    res.render('admin/'+table,{admin_name:req.session.admin_name,nav:table,result:result})
                    res.end()
                })
            } 
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.get('/admin/:table/edit/:id', (req,res) => {

        if(req.session.admin) {
            let id = req.params.id
            var table = req.params.table
            console.log(table)
            //if(table.match(onlyLettersPattern)) {
                if(id) {
                    db.query("SELECT * FROM "+table+" WHERE id = ?", [id], (err,result) => {
                        if(err) {
                            throw err
                        } else {
                            if(result.length > 0) {
                                res.render('admin/edit_article', {admin_name:req.session.admin_name,nav:table,result:result})
                                res.end()
                            } else {
                                res.send('[-] No row')
                                res.end()
                            }
                        }
                    })
                //}
            }
        } else {
            res.redirect('/admin/login')
            res.end() 
        }
    })
    app.post('/admin/:table/edit/:id', (req,res) => {
        if(req.session.admin) {
        let id = req.params.id
        var title = req.body.title
        var time = req.body.time
        var postby = req.body.postby
        var content = req.body.content
        var img = req.body.img

        var table = req.params.table
        if(table.match(onlyLettersPattern)) {
            if(id) {
                db.query("UPDATE "+table+" SET title = ?, content = ?, img = ?, time = ?, postby = ? WHERE id = ?", [title,content,img,time,postby,id], (err,result) => {
                    if(err) {
                        throw err
                    } else {
                        if(result) {
                            res.redirect('/admin/'+table+'/edit/'+id)
                            res.end()
                        } else {
                            res.redirect('/admin/login')
                            res.end()
                        }
                    }
                })
            }
        }
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.get('/admin/:table/add', (req,res) => {

        if(req.session.admin) {
            var table = req.params.table
            if(table.match(onlyLettersPattern)) {
                res.render('admin/add_article',{admin_name:req.session.admin_name,nav:table})
                res.end()
            }
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.post('/admin/:table/add', (req,res) => {

        if(req.session.admin) {
            var title = req.body.title
            var content = req.body.content
            var img = req.body.img
            var postby = "admin"
            var time = gettime()

            var table = req.params.table
            if(table.match(onlyLettersPattern)) {
                db.query("INSERT INTO "+table+"(title,content,img,postby,time) VALUES(?,?,?,?,?)", [title,content,img,postby,time], (err,result) => {
                    if(err) {
                        throw err
                    } else {
                        res.redirect('/admin/'+table)
                        res.end()
                    }
                })
            }
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.get('/admin/:table/delete/:id', (req,res) => {
 
        if(req.session.admin) {
            var id = req.params.id
            var table = req.params.table
            if(table.match(onlyLettersPattern)) {
                db.query("DELETE FROM "+table+" WHERE id = ?", [id], (err,result) => {
                    if(err) {
                        throw err
                    } else {
                        res.redirect('/admin/'+table)
                        res.end()
                    }
                })
            }
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })

    //Web Setting Route
    app.get('/admin/setting', (req,res) => {
        if(req.session.admin) {
            db.query("SELECT * FROM setting ORDER BY id DESC", (err,result) => {
                if(err) throw err
                res.render('admin/setting',{admin_name:req.session.admin_info,nav:'setting',result:result})
                res.end()
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.get('/admin/setting/add', (req,res) => {
        if(req.session.admin) {
            res.render('admin/add_setting',{admin_name:req.session.admin_info,nav:'setting'})
            res.end()
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.post('/admin/setting/add', (req,res) => {
        if(req.session.admin) {
            var command = req.body.command
            var value = req.body.value
            var addby = req.session.admin_name

            db.query("INSERT INTO setting(command,value,addby) VALUES(?,?,?)", [command,value,addby], (err,result) => {
                if(err) {
                    throw err
                } else {
                    res.redirect('/admin/setting')
                    res.end()
                }
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })

    //Web Menu Route
    app.get('/admin/menu', (req,res) => {
        if(req.session.admin) {
            db.query("SELECT * FROM menu ORDER BY id DESC", (err,result) => {
                if(err) throw err
                res.render('admin/setting',{admin_name:req.session.admin_info,nav:'menu',result:result})
                res.end()
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.get('/admin/web/menu/edit/:id', (req,res) => {
        var id = req.params.id
        if(req.session.admin) {
            db.query("SELECT * FROM menu WHERE id = ?", [id], (err,result) => {
                if(err) throw err
                res.render('admin/edit_menu',{admin_name:req.session.admin_info,nav:'menu',result:result})
                res.end()
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.post('/admin/web/menu/edit/:id', (req,res) => {
        var id = req.params.id
        var name = req.body.name
        var url = req.body.url
        if(req.session.admin) {
            db.query('UPDATE menu SET name = ?, url = ? WHERE id = ?', [name,url,id], (err,result) => {
                if(err) throw err
                res.redirect('/admin/menu')
                res.end()
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.get('/admin/web/menu/add', (req,res) => {
        if(req.session.admin) {
            res.render('admin/add_menu',{admin_name:req.session.admin_info,nav:'menu'})
            res.end()
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.post('/admin/web/menu/add', (req,res) => {
        if(req.session.admin) {
            var name = req.body.name
            var url = req.body.url

            db.query("INSERT INTO menu(name,url) VALUES(?,?)", [name,url], (err,result) => {
                if(err) {
                    throw err
                } else {
                    res.redirect('/admin/menu')
                    res.end()
                }
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.get('/admin/web/menu/delete/:id', (req,res) => {
        var id = req.params.id
        if(req.session.admin) {
            db.query("DELETE FROM menu WHERE id = ?", [id], (err,result) => {
                if(err) throw err
                res.redirect('/admin/menu')
                res.end()
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })

    //Web Content Route
    app.get('/admin/web/contents', (req,res) => {
        if(req.session.admin) {
            db.query("SELECT * FROM web_content ORDER BY id DESC", (err,result) => {
                if(err) throw err
                res.render('admin/web_content',{admin_name:req.session.admin_name,nav:'web_content',result:result})
                res.end()
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.get('/admin/web/contents/add', (req,res) => {
        if(req.session.admin) {
            res.render('admin/add_web_content',{admin_name:req.session.admin_name,nav:'web_content'})
            res.end()
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.post('/admin/web/contents/add', (req,res) => {
        if(req.session.admin) {
            var name = req.body.name
            var content = req.body.content
            var addby = "admin"

            db.query("INSERT INTO web_content(name,content,addby) VALUES(?,?,?)", [name,content,addby], (err,result) => {
                if(err) {
                    throw err
                } else {
                    res.redirect('/admin/web/contents')
                    res.end()
                }
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.get('/admin/web/contents/edit/:id', (req,res) => {
        var id = req.params.id
        if(req.session.admin) {
            db.query("SELECT * FROM web_content WHERE id = ?", [id], (err,result) => {
                if(err) throw err
                res.render('admin/edit_web_content',{admin_name:req.session.admin_name,nav:'web_content',result:result})
                res.end()
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.post('/admin/web/contents/edit/:id', (req,res) => {
        if(req.session.admin) {
            var id = req.params.id
            var name = req.body.name
            var content = req.body.content
            var addby = req.body.addby

            db.query("UPDATE web_content SET name = ?, content = ?, addby = ? WHERE id = ?", [name,content,addby,id], (err,result) => {
                if(err) {
                    throw err
                } else {
                    res.redirect('/admin/web/contents')
                    res.end()
                }
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.get('/admin/web/contents/delete/:id', (req,res) => {
        var id = req.params.id
        if(req.session.admin) {
            db.query("DELETE FROM web_content WHERE id = ?", [id], (err,result) => {
                if(err) throw err
                res.redirect('/admin/web/contents')
                res.end()
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
}