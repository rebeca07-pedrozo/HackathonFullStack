import { Request, Response, NextFunction } from 'express';

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  
  else if ((err as any).code === 11000) {
    statusCode = 409; 
    message = 'El registro ya existe. Se detectó un valor duplicado.';
  }

  res.status(statusCode).json({
    status: 'error',
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, 
  });
};