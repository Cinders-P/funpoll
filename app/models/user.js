var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({

	local		: {
		username: String,
		password: String,
	}

	//Add more if the app connects to fb, twitter, google, etc.
});

var pollSchema = mongoose.Schema({

	timestamp		: Date,
	author			: String,
	question		: String,
	choices			: Array,
	votes			: Array,
	options			: Array,
	identifier		: String,
	ip				: Array

});


// methods ==========================================

// prepends a salt then hashes the text
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid, compares it against the hash (this.local.password)
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

// create model for users for the app
module.exports = {
	poll: mongoose.model('Poll', pollSchema),
	user: mongoose.model('User', userSchema)
}
