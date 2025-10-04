"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDataEntry = exports.updateDataEntry = exports.getAllDataEntries = exports.createDataEntry = void 0;
const dataModel_1 = require("../models/dataModel");
const errorHandler_1 = require("../middlewares/errorHandler");
const createDataEntry = async (req, res, next) => {
    try {
        const newData = new dataModel_1.DataEntry(req.body);
        await newData.save();
        res.status(201).json({
            status: 'success',
            data: newData,
            message: 'Registro de datos creado exitosamente.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createDataEntry = createDataEntry;
const getAllDataEntries = async (req, res, next) => {
    try {
        const entries = await dataModel_1.DataEntry.find().sort({ date: -1 });
        res.status(200).json({
            status: 'success',
            results: entries.length,
            data: { entries },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllDataEntries = getAllDataEntries;
const updateDataEntry = async (req, res, next) => {
    try {
        const entry = await dataModel_1.DataEntry.findByIdAndUpdate(req.params.id, req.body, {
            new: true, 
            runValidators: true, 
        });
        if (!entry) {
            return next(new errorHandler_1.CustomError('No se encontró el registro con ese ID.', 404));
        }
        res.status(200).json({
            status: 'success',
            data: { entry },
            message: 'Registro de datos actualizado exitosamente.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDataEntry = updateDataEntry;
const deleteDataEntry = async (req, res, next) => {
    try {
        const entry = await dataModel_1.DataEntry.findByIdAndDelete(req.params.id);
        if (!entry) {
            return next(new errorHandler_1.CustomError('No se encontró el registro con ese ID para eliminar.', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
            message: 'Registro de datos eliminado exitosamente.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDataEntry = deleteDataEntry;
