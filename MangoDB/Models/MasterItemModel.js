const mongoose = require('mongoose');

const MasterItemSchema = new mongoose.Schema({
    itemId: {type: Number, required: true},
    generalCategory: {type: String},
    detailedCategory: {type: String},
})

module.exports = mongoose.model('MasterItem', MasterItemSchema, 'masteritems');

