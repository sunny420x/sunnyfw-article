module.exports = (app) => {
    let db = require('../database')

    //Check Database and tables and auto-install
    function check_install() {
        db.query("SELECT * FROM admin", (err,result) => {
            if(result < 1 || err) {
                return false;
            }
        })
        return true;
    }

    //Home Page
    app.get("/", (req,res) => {
        const is_admin = require('./modules/check_admin')
        if(check_install() != true) {
            require('./routes/install')(sha256)
            res.redirect("/")
            res.end()
        }
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

    //About Page
    app.get("/about", (req,res) => {
        db.query("SELECT * FROM profile ORDER BY id ASC", (err,profile) => {
            if(err) throw err;
            res.render('about', {profile:profile})
            res.end()
        })
    })

    //Read Page
    app.get("/read/:id", (req,res) => {
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
                        profile:profile
                    })
                    res.end()
                })
            })
        })
    })
}