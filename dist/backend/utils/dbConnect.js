"use strict";
// backend/utils/dbConnect.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Carga las variables de entorno desde un archivo .env (si existiera)
dotenv_1.default.config();
/**
 * Conecta la aplicación a MongoDB Atlas.
 * La URI de conexión se toma de una variable de entorno.
 */
const dbConnect = async () => {
    // La URI de conexión para MongoDB Atlas.
    // **IMPORTANTE**: Reemplaza el valor de process.env.MONGO_URI con tu cadena de conexión real de MongoDB Atlas.
    const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/<nombre_base_datos>?retryWrites=true&w=majority';
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Conexión exitosa a MongoDB Atlas.');
    }
    catch (error) {
        // En caso de error, registra el mensaje y sale del proceso.
        console.error('❌ Error de conexión a MongoDB:', error);
        // Usar process.exit(1) para indicar un fallo en el proceso.
        process.exit(1);
    }
};
exports.dbConnect = dbConnect;
