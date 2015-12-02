// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var	config = require('./config'),
	mongoose = require('mongoose');

// Define the Mongoose configuration method
module.exports = function() {
	// Use Mongoose to connect to MongoDB
	var db = mongoose.connect(config.db);

	// Load the 'User' model 
	require('../app/models/user.server.model');
	require('../app/models/song.server.model');	
	require('../app/models/category.server.model');
	require('../app/models/upload.server.model');	
	
	// Return the Mongoose connection instance
	return db;
};

