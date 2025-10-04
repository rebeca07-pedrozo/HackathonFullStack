"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataEntry = void 0;
const mongoose_1 = require("mongoose");
const DataEntrySchema = new mongoose_1.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    dataType: {
        type: String,
        required: true,
        enum: ['Analysis', 'Experiment', 'Simulation']
    },
    value: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false,
        default: ''
    },
});
exports.DataEntry = (0, mongoose_1.model)('DataEntry', DataEntrySchema);
