"use strict";
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
dotenv_1.default.config();
(0, dbConnect_1.dbConnect)();
const app = (0, express_1.default)();

app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());

app.get('/', (req, res) => {
    res.send('API REST de Ciencia de Datos funcionando. Usa /api/data para el CRUD.');
});
app.use('/api', apiRoutes_1.default);

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
});
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express con TypeScript corriendo en modo ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API escuchando en el puerto ${PORT}`);
});
