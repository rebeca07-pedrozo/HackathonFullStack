import { Schema, model, Document, Model } from 'mongoose';

/**
 * 1. Interfaz con la estructura de datos (Propiedades básicas del documento)
 * ESTE es el tipo que usaremos para definir el esquema.
 */
export interface IDataEntry {
  date: Date;
  dataType: 'Analysis' | 'Experiment' | 'Simulation';
  value: number;
  description: string; // <-- La propiedad 'description' faltaba en tu versión.
} // <-- ¡Faltaba cerrar esta llave!

// Nota: Hemos eliminado la interfaz IDataEntryDocument que extendía Document 
// para simplificar el tipado y resolver el error TS2590.

/**
 * 3. Definición del Esquema
 * Usamos el tipo genérico <IDataEntry> en el Schema.
 * Mongoose sabe cómo añadir las propiedades de Document a partir de aquí.
 */
const DataEntrySchema: Schema<IDataEntry> = new Schema<IDataEntry>({
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
  description: { // <-- Aseguramos que 'description' esté en el esquema
    type: String, 
    required: false, 
    default: '' 
  },
});

/**
 * 4. Creación y exportación del modelo
 * Usamos el tipado explícito y los genéricos correctamente para evitar errores de TypeScript.
 */
export const DataEntry: Model<IDataEntry> = model<IDataEntry>('DataEntry', DataEntrySchema);
