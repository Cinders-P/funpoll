var sleep = require('sleep');

module.exports = function(app, passport, Poll) {

	// HOMEPAGE
	app.get('/', (req, res) => {
		Poll.find().sort({"timestamp": -1}).limit(10).exec((err, polls) => {
			var qArr = [],
				dArr = [],
				iArr = [];
			for (var z = 0; z < 10; z++) {
				iArr.push(polls[z].identifier);
				qArr.push(polls[z].question);
				dArr.push(polls[z].timestamp.toLocaleDateString('en-US', {hour:'numeric', minute:'2-digit', weekday:'short'}));
			}

			res.render('index.pug', {
				qArr: JSON.stringify(qArr),
				dArr: JSON.stringify(dArr),
				iArr: JSON.stringify(iArr)
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

		generateID(newPoll, res);

	});


	function generateID(newPoll, res) {
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
					else res.redirect('/' + id);
				});
			}
		});
	}

	// ADD NEW CHOICE
	app.post('/:id/add', (req, res) => {
		var choice = req.body.add;
		Poll.findOneAndUpdate({identifier: {$eq: req.params.id} }, {$push: {choices: choice, votes: 0}}, {safe: true, upsert: true, new : true}, (err, doc) => {
			if (err) console.error(err);
			else console.log('Added ' + choice + ' to ' + req.params.id);
			console.log(doc);
		});
		// res.redirect('back'); cant redirect after ajax call, have to do client side
		res.end();
	});

	// SUBMIT A VOTE
	app.post('/:id/vote', (req, res) => {
		Poll.findOne({identifier: req.params.id}, (err, poll) => {

			if (poll.options[0] === true) { //if I redid this application I would use an object instead of double arrays... d'oh!
				if (poll.ip.indexOf(req.ip) !== -1) { //if ip has already voted and no duplication allowed, don't process their vote
					console.log("Duplicate IP"); //FLASH MESSAGE
					res.end("true");
					return;
				} else
					poll.ip.push(req.ip);
			}

			if (poll.options[1] === true) { //checkbox system
				for (var i = 0; i < req.body.vote.length; i++) {
					poll.votes[poll.choices.indexOf(req.body.vote[i])] += 1;
				}
			} else { //radio system
				poll.votes[poll.choices.indexOf(req.body.vote)] += 1;
			}

			poll.markModified('votes'); // informs Mongoose that something has changed so it saves it; doesn't check arrays by default?
		    poll.save(function (err) {
				if (err) return console.error(err);
				else console.log('Successful vote.');
		    });
		});
	});

	// VOTING SCREEN
	app.get('/:id', (req, res) => {
		Poll.findOne({identifier: req.params.id}, (err, poll) => {
			res.render('vote.pug', {
				question: poll.question,
				cArr: JSON.stringify(poll.choices),
				oArr: JSON.stringify(poll.options),
				timestamp: poll.timestamp.toLocaleDateString(),
				author: poll.author,
			});
		});
	});

	// RESULTS PAGE
	app.get('/:id/r', (req, res) => {
		res.end();
	});

}
