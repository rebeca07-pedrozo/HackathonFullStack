"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.CustomError = CustomError;
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Error interno del servidor.';
    if (err instanceof CustomError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Error de validación: ' + err.message;
    }
    else if (err.code === 11000) {
        statusCode = 409; 
        message = 'El registro ya existe. Se detectó un valor duplicado.';
    }
    res.status(statusCode).json({
        status: 'error',
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, 
    });
};
exports.errorHandler = errorHandler;
