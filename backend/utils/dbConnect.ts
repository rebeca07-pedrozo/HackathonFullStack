// backend/utils/dbConnect.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carga las variables de entorno desde un archivo .env (si existiera)
dotenv.config();

/**
 * Conecta la aplicación a MongoDB Atlas.
 * La URI de conexión se toma de una variable de entorno.
 */
export const dbConnect = async (): Promise<void> => {
    // La URI de conexión para MongoDB Atlas.
    // **IMPORTANTE**: Reemplaza el valor de process.env.MONGO_URI con tu cadena de conexión real de MongoDB Atlas.
    const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/<nombre_base_datos>?retryWrites=true&w=majority';

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conexión exitosa a MongoDB Atlas.');
    } catch (error) {
        // En caso de error, registra el mensaje y sale del proceso.
        console.error('❌ Error de conexión a MongoDB:', error);
        // Usar process.exit(1) para indicar un fallo en el proceso.
        process.exit(1); 
    }
};
