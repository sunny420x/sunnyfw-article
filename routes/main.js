module.exports = (app,sha256) => {
    let db = require('../database')

    //Home Page
    app.get("/", (req,res) => {
        const is_admin = require('./modules/check_admin')(req,res)
        db.query("SELECT * FROM contents ORDER BY id DESC LIMIT 0,6", (err,contents) => {
            if(err) throw err;
            db.query("SELECT category FROM contents GROUP BY category", (err,category) => {
                if(err) throw err;
                if(is_admin != undefined) {
                    res.render('home', {
                        contents:contents,
                        category:category,
                        is_admin:is_admin
                    })
                } else {
                    res.render('home', {
                        contents:contents,
                        category:category
                    })
                }
                res.end()
            })
        })
    })

    app.get("/install", (req,res) => {
        db.query("SELECT * FROM admin,products", (err,result) => {
            if(err) {
                if(err.code = "ER_NO_SUCH_TABLE") {
                    require('./install')(sha256)
                    res.cookie('alert', 'successfullyinstall')
                    res.redirect("/")
                    res.end()
                }
            } else {
                res.redirect("/")
                res.end()
            }
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

    //Read Page
    app.get("/read/:id", (req,res) => {
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