"use strict";
// backend/models/dataModel.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataEntry = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// 2. Define el esquema de Mongoose
const DataEntrySchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'El título del registro es obligatorio'],
        trim: true,
        maxlength: [100, 'El título no puede exceder los 100 caracteres.']
    },
    value: {
        type: Number,
        required: [true, 'El valor numérico es obligatorio'],
        min: [0, 'El valor no puede ser negativo']
    },
    category: {
        type: String,
        enum: ['Analysis', 'Experiment', 'Simulation'],
        default: 'Analysis'
    },
    notes: {
        type: String,
        maxlength: [500, 'Las notas no pueden exceder los 500 caracteres.'],
        default: ''
    }
}, {
    timestamps: true // Añade automáticamente createdAt y updatedAt
});
// 3. Exporta el Modelo Mongoose
// Nota: 'DataEntry' será el nombre de la colección en MongoDB (se pluralizará automáticamente a 'dataentries')
exports.DataEntry = mongoose_1.default.model('DataEntry', DataEntrySchema);
