"use strict";
// backend/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbConnect_1 = require("./utils/dbConnect");
const apiRoutes_1 = __importDefault(require("./routes/apiRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
// Carga las variables de entorno
dotenv_1.default.config();
// Inicializa la conexión a la base de datos
(0, dbConnect_1.dbConnect)();
// Inicializa la aplicación Express
const app = (0, express_1.default)();
// Configuración de middlewares
// Habilita CORS para permitir peticiones desde el frontend (React)
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', // Reemplaza con la URL de tu frontend en producción
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware para parsear el cuerpo de las peticiones como JSON
app.use(express_1.default.json());
// **********************************************
// RUTAS
// **********************************************
// Ruta base
app.get('/', (req, res) => {
    res.send('API REST de Ciencia de Datos funcionando. Usa /api/data para el CRUD.');
});
// Rutas de la API (Datos y Autenticación simulada)
app.use('/api', apiRoutes_1.default);
// **********************************************
// MANEJO DE ERRORES Y RUTAS NO ENCONTRADAS
// **********************************************
// Manejo de ruta no encontrada (404)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});
// Middleware de manejo de errores centralizado (DEBE ir al final, después de todas las rutas)
app.use(errorHandler_1.errorHandler);
// Inicia el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express con TypeScript corriendo en modo ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API escuchando en el puerto ${PORT}`);
});
