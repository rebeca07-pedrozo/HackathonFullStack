"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dataController_1 = require("../controllers/dataController");
const errorHandler_1 = require("../middlewares/errorHandler"); 
const router = express_1.default.Router();

router.post('/login', (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new errorHandler_1.CustomError('Por favor, ingrese un nombre de usuario y contraseña.', 400));
    }
    const VALID_USERNAME = 'admin';
    const VALID_PASSWORD = 'password123';
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        res.status(200).json({
            message: 'Login exitoso',
            token: 'simulated_jwt_token',
            userId: 'data-science-user' 
        });
    }
    else {
        return next(new errorHandler_1.CustomError('Credenciales inválidas.', 401));
    }
});

router.post('/data', dataController_1.createDataEntry);
router.get('/data', dataController_1.getAllDataEntries);
router.delete('/data/:id', dataController_1.deleteDataEntry);
router.put('/data/:id', dataController_1.updateDataEntry);
router.use((err, req, res, next) => {
    if (err) {
        next(new errorHandler_1.CustomError('Error del servidor durante el login.', 500));
    }
    next();
});
exports.default = router;
