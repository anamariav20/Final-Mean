var users = require('../../app/controllers/users.server.controller'),
    songs = require('../../app/controllers/songs.server.controller');

module.exports = function(app) {
    app.route('/api/songs')
        .get(songs.list)
        .post(users.requiresLogin, songs.create);

    app.route('/api/songs/:songId')
        .get(songs.read)
        .put(users.requiresLogin, songs.hasAuthorization, songs.update)
        .delete(users.requiresLogin, songs.hasAuthorization, songs.delete);

    app.param('songId', songs.songByID);
};