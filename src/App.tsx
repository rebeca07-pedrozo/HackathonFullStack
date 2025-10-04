// NOTA: Este es el archivo App.tsx completo, con la corrección en la línea 161 y en resetFormData.

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
// LÍNEA CORREGIDA: Se eliminó el import de Bootstrap CSS para evitar el error de resolución.
// RECUERDA: Debes añadir el CDN de Bootstrap CSS en tu archivo index.html para que los estilos funcionen.

// ******************************************************************************
// 1. CONFIGURACIÓN Y TIPOS GLOBALES
// ******************************************************************************

// Tipos para el modelo de datos
interface DataRecord {
  _id?: string;
  title: string;
  dataType: 'Analysis' | 'Experiment' | 'Simulation';
  description: string;
  value: number;
  date: string;
}

// Tipos para el contexto de autenticación
interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
  userToken: string | null;
}

// Estado inicial del contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:5000/api/data';
const FAKE_AUTH_TOKEN = 'mock-jwt-token-12345';

// ******************************************************************************
// 2. VALIDACIONES (frontend/src/utils/validation.ts)
// ******************************************************************************

/**
 * Valida la estructura básica del objeto de datos.
 * @param data Objeto DataRecord a validar.
 * @returns true si es válido, o un mensaje de error.
 */
const validateDataRecord = (data: Omit<DataRecord, '_id' | 'date'>): string | true => {
  if (!data.title || data.title.length < 3) {
    return 'El título debe tener al menos 3 caracteres.';
  }
  if (!data.dataType || !['Analysis', 'Experiment', 'Simulation'].includes(data.dataType)) {
    return 'Debe seleccionar un tipo de datos válido.';
  }
  if (!data.description || data.description.length < 10) {
    return 'La descripción debe tener al menos 10 caracteres.';
  }
  if (typeof data.value !== 'number' || isNaN(data.value) || data.value <= 0) {
    return 'El valor debe ser un número positivo.';
  }
  return true;
};

// ******************************************************************************
// 3. SERVICIOS (frontend/src/services/api.ts)
// ******************************************************************************

/**
 * Maneja llamadas HTTP a la API REST del backend.
 */
const apiService = {
  fetchData: async (): Promise<DataRecord[]> => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`Error al obtener datos: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en fetchData:', error);
      throw error;
    }
  },

  postData: async (data: Omit<DataRecord, '_id' | 'date'>): Promise<DataRecord> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`, // Token para simular seguridad
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Manejo de excepciones del backend
        const errorMessage = responseData.message || 'Error desconocido al crear el registro.';
        throw new Error(errorMessage);
      }
      return responseData;
    } catch (error) {
      console.error('Error en postData:', error);
      throw error;
    }
  },
  
  // Implementación de DELETE y PUT (ejemplo básico)
  deleteData: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error al eliminar el registro.');
      }
    } catch (error) {
      console.error('Error en deleteData:', error);
      throw error;
    }
  },

  updateData: async (id: string, data: Omit<DataRecord, '_id' | 'date'>): Promise<DataRecord> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('userToken')}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || 'Error desconocido al actualizar el registro.';
        throw new Error(errorMessage);
      }
      return responseData;
    } catch (error) {
      console.error('Error en updateData:', error);
      throw error;
    }
  },
};

// ******************************************************************************
// 4. CONTEXTO DE AUTENTICACIÓN
// ******************************************************************************

