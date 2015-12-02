// Invoke 'strict' JavaScript mode
'use strict';

// Define the routes module' method
module.exports = function(app) {
	// Load the 'index' controller
	var aboutController = require('../controllers/about.server.controller');

	// Mount the 'index' controller's 'render' method
	app.get('/about', aboutController.renderAbout);
};