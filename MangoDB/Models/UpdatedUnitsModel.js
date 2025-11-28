const mongoose = require('mongoose');

const updateUnitSchema = new mongoose.Schema({
    inventoryId: {type: Number, required: true},
    PO: {type: Number, required: true},
    originalUnitCost: {type: Number, required: true},
    serialNumber: {type: String, required: true},
    unitCost: {type: Number, required: true},
})

module.exports = mongoose.model('UpdatedUnits', updateUnitSchema);