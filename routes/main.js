module.exports = (app) => {
    app.get("/", (req,res) => {
        res.render('home')
        res.end()
    })

    app.get("/about", (req,res) => {
        res.render('about')
        res.end()
    })
}