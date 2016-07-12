//based on https://scotch.io/tutorials/easy-node-authentication-setup-and-local

//dependencies ==================================================================
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var bcrypt = require('bcrypt-nodejs');

var stylus = require('stylus');
var path = require('path');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');
var Poll = require('./app/models/user.js').poll;

//configuration ==================================================================
mongoose.connect(configDB.url);
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

function compile(str, path){
  return stylus(str)
  .set('filename', path)
  .set('compress', true)
}

app.use(stylus.middleware({
	src: __dirname + '/stylesheets/',
	dest: __dirname + '/public/',
	compile: compile,
}));
app.use(express.static('public')); //now accessable from base url

require('./config/passport')(passport);

app.use(morgan('dev')); //logs requests to console
app.use(cookieParser()); //reads cookies for authentication
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json()); //reads info from login form

app.set('view engine', 'pug');

//passport settings
app.use(session({ //from express-session; defines a cookie
	cookieName: 'login-cookie',
	expires: 31556926000, // one year in milliseconds. default is null (non-persistent).
    secret: bcrypt.genSaltSync(8),
    resave: true,
    saveUninitialized: true
}));
//by default session only saves cookie to memory
//https://www.npmjs.com/package/express-session
//actually storing it is more complicated
//consider https://github.com/kcbanner/connect-mongo

app.use(passport.initialize());
app.use(passport.session()); //persistent login session
app.use(flash()); //reads flash messages stored in session

//routes ========================================================================
require('./app/routes.js')(app, passport, Poll); //load routes and pass in the express app + a configured passport

//launch ========================================================================
app.listen(port, () => {
	console.log("Server started on port " + port);
});
