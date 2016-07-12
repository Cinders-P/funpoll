//configure our passport strategy here
//app and passport were passed in from server.js

//start off with premade strategy
var LocalStrategy = require('passport-local').Strategy;

//load User model
var User = require('../app/models/user').user;

//export this back to our app
module.exports = function(passport) {

	//setting up persistent login sessions
	//passport needs to serialize/unserialize users

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'username', //actually uses username by default, can change this to email though
		passwordField: 'password',
		passReqToCallback : true //the next function
	},
	function(req, username, password, done) {
		process.nextTick(function() {

			User.findOne({'local.username' : username}, function(err, user) {
				if (err) return done(err);
				if (user) {
					return done(null, false, req.flash('registerMessage', 'That username is already taken.'));
				} else {
					var newUser = new User();

					newUser.local.username = username;
					newUser.local.password = newUser.generateHash(password); //stores hashed version of the password only for security

					newUser.save(function(err) { //saves to database
						if (err)
							throw err
						else
							done(null, newUser);
					});
				}
			});
		});
	}));

	passport.use('local-login', new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, username, password, done) {

		User.findOne({'local.username' : username}, function(err, user) {
			if (err) return done(err);

			if (!user)
				return done(null, false, req.flash('loginMessage','No user found.'));

			if (!user.validPassword(password))
				return done(null, false, req.flash('loginMessage','Wrong password.'));

			return done(null, user); //everything OK
		});
	}));

}
