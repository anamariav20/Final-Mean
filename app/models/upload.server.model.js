var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UploadSchema = new Schema({
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

    creator: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    image: {
    type: String,
    default: ''
    }
});

mongoose.model('Upload', UploadSchema);