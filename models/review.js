const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Structure iof the schema
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
});

//exporting the schema
module.exports = mongoose.model('Review', reviewSchema);
