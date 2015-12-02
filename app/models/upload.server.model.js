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
    uploadId: {
        type: String,
        default: '',
        trim: true
    },
    category: {
        type: Schema.ObjectId,
        ref: 'Category'
    }
});

mongoose.model('Upload', UploadSchema);