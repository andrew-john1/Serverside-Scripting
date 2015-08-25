var express = require('express');
var fs = require('fs');
var router = express.Router();

var filesPath = (__dirname + '/../uploads/');

router.use(function(req, res, next) {
    res.locals.req = req;
    next();
});

router.get('/', function(req, res) {
    fs.readdir(filesPath, function(err, files) {
        res.locals.files = files;
        res.render('index');
    });
});

router.get('/:filename/details', function(req, res){
    req.getConnection(function(err, connection) {
        if (err) {
            return next(err);
        }

        var newParams = req.params.filename;
        var newParams = newParams.substring(0,3);

        connection.query('SELECT users.name , photos.* , comments.photo_id , comments.created_at , comments.comment FROM users LEFT JOIN photos ON users.id = photos.user_id LEFT JOIN comments ON photos.id = comments.photo_id WHERE caption = ("' + newParams + '")', function (err, photoData) {
            var photoData = photoData;
            photoData.forEach(function(item) {
                req.session.photoId = item.id;
                req.session.caption = item.caption;
                req.session.userName = item.name;
                req.session.filename = item.filename;
                req.session.date = item.created_at;
                req.session.comment = item.comment;
            });
            console.log(photoData);
            var filePath = req.params.filename;
            res.render('details', {file: filePath, photoData: photoData});
        });
    });
});

router.post('/:filename/details/reaction', function(req, res) {
    var reaction = req.body.reaction;
    var date = (new Date()).toISOString().substring(0, 19).replace('T', ' ');
    req.getConnection(function(err, connection) {
        if (err) {
            return next(err);
        }
        connection.query('INSERT INTO comments (photo_id, created_at, comment) VALUES ("' + req.session.photoId + '", "' + date + '", "' + req.body.reaction + '")',
            function (err, photos) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(photos);
                }
            });
        });

    res.redirect('http://localhost:3000/' + req.session.caption + '.png/details');
});

router.post('/:filename/download', function(req, res) {
    var filePath = filesPath + req.params.filename;
    var download = req.body.download;
    if(download) {
        res.download(filePath, req.params.filename , function(err) {
            console.log(err);
        });
    }
});

router.get('/upload', function(req, res) {
    if(req.session.email) {
        var data = {
            req: req,
            number: Math.floor((Math.random() * 1000) + 1)
        };
        res.render('upload', data);
    } else {
        req.session.valid = true;
        res.redirect('account');
    }
});

router.post('/upload', function(req, res) {
    req.getConnection(function(err, connection) {
        if (err) {
            return next(err);
        }

        connection.query('INSERT INTO photos (user_id, caption, filename) VALUES ("' + req.session.userId + '", "' + req.body.caption + '", "' + req.body.filename + '")',
            function (err, photos) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(photos);
                }
        });
    });
    res.redirect('/');
});

module.exports = router;