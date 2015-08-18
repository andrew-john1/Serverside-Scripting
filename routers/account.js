var express = require('express');
var router = express.Router();

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
        res.render('account/login', {
            req: req
        });
    }
});

router.get('/change', function(req, res) {
    var data = { req: req };
    res.render('account/change', data);
});

router.post('/change', function(req, res) {
    req.getConnection(function(err, connection){
        connection.query('UPDATE users SET email = "' + req.body.email + '", password = "' + req.body.password + '", name = "' + req.body.username + '" WHERE users.id = "' + req.session.userid + '" '),
            function(err, users) {
                if(err){
                    console.log(err);
                } else {
                    console.log(users);
                }
            };
        console.log(req.session.userid);
        req.session.email = req.body.email;
        req.session.username = req.body.username;
        res.redirect(req.baseUrl + '/');
    });
});

router.post('/login', function(req, res) {
    req.getConnection(function(err, connection){
        if(err){
            return next(err);
        }
        connection.query('SELECT * FROM users WHERE email = ("' + req.body.email + '") AND password = ("' + req.body.password + '")', function(err, users){

            var users = users;

            if(users.length === 0) {
                var data = {
                    req: req,
                    input: req.body,
                    error: "De inloggegevens zijn niet correct."
                };
                delete data.input.password;
                return res.render('account/login', data);
            }

            users.forEach(function(user) {
                var useremail = user.email;
                var userpassword = user.password;
                var userid = user.id;

                if((useremail === req.body.email) && (userpassword === req.body.password)) {
                    req.session.userid = userid;
                    req.session.email = req.body.email;

                    res.redirect(req.baseUrl + '/');
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
        connection.query('INSERT INTO users (email, password, name) VALUES ("' + req.body.email + '", "' + req.body.password + '", "' + req.body.username + '")',
            function(err, users) {
            if(err){
                console.log(err);
            } else {
                console.log(users);
            }
        });
        req.session.email = req.body.email;
        req.session.username = req.body.username;
        res.redirect(req.baseUrl + '/');
    });
});

router.get('/logout', function(req, res) {
    if(!req.session.email) {
        res.redirect(req.baseUrl );
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

router.get('/delete/', function(req, res) {
    var index = req.param;
    res.send
});

module.exports = router;