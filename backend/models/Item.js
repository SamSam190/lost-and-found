const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String, // 'Lost' or 'Found'
        required: true,
        enum: ['Lost', 'Found']
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    contactInfo: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Item', ItemSchema);
