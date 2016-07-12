var sleep = require('sleep');

module.exports = function(app, passport, Poll) {

	// HOMEPAGE
	app.get('/', (req, res) => {
		Poll.find().sort({"timestamp": -1}).limit(10).exec((err, polls) => {
			res.render('index.pug', {
				q0: polls[0].question,
				d0: polls[0].timestamp.toLocaleDateString('en-US', {hour:'numeric', minute:'2-digit', weekday:'short'}),
				q1: polls[1].question,
				d1: polls[1].timestamp.toLocaleDateString('en-US', {hour:'numeric', minute:'2-digit', weekday:'short'}),
				q2: polls[2].question,
				d2: polls[2].timestamp.toLocaleDateString('en-US', {hour:'numeric', minute:'2-digit', weekday:'short'}),
				q3: polls[3].question,
				d3: polls[3].timestamp.toLocaleDateString('en-US', {hour:'numeric', minute:'2-digit', weekday:'short'}),
				q4: polls[4].question,
				d4: polls[4].timestamp.toLocaleDateString('en-US', {hour:'numeric', minute:'2-digit', weekday:'short'}),
				q5: polls[5].question,
				d5: polls[5].timestamp.toLocaleDateString('en-US', {hour:'numeric', minute:'2-digit', weekday:'short'}),
				q6: polls[6].question,
				d6: polls[6].timestamp.toLocaleDateString('en-US', {hour:'numeric', minute:'2-digit', weekday:'short'}),
				q7: polls[7].question,
				d7: polls[7].timestamp.toLocaleDateString('en-US', {hour:'numeric', minute:'2-digit', weekday:'short'}),
				q8: polls[8].question,
				d8: polls[8].timestamp.toLocaleDateString('en-US', {hour:'numeric', minute:'2-digit', weekday:'short'}),
				q9: polls[9].question,
				d9: polls[9].timestamp.toLocaleDateString('en-US', {hour:'numeric', minute:'2-digit', weekday:'short'})
			});
		});
		// console.log(req.cookies);
	});

	// LOGIN
	app.get('/login', (req, res, next) => {
		(req.isAuthenticated()) ? res.redirect('/dashboard') : next();
	}, (req, res) => {
		res.render('login.pug', { message: req.flash('loginMessage')});
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/dashboard',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.post('/register', passport.authenticate('local-signup', {
		successRedirect: '/dashboard',
		failureRedirect: '/register',
		failureFlash: true
	}));

	// REGISTER
	app.get('/register' , (req, res, next) => {
		(req.isAuthenticated()) ? res.redirect('/dashboard') : next();
	}, (req, res) => {
		res.render('register.pug', { message: req.flash('registerMessage')});
	});

	// PROFILE
	app.get('/dashboard', (req, res, next) => {
		(req.isAuthenticated()) ? next() : res.redirect('/'); //if user is authenticated, head to next middleware
	}, (req, res) => {
		console.log(req.user);
		console.log(req.cookies);
		console.log(req.session);
		res.render('dashboard.pug', {
			user: req.user.local.username
		});
	});

	// LOGOUT
	app.get('/logout', (req, res) => {
		req.logout(); //passport function which invalidates the session (where the user.id was stored)
		res.redirect('/');
	});

	// NEW POLL
	app.post('/new', (req, res) => {
		var choiceArr = [],
			author = "",
			optionsArr = [false, false, false],
			votesArr = [];

		for (var key in req.body) {
			if (/\d/.test(key)) // then key is a choice
				choiceArr.push(req.body[key]) //use brackets instead of dot notation because key is a variable
		}

		for (var i = 0; i < choiceArr.length; i++)
			votesArr[i] = 0;

		if (req.isAuthenticated())
			author = req.user.local.username;
		else
			author = null;

		if (req.body.ip)
			optionsArr[0] = true;
		if (req.body.mc)
			optionsArr[1] = true;
		if (req.body.cus)
			optionsArr[2] = true;

		// var id = generateID();
		var newPoll = new Poll({

			timestamp: new Date(),
			question: req.body.question,
			choices: choiceArr,
			author: author,
			options: optionsArr,
			votes: votesArr,
			ip: []

		});

		generateID(newPoll);
	});


	function generateID(newPoll) {
		var id = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 5; i++ ) //generate random ID of 5 characters
			id += possible.charAt(Math.floor(Math.random() * possible.length));

		Poll.count({identifier: id}, (err, number) => {
			if (err) console.error(err);

			if (number > 0 )
				generateID(newPoll);
			else { //found unique ID
				newPoll.identifier = id;
				newPoll.save( (err, newPoll) => {
					console.log('saving new poll');
					if (err) return console.error(err);
					res.redirect('/');
				});
			}
		});
	}
}
