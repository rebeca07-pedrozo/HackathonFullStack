// backend/server.ts

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbConnect } from './utils/dbConnect';
import apiRoutes from './routes/apiRoutes';
import { errorHandler } from './middlewares/errorHandler';

// Carga las variables de entorno
dotenv.config();

// Inicializa la conexión a la base de datos
dbConnect();

// Inicializa la aplicación Express
const app = express();

// Configuración de middlewares
// Habilita CORS para permitir peticiones desde el frontend (React)
app.use(cors({
    origin: 'http://localhost:3000', // Reemplaza con la URL de tu frontend en producción
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear el cuerpo de las peticiones como JSON
app.use(express.json());

// **********************************************
// RUTAS
// **********************************************

// Ruta base
app.get('/', (req, res) => {
    res.send('API REST de Ciencia de Datos funcionando. Usa /api/data para el CRUD.');
});

// Rutas de la API (Datos y Autenticación simulada)
app.use('/api', apiRoutes);


// **********************************************
// MANEJO DE ERRORES Y RUTAS NO ENCONTRADAS
// **********************************************

// Manejo de ruta no encontrada (404)
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});

// Middleware de manejo de errores centralizado (DEBE ir al final, después de todas las rutas)
app.use(errorHandler);


// Inicia el servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express con TypeScript corriendo en modo ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API escuchando en el puerto ${PORT}`);
});
