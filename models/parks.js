const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const parkSchema = new Schema({
    name: {type: String, required: true},
    img: String,
    description: String,
    rating: {type: Number, min: 0, max: 5}
});

const Park = mongoose.model('Park', parkSchema);

module.exports = Park;
