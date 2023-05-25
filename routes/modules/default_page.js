module.exports = (err) => {
    var timeStamp = require('../modules/timestamp')

    if(err.code == ER_NO_SUCH_TABLE) {
        res.render('default')
        res.end()
    }
}