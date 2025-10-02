"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dataController_1 = require("../controllers/dataController");
const errorHandler_1 = require("../middlewares/errorHandler"); // Importar CustomError
const router = express_1.default.Router();
// ----------------------------------------------------------------
// 1. LOGIN SIMULADO (POST /api/login)
// ----------------------------------------------------------------
router.post('/login', (req, res, next) => {
    const { username, password } = req.body;
    // Validación básica
    if (!username || !password) {
        // Usamos next(new CustomError...) para que el middleware lo capture
        return next(new errorHandler_1.CustomError('Por favor, ingrese un nombre de usuario y contraseña.', 400));
    }
    // Simulación de credenciales correctas
    const VALID_USERNAME = 'admin';
    const VALID_PASSWORD = 'password123';
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        // En un proyecto real, aquí se generaría un JWT (Token)
        res.status(200).json({
            message: 'Login exitoso',
            token: 'simulated_jwt_token',
            userId: 'data-science-user' // ID simulado
        });
    }
    else {
        return next(new errorHandler_1.CustomError('Credenciales inválidas.', 401));
    }
});
// ----------------------------------------------------------------
// 2. CRUD DE DATOS (API /api/data)
// ----------------------------------------------------------------
// Crear un nuevo registro de datos
router.post('/data', dataController_1.createDataEntry);
// Obtener todos los registros de datos
router.get('/data', dataController_1.getAllDataEntries);
// Eliminar un registro por ID
router.delete('/data/:id', dataController_1.deleteDataEntry);
// Actualizar un registro por ID
router.put('/data/:id', dataController_1.updateDataEntry);
// Manejador de errores final para las rutas API (opcional, pero buena práctica)
router.use((err, req, res, next) => {
    if (err) {
        next(new errorHandler_1.CustomError('Error del servidor durante el login.', 500));
    }
    next();
});
exports.default = router;
