var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');

router.get('/', function(req, res) {
    if(req.session.email) {
        req.getConnection(function(err, connection){
            if(err){ return next(err); }
            connection.query('SELECT users.name , users.id , photos.caption , photos.filename FROM users LEFT JOIN photos ON users.id = photos.user_id WHERE email = ("' + req.session.email + '")',
                function(err, users){
                    if(err){ console.log(err); }
                    users.forEach(function(user) {
                        req.session.userId = user.id;
                        req.session.username = user.name;
                        req.session.caption = user.caption;
                        req.session.filename = user.filename;
                    });
                    res.render('account/index', {users: users, req: req});
            });
        });

    } else {
        var passedVariable = req.session.valid;
        req.session.valid = null;
        res.render('account/login', {
            req: req,
            passedVariable: passedVariable,
            loginError: "U moet eerst ingelogd zijn om een foto te kunnen uploaden."
        });
    }
});

router.get('/change', function(req, res) {
    var data = { req: req };
    res.render('account/change', data);
});

router.post('/change', function(req, res) {
    req.getConnection(function(err, connection){

        var email = req.body.email;
        var username = req.body.username;
        var hash = bcrypt.hashSync(req.body.password);

        connection.query('UPDATE users SET email = "' + email + '", password = "' + hash + '", name = "' + username + '" WHERE users.id = "' + req.session.userId + '" '),
            function(err, users) {
                if(err){
                    console.log(err);
                } else {
                    console.log(users);
                }
            };
        req.session.email = email;
        req.session.username = username;
        res.redirect(req.baseUrl + '/');
    });
});

router.post('/login', function(req, res) {
    req.getConnection(function(err, connection){
        if(err){
            return next(err);
        }
        connection.query('SELECT * FROM users WHERE email = ("' + req.body.email + '")', function(err, users){

            var users = users;

            if(users.length === 0) {
                var data = {
                    req: req,
                    input: req.body,
                    error: "Het ingevulde email adres is niet correct."
                };
                return res.render('account/login', data);
            }

            users.forEach(function(user) {
                var userEmail = user.email;
                var userPassword = user.password;
                var userId = user.id;

                if(bcrypt.compareSync(req.body.password, userPassword)) {
                    req.session.userId = userId;
                    req.session.email = userEmail;

                    res.redirect(req.baseUrl + '/');
                } else {
                    var data = {
                        req: req,
                        input: req.body,
                        error: "Het ingevulde wachtwoord is niet correct."
                    };
                    return res.render('account/login', data);
                }
            });
        });
    });
});

router.get('/new', function(req, res) {
    if(req.session.email) {
        var data = {
            req: req,
            error: "U hebt al een account en kan geen tweede aanmaken."
        };
        res.render('account/new', data);
    } else {
        var data = {req: req };
        res.render('account/new', data);
    }
});

router.post('/new', function(req, res) {
    req.getConnection(function(err, connection){
        var email = req.body.email;
        var hash = bcrypt.hashSync(req.body.password);
        var username = req.body.username;

        connection.query('INSERT INTO users (email, password, name) VALUES ("' + email + '", "' + hash + '", "' + username + '")',
            function(err, users) {
            if(err){
                console.log(err);
            } else {
                console.log(users);
            }
        });
        req.session.email = email;
        req.session.username = username;
        res.redirect(req.baseUrl + '/');
    });
});

router.get('/logout', function(req, res) {
    if(!req.session.email) {
        var data = {
            req: req,
            error: "U bent al uitgelogd."
        };
        res.render('account/login', data);
    } else {
        var data = {req: req};
        res.render('account/logout', data);
    }
});

router.post('/logout', function(req, res) {
    var logout = req.body.logout;
    if(logout) {
        req.session.destroy();
        res.redirect('/account');
    }
});

module.exports = router;