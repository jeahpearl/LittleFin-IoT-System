const mongoose = require('mongoose');
const sensorSchema = new mongoose.Schema({
    tank_name: {
        type: String,
        required: true,
    },
    temperature: {
        type: String,
        required: true,
    },
    fahrenheit: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

module.exports = mongoose.model('sensors', sensorSchema)