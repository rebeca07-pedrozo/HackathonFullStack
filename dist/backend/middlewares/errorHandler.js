"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.CustomError = void 0;
// Definición de una clase de error personalizada para manejar códigos HTTP
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        // Esto asegura que la clase extienda correctamente Error
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
exports.CustomError = CustomError;
// Middleware de manejo de errores centralizado
const errorHandler = (err, req, res, next) => {
    // Manejo de errores de conexión o de servidor genéricos
    let statusCode = 500;
    let message = 'Error interno del servidor.';
    // Si es un CustomError, usamos su código de estado
    if (err instanceof CustomError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Manejo específico de errores de validación de Mongoose
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Error de validación: ' + err.message;
    }
    // Manejo específico de errores de duplicidad (código 11000)
    else if (err.code === 11000) {
        statusCode = 409; // Conflicto
        message = 'El registro ya existe. Se detectó un valor duplicado.';
    }
    // Devolvemos la respuesta de error
    res.status(statusCode).json({
        status: 'error',
        message: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Mostrar stack solo en desarrollo
    });
};
exports.errorHandler = errorHandler;
