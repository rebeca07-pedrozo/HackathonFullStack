import express from 'express';
import { createDataEntry, getAllDataEntries, deleteDataEntry, updateDataEntry } from '../controllers/dataController';
import { errorHandler, CustomError } from '../middlewares/errorHandler'; 

const router = express.Router();


router.post('/login', (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new CustomError('Por favor, ingrese un nombre de usuario y contraseña.', 400));
  }

  const VALID_USERNAME = 'admin';
  const VALID_PASSWORD = 'password123'; 

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    res.status(200).json({ 
      message: 'Login exitoso', 
      token: 'simulated_jwt_token',
      userId: 'data-science-user' 
    });
  } else {
    return next(new CustomError('Credenciales inválidas.', 401));
  }
});



router.post('/data', createDataEntry);

router.get('/data', getAllDataEntries);

router.delete('/data/:id', deleteDataEntry);

router.put('/data/:id', updateDataEntry);


router.use((err: any, req: any, res: any, next: any) => {
    if (err) {
      next(new CustomError('Error del servidor durante el login.', 500));
    }
    next();
});

export default router;