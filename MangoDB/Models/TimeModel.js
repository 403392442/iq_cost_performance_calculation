const mongoose = require('mongoose');

const TimeSchema = new mongoose.Schema({
    time: {type: String},
})

module.exports = mongoose.model('lastupdates', TimeSchema, 'lastupdates');

