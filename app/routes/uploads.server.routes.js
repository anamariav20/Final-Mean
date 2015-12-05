var users = require('../../app/controllers/users.server.controller'),
    uploads = require('../../app/controllers/uploads.server.controller'),
    multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();

module.exports = function(app) {
    app.route('/api/uploads')
        .get(uploads.list)
        .post(users.requiresLogin, multipartyMiddleware, uploads.createWithUpload, uploads.create);

    app.route('/api/uploads/:uploadId')
        .get(uploads.read)
        .put(users.requiresLogin, uploads.hasAuthorization, uploads.update)
        .delete(users.requiresLogin, uploads.hasAuthorization, uploads.delete);

    app.param('uploadId', uploads.uploadByID);
};