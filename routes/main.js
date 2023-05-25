module.exports = (app,sha256) => {
    let db = require('../database')
    require('./install')(app,sha256)

    //Home Page
    app.get("/", (req,res) => {
        const is_admin = require('./modules/check_admin')(req,res)
        var alert
        db.query("SELECT * FROM contents ORDER BY id DESC LIMIT 0,6", (err,contents) => {
            if(err && err.code == "ER_NO_SUCH_TABLE") {
                res.redirect('/install')
                res.end()
            }
            db.query("SELECT category FROM contents GROUP BY category", (err,category) => {
                if(err) throw err;
                if(req.cookies.alert != undefined) {
                    alert = req.cookies.alert
                    res.clearCookie('alert')
                }
                res.render('home', {
                    contents:contents,
                    category:category,
                    alert:alert,
                    is_admin:is_admin
                })
                res.end()
            })
        })
    })

    //About Page
    app.get("/about", (req,res) => {
        const is_admin = require('./modules/check_admin')(req,res)
        db.query("SELECT * FROM profile ORDER BY id ASC", (err,profile) => {
            if(err) throw err;
            res.render('about', {profile:profile,is_admin:is_admin})
            res.end()
        })
    })

    //Articles Page
    app.get("/articles", (req,res) => {
        const is_admin = require('./modules/check_admin')(req,res)
        var alert
        db.query("SELECT * FROM contents ORDER BY id DESC", (err,contents) => {
            if(err) throw err;
            db.query("SELECT category FROM contents GROUP BY category", (err,category) => {
                if(err) throw err;
                if(req.cookies.alert != undefined) {
                    alert = req.cookies.alert
                    res.clearCookie('alert')
                }
                res.render('articles', {
                    contents:contents,
                    category:category,
                    alert:alert,
                    is_admin:is_admin
                })
                res.end()
            })
        })
    })
    app.get("/articles/category/:category", (req,res) => {
        const category = req.params.category
        const is_admin = require('./modules/check_admin')(req,res)
        var alert
        db.query("SELECT * FROM contents WHERE category = ? ORDER BY id DESC", [category], (err,contents) => {
            if(err) throw err;
            db.query("SELECT category FROM contents GROUP BY category", (err,category) => {
                if(err) throw err;
                if(req.cookies.alert != undefined) {
                    alert = req.cookies.alert
                    res.clearCookie('alert')
                }
                res.render('articles', {
                    contents:contents,
                    category:category,
                    alert:alert,
                    is_admin:is_admin
                })
                res.end()
            })
        })
    })
    app.get("/articles/:id", (req,res) => {
        const is_admin = require('./modules/check_admin')(req,res)
        var id = req.params.id
        db.query("SELECT * FROM contents WHERE id = ? LIMIT 1", [id], (err,result) => {
            if(err) throw err;
            var writter = result[0].writter
            db.query("SELECT * FROM contents WHERE id != ? ORDER BY id DESC LIMIT 5", [id],(err,more_contents) => {
                if(err) throw err;
                db.query("SELECT * FROM profile WHERE admin = ?", [writter], (err,profile) => {
                    if(err) throw err;
                    res.render('read', {
                        result:result,
                        more_contents:more_contents,
                        profile:profile,
                        is_admin:is_admin
                    })
                    res.end()
                })
            })
        })
    })
}