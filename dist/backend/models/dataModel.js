"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataEntry = void 0;
const mongoose_1 = require("mongoose");
// Nota: Hemos eliminado la interfaz IDataEntryDocument que extendía Document 
// para simplificar el tipado y resolver el error TS2590.
/**
 * 3. Definición del Esquema
 * Usamos el tipo genérico <IDataEntry> en el Schema.
 * Mongoose sabe cómo añadir las propiedades de Document a partir de aquí.
 */
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
/**
 * 4. Creación y exportación del modelo
 * Usamos el tipado explícito y los genéricos correctamente para evitar errores de TypeScript.
 */
exports.DataEntry = (0, mongoose_1.model)('DataEntry', DataEntrySchema);
