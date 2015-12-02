// Invoke 'strict' JavaScript mode
'use strict';

// Create a new 'render' controller method
exports.renderAbout = function(req, res) {
	// Use the 'response' object to render the 'index' view with a 'title' and a stringified 'user' properties
	res.render('about', {
		title: 'About',
		messages: req.flash('error') || req.flash('info')
	});
};
