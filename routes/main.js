module.exports = (app) => {
    let db = require('../database')
    app.get("/", (req,res) => {
        db.query("SELECT * FROM contents ORDER BY id DESC LIMIT 0,6", (err,contents) => {
            if(err) throw err;
            res.render('home', {contents:contents})
            res.end()
        })
    })

    app.get("/about", (req,res) => {
        res.render('about')
        res.end()
    })
}