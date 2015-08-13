var express = require('express');
var path = require('path');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
var multer = require('multer');
var mysql = require('mysql');
var myConnection = require('express-myconnection');
var nodemon = require('nodemon');

//  =================
//  = Setup the app =
//  =================

// The app itself
var app = express();

app.set('port', (process.env.PORT || 3000));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//  ============================
//  = Middleware configuration =
//  ============================

// Setup serving static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/uploads'));

// Add session support
app.use(session({
  secret: '...', // CHANGE THIS!!!
  store: new FileStore(),
  saveUninitialized: true,
  resave: false
}));

// Setup bodyparser
app.use(bodyParser.urlencoded({extended: true}));

// Setup Multer
app.use(multer({
  dest: './uploads/',
  rename: function (fieldname, filename) {
    return fieldname ;
  },
  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...')
  },
  onFileUploadComplete: function (file) {
    console.log(file.fieldname + ' uploaded to  ' + file.path)
    done = true;
  }
}));

// Database configuration
var dbOptions = {
  host: 'localhost',
  user: 'root',
  password: 'Headhunterz',
  database: 'sss-final'
};

// Setup MySQL
app.use(myConnection(mysql, dbOptions, 'single'));

// Add connection middleware

//  ===========
//  = Routers =
//  ===========

var accountRouter = require('./routers/account');
var photoRouter = require('./routers/photo');

//app.use('/test', testRouter);
app.use('/account', accountRouter);
app.use('/', photoRouter);

//  =================
//  = Start the app =
//  =================

app.listen(app.get("port"), function(){
  console.log("really started");
});

