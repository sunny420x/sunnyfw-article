module.exports = (req) => {
    const db = require('../../database')
    var admin_info = req.signedCookies.login_info
    return admin_info = admin_info.split(":")
}