const mongoose = require('mongoose');

const IQInventorySchema = new mongoose.Schema({
    inventoryId: {type: Number, required: true},
    PO: {type: Number, required: true},
    category1: {type: String},
    category2: {type: String},
    inventoryComments: {type: String},
    itemId: {type: Number, required: true},
    location: {type: String, required: true},
    originalUnitCost: {type: Number, required: true},
    serialNumber: {type: String, required: true},
    unitCost: {type: Number, required: true},
})

module.exports = mongoose.model('IQInventory', IQInventorySchema, 'allitems');

