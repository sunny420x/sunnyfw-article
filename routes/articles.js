module.exports = function(app){
    var db = require('../database')

    app.get('/article', (req,res) => {
        db.query('SELECT * FROM articles ORDER BY id DESC', (err,result) => {
            if(err) throw err
            res.render('articles', {
                nav:'article',
                result:result
            })
            res.end()
        })
    })
    app.get('/article/:id', (req,res) => {
        if(req.params.id)
        var id = req.params.id
        db.query('SELECT * FROM articles WHERE id = ?', [id], (err,result) => {
            if(err) throw err
            res.render('read_article', {
                nav:'article',
                page:id,
                result:result
            })
            res.end()
        })
    })
}