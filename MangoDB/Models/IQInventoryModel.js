const mongoose = require('mongoose');

const IQInventorySchema = new mongoose.Schema({
    inventoryId: {type: Number, required: true},
    PO: {type: Number, required: true},
    condition: {type: String, required: true},
    inventoryComments: {type: String},
    itemId: {type: Number, required: true},
    location: {type: String, required: true},
    serialNumber: {type: String, required: true},
})

module.exports = mongoose.model('IQInventory', IQInventorySchema, 'allitems');

