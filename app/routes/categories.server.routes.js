var users = require('../../app/controllers/users.server.controller'),
    categories = require('../../app/controllers/categories.server.controller');

module.exports = function(app) {
    app.route('/api/categories')
        .get(categories.list)
        .post(users.requiresLogin, categories.create);

    app.route('/api/categories/:categoryId')
        .get(categories.read)
        .put(users.requiresLogin, categories.hasAuthorization, categories.update)
        .delete(users.requiresLogin, categories.hasAuthorization, categories.delete);

    app.param('categoryId', categories.categoryByID);
}