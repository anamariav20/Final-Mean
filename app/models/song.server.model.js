var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SongSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    content: {
        type: String,
        default: '',
        trim: true
    },
    creator: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    composer: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    },
    genre: {
        type: String,
        default: '',
        trim: true,
        required: 'Title cannot be blank'
    }
});

mongoose.model('Song', SongSchema);