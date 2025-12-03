const mongoose = require('mongoose');

const dailyWorkedUnitSchema = new mongoose.Schema({
    inventoryId: {type: Number, required: true},
    PO: {type: Number, required: true},
    serialNumber: {type: String, required: true},
    itemId: {type: Number, required: true},
    condition: {type: String, required: true},
    processCost: {type: Number, required: true},
    location: {type: String, required: true},
    category: {type: String, required: true},
    progress: {type: String},
    isFinalCost: {type: Boolean, required: true},
})

module.exports = mongoose.model('DailyWorkedOnUnit', dailyWorkedUnitSchema,'dailyworkedonunits');