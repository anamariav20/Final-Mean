var mongoose = require('mongoose'),
    Song = mongoose.model('Song');

// ERROR HANDLING
var getErrorMessage = function(err) {
    if (err.errors) {
        for (var errName in err.errors) {
            if (err.errors[errName].message) return err.errors[errName].message;
        }
    }
    else {
        return 'Unknown server error';
    }
};

// CHECK AUTHORIZATION
exports.hasAuthorization = function(req, res, next) {
    if (req.song.creator.id !== req.user.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};

// CREATE
exports.create = function(req, res) {
    var song = new Song(req.body);

    //this is the authenticated Passport user
    song.creator = req.user;

    song.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        }
        else {
            res.json(song);
        }
    });
};

//LIST/READ
exports.list = function(req, res) {
    Song.find().sort('-created').populate('creator', 'firstName   lastName fullName').exec(function(err, songs) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        }
        else {
            res.json(songs);
        }
    });
};

//FIND BY ID
exports.songByID = function(req, res, next, id) {
    Song.findById(id).populate('creator', 'firstName lastName fullName').exec(function(err, song) {
        if (err) return next(err);
        if (!song) return next(new Error('Failed to load song ' + id));

        req.song = song;
        next();
    });
};

//READ
exports.read = function(req, res) {
    res.json(req.song);
};

//UPDATE
exports.update = function(req, res) {
    var song = req.song;

    //makeupdates to title and content
    song.title = req.body.title;
    song.composer = req.body.composer;
    song.genre = req.body.genre;
    song.content = req.body.content;

    //call save on the Mongoose model
    song.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        }
        else {
            res.json(song);
        }
    });
};

//DELETE
exports.delete = function(req, res) {
    var song = req.song;

    song.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        }
        else {
            res.json(song);
        }
    });
};
