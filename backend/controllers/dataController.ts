import { Request, Response, NextFunction } from 'express';
import { DataEntry, IDataEntry } from '../models/dataModel'; 
import { CustomError } from '../middlewares/errorHandler';

export const createDataEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newData = new DataEntry(req.body);
    await newData.save();

    res.status(201).json({ 
        status: 'success', 
        data: newData,
        message: 'Registro de datos creado exitosamente.'
    });
  } catch (error) {
    next(error);
  }
};

// Función para OBTENER todos los registros (GET)
export const getAllDataEntries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // En un proyecto real, se agregarían filtros, paginación, etc.
    const entries: IDataEntry[] = await DataEntry.find().sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      results: entries.length,
      data: { entries },
    });
  } catch (error) {
    next(error);
  }
};

// Función para ACTUALIZAR un registro por ID (PUT)
export const updateDataEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const entry = await DataEntry.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Devuelve el documento modificado
            runValidators: true, // Ejecuta los validadores definidos en el Schema
        });

        if (!entry) {
            return next(new CustomError('No se encontró el registro con ese ID.', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { entry },
            message: 'Registro de datos actualizado exitosamente.'
        });
    } catch (error) {
        next(error);
    }
};

// Función para ELIMINAR un registro por ID (DELETE)
export const deleteDataEntry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entry = await DataEntry.findByIdAndDelete(req.params.id);

    if (!entry) {
        return next(new CustomError('No se encontró el registro con ese ID para eliminar.', 404));
    }

    // Respuesta 204 No Content para eliminación exitosa
    res.status(204).json({
      status: 'success',
      data: null,
      message: 'Registro de datos eliminado exitosamente.'
    });
  } catch (error) {
    next(error);
  }
};