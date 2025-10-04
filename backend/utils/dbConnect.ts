
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const dbConnect = async (): Promise<void> => {

    const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/<nombre_base_datos>?retryWrites=true&w=majority';

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conexión exitosa a MongoDB Atlas.');
    } catch (error) {
        console.error('❌ Error de conexión a MongoDB:', error);
        process.exit(1);
    }
};