/**
 * Proveedor de Contexto para el Login y la Autenticación
 */
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('userToken'));
  const [userToken, setUserToken] = useState<string | null>(sessionStorage.getItem('userToken'));

  const login = useCallback((token: string) => {
    sessionStorage.setItem('userToken', token);
    setUserToken(token);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('userToken');
    setUserToken(null);
    setIsLoggedIn(false);
  }, []);

  const value = { isLoggedIn, login, logout, userToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


// ******************************************************************************
// 5. COMPONENTES DEL FRONTEND (frontend/src/components)
// ******************************************************************************

// --- Header.tsx
const Header: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  return (
    <header className="bg-primary text-white p-3 shadow-lg">
      <div className="container d-flex justify-content-between align-items-center">
        <Link to="/" className="text-white text-decoration-none h4 mb-0">
          ⚛️ Data Science App
        </Link>
        <nav>
          <ul className="nav">
            <li className="nav-item">
              <Link to="/" className="nav-link text-white">Inicio</Link>
            </li>
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link text-white">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <button onClick={logout} className="btn btn-danger btn-sm align-self-center ml-2">Cerrar Sesión</button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link to="/login" className="nav-link text-white">Iniciar Sesión</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

// --- Footer.tsx
const Footer: React.FC = () => (
  <footer className="bg-dark text-white p-3 mt-auto">
    <div className="container text-center">
      <p className="mb-0">&copy; {new Date().getFullYear()} Data Science App | Desarrollado con React y Node.js</p>
    </div>
  </footer>
);

// --- Slider.tsx
const Slider: React.FC = () => (
  <div id="dataSlider" className="carousel slide mb-4" data-bs-ride="carousel">
    <div className="carousel-inner">
      <div className="carousel-item active bg-info text-white p-5">
        <h3>Bienvenido a tu Centro de Datos</h3>
        <p>Gestiona análisis, experimentos y simulaciones en un solo lugar.</p>
      </div>
      <div className="carousel-item bg-success text-white p-5">
        <h3>API REST Fullstack</h3>
        <p>Conexión segura y eficiente a MongoDB Atlas.</p>
      </div>
      <div className="carousel-item bg-warning text-dark p-5">
        <h3>React y TypeScript</h3>
        <p>Una experiencia de usuario robusta y tipada.</p>
      </div>
    </div>
  </div>
);

// --- Login.tsx
const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simulación de cifrado estático / Validación básica
    if (username === 'admin' && password === 'password123') {
      // Simulación de cifrado (en un entorno real, el backend manejaría el hash y el JWT)
      const token = FAKE_AUTH_TOKEN + btoa(username);
      login(token);
      navigate('/dashboard');
    } else {
      // Manejo de excepción/error en login
      setError('Credenciales inválidas. Usuario: admin, Clave: password123');
    }
  };

  return (
    <div className="container my-5">
      <div className="card shadow-lg mx-auto" style={{ maxWidth: '400px' }}>
        <div className="card-header bg-secondary text-white text-center">
          <h4>Iniciar Sesión</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Acceder</button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- FormData.tsx
interface FormDataProps {
  onDataSubmitted: () => void;
  initialData?: DataRecord | null;
  onClose?: () => void;
}

const FormDataComponent: React.FC<FormDataProps> = ({ onDataSubmitted, initialData = null, onClose }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  // CORRECCIÓN APLICADA AQUÍ (Línea 161 original): Usar undefined para el valor inicial
  const [dataType, setDataType] = useState<DataRecord['dataType'] | undefined>(initialData?.dataType || undefined); 
  const [description, setDescription] = useState(initialData?.description || '');
  const [value, setValue] = useState<number | string>(initialData?.value || '');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isEditing = initialData?._id;

  // Actualiza el estado si initialData cambia (para modo edición)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDataType(initialData.dataType);
      setDescription(initialData.description);
      setValue(initialData.value);
    } else {
      resetFormData();
    }
  }, [initialData]);


  const resetFormData = () => {
    setTitle('');
    setDataType(undefined); // Corrección aplicada en reset
    setDescription('');
    setValue('');
    setError('');
    setSuccess('');
    if (onClose) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const dataToSubmit: Omit<DataRecord, '_id' | 'date'> = {
      title,
      dataType: dataType as DataRecord['dataType'], // Cast seguro después de la validación
      description,
      value: Number(value),
    };

    const validationResult = validateDataRecord(dataToSubmit);

    if (validationResult !== true) {
      setError(validationResult);
      setIsLoading(false);
      return;
    }

    try {
      if (isEditing && initialData) {
        // Lógica de PUT
        await apiService.updateData(initialData._id!, dataToSubmit);
        setSuccess('¡Registro de datos actualizado con éxito!');
      } else {
        // Lógica de POST
        await apiService.postData(dataToSubmit);
        setSuccess('¡Registro de datos creado con éxito!');
      }
      onDataSubmitted();
      if (!isEditing) {
        resetFormData();
      }
    } catch (err) {
      // Manejo de excepciones en formulario
      const msg = err instanceof Error ? err.message : 'Error de comunicación con el servidor.';
      setError(`Error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-light">
        <h5 className="mb-0">{isEditing ? 'Editar Registro' : 'Ingreso de Nuevo Registro'}</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Título */}
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Título del Set de Datos</label>
            <input
              type="text"
              className="form-control"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Tipo de Dato */}
          <div className="mb-3">
            <label htmlFor="dataType" className="form-label">Tipo de Dato</label>
            <select
              className="form-select"
              id="dataType"
              value={dataType || ''} // Usamos '' para que 'undefined' funcione correctamente con el select
              onChange={(e) => setDataType(e.target.value as DataRecord['dataType'])}
              required
            >
              <option value="">Seleccione una categoría válida</option>
              <option value="Analysis">Análisis de Mercado</option>
              <option value="Experiment">Experimento Científico</option>
              <option value="Simulation">Simulación Computacional</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Descripción Detallada</label>
            <textarea
              className="form-control"
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Valor Numérico */}
          <div className="mb-3">
            <label htmlFor="value" className="form-label">Valor Clave (Ej. Puntuación, Resultado)</label>
            <input
              type="number"
              className="form-control"
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-success me-2" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : isEditing ? 'Actualizar Registro' : 'Guardar Registro'}
          </button>
          {isEditing && (
             <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
          )}
        </form>
      </div>
    </div>
  );
};


// --- Dashboard.tsx
const Dashboard: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [dataRecords, setDataRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);

  // Redirección si no está logeado (Manejo de excepción de ruta)
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const loadData = useCallback(async () => {
    if (!isLoggedIn) return;

    setLoading(true);
    setError(null);
    try {
      const data = await apiService.fetchData();
      setDataRecords(data);
    } catch (err) {
      setError('No se pudieron cargar los datos del servidor.');
      // Si el error es 401/403 (Autenticación), forzar el cierre de sesión
      // (Implementación real requeriría revisar el error de respuesta HTTP)
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDataSubmitted = () => {
    loadData();
    setIsModalOpen(false); // Cierra el modal después de guardar/actualizar
    setEditingRecord(null); // Limpia el registro en edición
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este registro? (Recuerda: NO usar alert() en Canvas, esto es un ejemplo en un entorno real)')) {
      try {
        await apiService.deleteData(id);
        loadData(); // Recarga la lista
      } catch (err) {
        setError('Error al eliminar el registro.');
      }
    }
  };
  
  const handleEdit = (record: DataRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setEditingRecord(null);
    setIsModalOpen(false);
  };

  if (loading) return <div className="text-center my-5"><span className="spinner-border text-primary"></span> Cargando datos...</div>;
  if (error) return <div className="alert alert-danger my-5">{error}</div>;
  if (!isLoggedIn) return null; // Espera la redirección

  return (
    <div className="container my-5">
      <h2 className="mb-4">Dashboard de Gestión de Datos</h2>
      <button className="btn btn-primary mb-4" onClick={() => { setEditingRecord(null); setIsModalOpen(true); }}>
        + Añadir Nuevo Registro
      </button>

      {/* Modal para Formulario (Añadir o Editar) */}
      {isModalOpen && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingRecord ? 'Editar Registro' : 'Añadir Nuevo Registro'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <FormDataComponent 
                  onDataSubmitted={handleDataSubmitted} 
                  initialData={editingRecord}
                  onClose={handleCloseModal}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Registros */}
      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="bg-dark text-white">
            <tr>
              <th>Título</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Valor</th>
              <th>Fecha de Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dataRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">No hay registros de datos. ¡Crea el primero!</td>
              </tr>
            ) : (
              dataRecords.map((record) => (
                <tr key={record._id}>
                  <td>{record.title}</td>
                  <td><span className={`badge ${record.dataType === 'Analysis' ? 'bg-info' : record.dataType === 'Experiment' ? 'bg-success' : 'bg-warning'} text-dark`}>{record.dataType}</span></td>
                  <td>{record.description.substring(0, 50)}...</td>
                  <td>{record.value.toFixed(2)}</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-info me-2 text-white" onClick={() => handleEdit(record)}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(record._id!)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Landing Page
const Home: React.FC = () => (
  <div className="container">
    <Slider />
    <section className="row mb-5">
      <div className="col-md-6">
        <h3>Backend Sólido</h3>
        <p>Node.js con Express, TypeScript y conexión a MongoDB Atlas para una persistencia de datos segura y escalable.</p>
      </div>
      <div className="col-md-6">
        <h3>Frontend Dinámico</h3>
        <p>React con Router y Bootstrap, ofreciendo una interfaz responsiva y moderna para la gestión de tus proyectos de ciencia de datos.</p>
      </div>
    </section>
  </div>
);


// ******************************************************************************
// 6. COMPONENTE PRINCIPAL (App.tsx)
// ******************************************************************************

const App: React.FC = () => {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <AuthProvider>
          <Header />
          <main className="flex-grow-1">
            <Routes>
              {/* Ruta de inicio */}
              <Route path="/" element={<Home />} />
              {/* Ruta de login */}
              <Route path="/login" element={<Login />} />
              {/* Ruta protegida por login */}
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Manejo de Excepción/Ruta no encontrada */}
              <Route path="*" element={<div className="container my-5 alert alert-warning"><h4>Error 404</h4><p>Ruta no encontrada.</p><Link to="/" className="btn btn-sm btn-outline-secondary">Volver al inicio</Link></div>} />
            </Routes>
          </main>
          <Footer />
        </AuthProvider>
      </div>
    </Router>
  );
};

export default App;
