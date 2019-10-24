// var exports = module.exports = {};
module.exports = {
    'isLoggedIn': function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.session.oldUrl = req.originalUrl;
        res.redirect('../user/signin');
    },
    'notLoggedIn': function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }
}