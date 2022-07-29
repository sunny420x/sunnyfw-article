module.exports = function(app){
    var db = require('../database')
    const crypto = require('crypto')

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
            req.session.destroy()
            res.clearCookie('admin_info')
        }       
        res.redirect('/admin')
        res.end()
    })
    app.post('/admin/login', (req,res) => {
        const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex')
        var username = req.body.username
        var password = sha256(req.body.password)

        db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username,password], (err,result) => {
            if(result.length > 0) {
                req.session.admin = true
                req.session.admin_info = username
                res.cookie('admin_info', username+"&"+password, {signed: true, maxAge: 24 * 60 * 60 * 1000})
                res.redirect('/admin')
                res.end()
            } else {
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
    app.get('/admin/menu/add', (req,res) => {
        if(req.session.admin) {
            res.render('admin/add_menu',{admin_name:req.session.admin_info,nav:'menu'})
            res.end()
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.post('/admin/menu/add', (req,res) => {
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

    //Web Content Route
    app.get('/admin/web_content', (req,res) => {
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
    app.get('/admin/web_content/add', (req,res) => {
        if(req.session.admin) {
            res.render('admin/add_web_content',{admin_name:req.session.admin_name,nav:'web_content'})
            res.end()
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })
    app.post('/admin/web_content/add', (req,res) => {
        if(req.session.admin) {
            var name = req.body.name
            var content = req.body.content
            var addby = req.session.admin_name

            db.query("INSERT INTO web_content(name,content,addby) VALUES(?,?,?)", [name,content,addby], (err,result) => {
                if(err) {
                    throw err
                } else {
                    res.redirect('/admin/web_content')
                    res.end()
                }
            })
        } else {
            res.redirect('/admin/login')
            res.end()
        }
    })

    //Install tables
    app.get('/install', (req,res) => {
        let check_lists = ["SELECT 1 FROM admin WHERE username = 'admin'",
        'SELECT 1 FROM article',
        'SELECT 1 FROM setting']
        let status = [false,false,false]
        // let status = hit_mysql_data(check_lists)

        // if(status.length == check_lists.length) {
        //     console.log(status)
        //     res.render('admin/install', {admin_status:status[0],article_status:status[1],setting_status:status_now[2]})
        //     res.end()
        // }
        
        db.query(check_lists[0], (err, admin_status) => {
            db.query(check_lists[1], (err, article_status) => {
                db.query(check_lists[2], (err, setting_status) => {
                    res.render('admin/install', {admin_status:admin_status,article_status:article_status,setting_status:setting_status})
                    res.end()
                })
            })
        })
    })
    app.get('/install/admindb', (req,res) => {
        var create_admindb = "CREATE TABLE admin (id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE,password VARCHAR(200) NOT NULL)"
        db.query(create_admindb, (err,result) => {
            if (err) throw err
            res.redirect('/install')
            res.end()
        })
    })
    app.get('/install/adminuser', (req,res) => {
        const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex')
        var password = sha256(default_password)
        db.query("INSERT INTO admin(username,password) VALUES(?,?)", ['admin',password], (err,result) => {
            res.redirect('/install')
            res.end()
        })
    })
    app.get('/install/articledb', (req,res) => {
        var create_admindb = "CREATE TABLE article (id INT(12) UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(100) NOT NULL,content VARCHAR(20000) NOT NULL, img VARCHAR(200) NOT NULL, time VARCHAR(50) NOT NULL, postby VARCHAR(50) NOT NULL)"
        db.query(create_admindb, (err,result) => {
            if (err) throw err
            res.redirect('/install')
            res.end()
        })
    })
    app.get('/install/settingdb', (req,res) => {
        var create_settingdb = "CREATE TABLE setting (id INT(12) UNSIGNED AUTO_INCREMENT PRIMARY KEY, command VARCHAR(100) NOT NULL UNIQUE,value VARCHAR(100) NOT NULL, addby VARCHAR(50) NOT NULL)"
        var insert_dafault = "INSERT INTO setting(command,value,addby) VALUES('web_name','This is web name!','app')"
        db.query(create_settingdb, (err,result) => {
            if (err) throw err
            res.redirect('/install')
            res.end()
        })
    })
    app.get('/install/textdb', (req,res) => {
        var create_textdb = "CREATE TABLE texts (id INT(12) UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE, content VARCHAR(20000) NOT NULL)"
        var insert_dafault = [
            "INSERT INTO texts(name,content) VALUES('home-title','This is default home-title')",
            "INSERT INTO texts(name,content) VALUES('home-para','This is default home-para')",
            "INSERT INTO texts(name,content) VALUES('nav-about','This is default nav-about')"
        ]

        db.query(create_textdb, (err,result) => {
            if(err) throw err
            for(const i of insert_dafault) {
                db.query(insert_dafault[i], (err, result) => {
                    if(err) throw err
                })
            }
            res.redirect('/install')
            res.end()
        })
    })
}