//Requires Basic Modules
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const path = require('path')
//Require Cookie Parser Module
const cookieParser = require('cookie-parser')
//Require Encryption Module
const crypto = require('crypto')

//App Settings
const app = express()
let port = 4444

//Require Database
var db = require('./database')
const { end } = require('./database')

//Set Static path (default: "/public")
app.use(express.static(path.join(__dirname, "/public")))

//Set Views path (default: "views")
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//bodyParser Config
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

//Cookie Secret Strings (* Please change!)
app.use(cookieParser('SunnyFrameworkBabyyyyyyy')) 

//Session Config
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}))

//Customs Functions
function timeStamp(message){
    console.log('[' + new Date().toLocaleString('en-GB', {
        timezone:'Asia/Bangkok'
    }).substring(11,23) + ' ] ->', message)
}

//Routing
require('./routes/admin')(app)

//Start Listening
app.listen(process.env.PORT || port,() => {
    timeStamp("[+] Sunny-Framework has been started at default port or "+port)
})

//Customs Route
app.get('/', (req,res) => {
    var show_on_page = "articles"

    if(req.signedCookies.admin_info != undefined) {
        if(!req.session.admin) {
            req.session.admin = true
            req.session.admin_info = req.signedCookies.admin_info
        }
    }

    db.query('SELECT * FROM '+show_on_page+' ORDER BY id DESC', (err,result) => {
        db.query('SELECT * FROM menu', (err,menu) => {
            if(err) throw err
            res.render('home', {
                nav:'home',
                result:result,
                menu:menu
            })
            res.end()
        })
    })
})

app.get('/:table', (req,res) => {
    var table = req.params.table
    var lists_layout = "lists-01"
    const onlyLettersPattern = /^[A-Za-z]+$/
    if(table.match(onlyLettersPattern)) {
        db.query('SELECT * FROM '+table+' ORDER BY id DESC', (err,result) => {
            if(err) throw err
            db.query('SELECT * FROM menu', (err,menu) => {
                if(err) throw err
                res.render(lists_layout, {
                    nav:table,
                    menu:menu,
                    result:result
                })
                res.end()
            })
        })
    } else {
        res.send("Only Charactor and Number are allowed.")
        res.end()
    }
})

app.get('/:table/:id', (req,res) => {
    if(req.params.table) {
        var table = req.params.table
        var read_layout = "read-01"
        const onlyLettersPattern = /^[A-Za-z]+$/
        if(table.match(onlyLettersPattern)) {
            if(req.params.id) {
                var id = req.params.id
                db.query('SELECT * FROM '+table+' WHERE id = ?', [id], (err,result) => {
                    if(err) throw err
                    db.query('SELECT * FROM menu', (err,menu) => {
                        if(err) throw err
                        res.render(read_layout, {
                            nav:table,
                            menu:menu,
                            page:id,
                            result:result
                        })
                        res.end()
                    })
                })
            }
        } else {
            res.send("Only Charactor and Number are allowed.")
            res.end()
        }
    }
})

//Error Page
app.get('*', (req, res) => {
    res.status(404).render('error', {error:'404',nav:'error'})
})