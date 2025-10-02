import express from 'express';
import { createDataEntry, getAllDataEntries, deleteDataEntry, updateDataEntry } from '../controllers/dataController';
import { errorHandler, CustomError } from '../middlewares/errorHandler'; // Importar CustomError

const router = express.Router();

// ----------------------------------------------------------------
// 1. LOGIN SIMULADO (POST /api/login)
// ----------------------------------------------------------------
router.post('/login', (req, res, next) => {
  const { username, password } = req.body;

  // Validación básica
  if (!username || !password) {
    // Usamos next(new CustomError...) para que el middleware lo capture
    return next(new CustomError('Por favor, ingrese un nombre de usuario y contraseña.', 400));
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
  } else {
    return next(new CustomError('Credenciales inválidas.', 401));
  }
});


// ----------------------------------------------------------------
// 2. CRUD DE DATOS (API /api/data)
// ----------------------------------------------------------------
// Crear un nuevo registro de datos
router.post('/data', createDataEntry);

// Obtener todos los registros de datos
router.get('/data', getAllDataEntries);

// Eliminar un registro por ID
router.delete('/data/:id', deleteDataEntry);

// Actualizar un registro por ID
router.put('/data/:id', updateDataEntry);


// Manejador de errores final para las rutas API (opcional, pero buena práctica)
router.use((err: any, req: any, res: any, next: any) => {
    if (err) {
      next(new CustomError('Error del servidor durante el login.', 500));
    }
    next();
});

export default router;