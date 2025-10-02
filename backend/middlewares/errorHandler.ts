import { Request, Response, NextFunction } from 'express';

// Definición de una clase de error personalizada para manejar códigos HTTP
export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Esto asegura que la clase extienda correctamente Error
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

// Middleware de manejo de errores centralizado
export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  else if ((err as any).code === 11000) {
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