var mongoose = require('mongoose'),
    Category = mongoose.model('Category');

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
    if (req.category.creator.id !== req.user.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};

// CREATE
exports.create = function(req, res) {
    var category = new Category(req.body);

    //this is the authenticated Passport user
    category.creator = req.user;

    category.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        }
        else {
            res.json(category);
        }
    });
};

//LIST/READ
exports.list = function(req, res) {
    Category.find().sort('-created').populate('creator', 'firstName   lastName fullName').exec(function(err, categories) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        }
        else {
            res.json(categories);
        }
    });
};

//FIND BY ID
exports.categoryByID = function(req, res, next, id) {
    Category.findById(id).populate('creator', 'firstName lastName fullName').exec(function(err, category) {
        if (err) return next(err);
        if (!category) return next(new Error('Failed to load category ' + id));

        req.category = category;
        next();
    });
};

//READ
exports.read = function(req, res) {
    res.json(req.category);
};

//UPDATE
exports.update = function(req, res) {
    var category = req.category;

    //makeupdates to title and content
    category.title = req.body.title;
    category.content = req.body.content;

    //call save on the Mongoose model
    category.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        }
        else {
            res.json(category);
        }
    });
};

//DELETE
exports.delete = function(req, res) {
    var category = req.category;

    category.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        }
        else {
            res.json(category);
        }
    });
};
