const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const path = require('path')
const cookieParser = require('cookie-parser')
const crypto = require('crypto')
require('dotenv').config({ path: path.join(__dirname, '.env') });

//App Settings
const app = express()
let port = process.env.PORT

//Require Database
var db = require('./database')

//Set Static path (default: "/public")
app.use(express.static(path.join(__dirname, "/public")))

//Set Views path (default: "views")
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//bodyParser Config
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

//Cookie Secret Strings (* Please change!)
app.use(cookieParser('Sunny-FrameworkBaby~')) 

//Session Config
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}))

//Routing
const timeStamp = require('./routes/modules/timestamp')
require('./routes/main')(app)

//Check Database and tables and auto-install
db.query("SELECT * FROM admin", (err,result) => {
	if(err || result.length < 1) {
		require('./routes/install')(app)
	}
})
//Start Listening
app.listen(process.env.PORT || port,() => {
    timeStamp("[+] Sunny-Framework has been started at default port or "+port)
})

//Customs Route

//Error Page
app.get('*', (req, res) => {
    res.status(404).render('error', {error:'404',nav:'error'})
})