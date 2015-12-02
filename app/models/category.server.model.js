var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CategorySchema = new Schema({
    categoryId: {
        type: String,
    },
    Name: {
        type: String,
        default: '',
        trim: true,
    },
   
});

mongoose.model('Category', CategorySchema);