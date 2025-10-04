import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// --- DEFINICIÓN DE TIPOS ---

// Tipos de datos para el select del formulario
type DataType = 'Analysis' | 'Experiment' | 'Simulation';

// Interfaz para la estructura de un registro de datos (debe coincidir con MongoDB)
interface DataEntry {
  _id: string;
  date: string; // La fecha viene como string desde el backend (ISO date)
  dataType: DataType;
  value: number;
  description: string;
}

// Interfaz para los errores de validación del formulario
interface FormErrors {
  dataType?: string;
  value?: string;
  description?: string;
}

// Interfaz para la respuesta de la API (solo GET)
interface ApiResponse {
  status: 'success' | 'error';
  data: { entries: DataEntry[] };
  message?: string;
}

// --- CONFIGURACIÓN DE LA API ---
// Se usa la ruta relativa /api, el proxy en package.json la redirige a http://127.0.0.1:5000/api
const API_BASE_URL = '/api'; 

// --- UTILIDADES ---

/**
 * Valida los campos del formulario.
 * @param data Objeto con los datos del formulario.
 * @returns Objeto con errores de validación.
 */
const validateForm = (data: Partial<DataEntry>): FormErrors => {
  const errors: FormErrors = {};

  if (!data.dataType) {
    errors.dataType = 'Debe seleccionar un tipo de dato.';
  }
  // Usamos una verificación más estricta para el valor
  const numValue = Number(data.value);
  if (isNaN(numValue) || numValue <= 0) {
    errors.value = 'El valor debe ser un número positivo.';
  }
  if (data.description && data.description.length > 200) {
    errors.description = 'La descripción es demasiado larga (máx. 200 caracteres).';
  }
  return errors;
};

// --- SERVICIOS API ---

/**
 * Realiza una petición genérica a la API.
 * @param endpoint Ruta del API.
 * @param method Método HTTP (GET, POST, etc.).
 * @param body Cuerpo de la petición para POST/PUT.
 * @returns Promesa con los datos de la respuesta.
 */
const apiCall = async (endpoint: string, method: string, body?: any): Promise<any> => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : null,
  };

  // La URL usa API_BASE_URL que ahora es solo '/api' y el proxy se encarga del resto
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (response.status === 204) {
      return { status: 'success', message: 'Operación exitosa' };
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Error en la petición: ${response.status}`);
  }

  return data;
};

// --- COMPONENTES ---

// ----------------------------------------------------------------
// Componente Header (Menu y Navegación)
// ----------------------------------------------------------------
interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand d-flex align-items-center" href="/">
          <span className="h4 mb-0 ms-2">📊 Data Science App</span>
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Inicio</a>
            </li>
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <a className="nav-link" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>Dashboard</a>
                </li>
                <li className="nav-item ms-lg-3">
                  <button className="btn btn-danger" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </li>
              </>
            )}
            {!isLoggedIn && (
               <li className="nav-item">
                <a className="nav-link btn btn-success text-white" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
                  Iniciar Sesión
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

// ----------------------------------------------------------------
// Componente Footer
// ----------------------------------------------------------------
const Footer: React.FC = () => (
  <footer className="footer mt-auto py-3 bg-dark text-white">
    <div className="container text-center">
      <small>
        © Rebeca Pedrozo Cueto - Programación Web - Hackathon Full Stack - 2025
      </small>
    </div>
  </footer>
);

// ----------------------------------------------------------------
// Componente Slider (Carrusel simple de Bootstrap)
// ----------------------------------------------------------------
const Slider: React.FC = () => (
  <div id="dataSlider" className="carousel slide shadow-lg mb-4" data-bs-ride="carousel">
    <div className="carousel-inner rounded-3">
      <div className="carousel-item active" style={{ height: '250px', backgroundColor: '#007bff' }}>
        <div className="d-flex h-100 align-items-center justify-content-center text-white">
          <h3 className="display-4">Análisis Predictivo</h3>
        </div>
      </div>
      <div className="carousel-item" style={{ height: '250px', backgroundColor: '#28a745' }}>
        <div className="d-flex h-100 align-items-center justify-content-center text-white">
          <h3 className="display-4">Simulación de Modelos</h3>
        </div>
      </div>
      <div className="carousel-item" style={{ height: '250px', backgroundColor: '#ffc107' }}>
        <div className="d-flex h-100 align-items-center justify-content-center text-dark">
          <h3 className="display-4">Resultados de Experimentos</h3>
        </div>
      </div>
    </div>
    <button className="carousel-control-prev" type="button" data-bs-target="#dataSlider" data-bs-slide="prev">
      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Previous</span>
    </button>
    <button className="carousel-control-next" type="button" data-bs-target="#dataSlider" data-bs-slide="next">
      <span className="carousel-control-next-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Next</span>
    </button>
  </div>
);


// ----------------------------------------------------------------
// Componente Formulario de Datos (CRUD: Create/Update)
// ----------------------------------------------------------------
interface FormDataProps {
  onDataSubmitted: () => void;
  entryToEdit: DataEntry | null;
  onCloseEdit: () => void;
}

const FormDataComponent: React.FC<FormDataProps> = ({ onDataSubmitted, entryToEdit, onCloseEdit }) => {
  // Estado para manejar el formulario. dataType debe inicializarse como undefined o un valor válido.
  const [formData, setFormData] = useState<Partial<DataEntry>>(entryToEdit || {
    dataType: undefined,
    value: undefined,
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Sincronizar el formulario si se pasa un registro a editar
  useEffect(() => {
    setFormData(entryToEdit || {
      dataType: undefined,
      value: undefined,
      description: '',
    });
    setErrors({});
    setMessage('');
  }, [entryToEdit]);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Si el nombre es 'value', intenta parsear a float, sino usa el valor string
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'value' ? (parseFloat(value) || value) : value 
    }));
    // Limpiar el error al escribir
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Convertimos el valor a número antes de validar/enviar
    const dataToValidate = {
        ...formData,
        value: Number(formData.value)
    } as Partial<DataEntry>;
    
    const validationErrors = validateForm(dataToValidate);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage('⚠️ Por favor, corrige los errores en el formulario.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const isEditing = !!entryToEdit;
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing ? `/data/${entryToEdit._id}` : '/data';
      
      const dataToSend = {
          ...formData,
          // Aseguramos que la fecha se envíe correctamente si se está creando
          date: new Date().toISOString()
      };

      await apiCall(endpoint, method, dataToSend);

      setMessage(`✅ Dato ${isEditing ? 'actualizado' : 'guardado'} exitosamente.`);
      setErrors({});
      onDataSubmitted(); // Notificar al Dashboard que recargue los datos
      
      // Limpiar formulario y cerrar modo edición
      if (!isEditing) {
        setFormData({ dataType: undefined, value: undefined, description: '' });
      } else {
        onCloseEdit(); 
      }
      
    } catch (err: any) {
      setMessage(`❌ Error del servidor: ${err.message || 'No se pudo completar la operación.'}`);
    } finally {
      setLoading(false);
    }
  };

  const title = entryToEdit ? `Editar Registro ID: ${entryToEdit._id.substring(0, 8)}...` : 'Ingreso de Nuevo Registro de Datos';

  return (
    <div className="card shadow-lg mb-4">
      <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{title}</h5>
        {entryToEdit && (
            <button className="btn btn-warning btn-sm" onClick={onCloseEdit}>
                Cancelar Edición
            </button>
        )}
      </div>
      <div className="card-body">
        {message && (
          <div className={`alert ${message.startsWith('❌') ? 'alert-danger' : 'alert-success'}`} role="alert">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Campo Tipo de Dato */}
          <div className="mb-3">
            <label htmlFor="dataType" className="form-label">Tipo de Dato</label>
            <select
              className={`form-select ${errors.dataType ? 'is-invalid' : ''}`}
              id="dataType"
              name="dataType"
              value={formData.dataType || ''} // Usamos || '' para manejar undefined en select
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Seleccione...</option>
              <option value="Analysis">Análisis</option>
              <option value="Experiment">Experimento</option>
              <option value="Simulation">Simulación</option>
            </select>
            {errors.dataType && <div className="invalid-feedback">{errors.dataType}</div>}
          </div>

          {/* Campo Valor */}
          <div className="mb-3">
            <label htmlFor="value" className="form-label">Valor Numérico</label>
            <input
              type="number"
              className={`form-control ${errors.value ? 'is-invalid' : ''}`}
              id="value"
              name="value"
              // Convertimos a string para mostrar en el input type="number"
              value={formData.value !== undefined ? String(formData.value) : ''} 
              onChange={handleChange}
              disabled={loading}
              step="any"
            />
            {errors.value && <div className="invalid-feedback">{errors.value}</div>}
          </div>

          {/* Campo Descripción */}
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Descripción (Opcional)</label>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              id="description"
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {entryToEdit ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              entryToEdit ? 'Actualizar Registro' : 'Guardar Registro'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------
// Componente Dashboard (Vista principal de la App)
// ----------------------------------------------------------------
const Dashboard: React.FC = () => {
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<DataEntry | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Estado para el análisis de Gemini
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Función para obtener datos de la API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result: ApiResponse = await apiCall('/data', 'GET');
      setDataEntries(result.data.entries || []);
    } catch (err: any) {
      setError('No se pudieron cargar los datos del servidor. Asegúrate de que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- FUNCIÓN LLM DE GEMINI ---
  const generateAnalysis = async () => {
    if (dataEntries.length === 0) {
        setAnalysisResult("No hay datos para analizar. Ingresa algunos registros primero.");
        return;
    }
    
    setAnalysisLoading(true);
    setAnalysisResult(null);

    // 1. Formatear los datos para el LLM
    const formattedData = dataEntries.map(entry => ({
        type: entry.dataType,
        value: entry.value.toFixed(2),
        description: entry.description,
        date: new Date(entry.date).toLocaleDateString()
    }));

    const systemPrompt = "Eres un analista de datos experimentado. Basado en los datos de entrada, genera un resumen ejecutivo conciso (máximo 3 párrafos). Identifica la distribución de tipos de datos, el valor promedio total, y cualquier tendencia o valor atípico notable. El resumen debe ser formal y en español.";
    const userQuery = `Analiza el siguiente conjunto de datos científicos: ${JSON.stringify(formattedData)}`;
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const result = await response.json();
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (generatedText) {
            setAnalysisResult(generatedText);
        } else {
            setAnalysisResult("Error: No se pudo generar el análisis. Inténtalo de nuevo.");
        }

    } catch (e: any) {
        setAnalysisResult(`Error al conectar con Gemini: ${e.message}. Asegúrate de que tu clave API sea válida.`);
        console.error("Gemini API Error:", e);
    } finally {
        setAnalysisLoading(false);
    }
  };
  // --- FIN FUNCIÓN LLM DE GEMINI ---


  // Manejar eliminación
  const handleDelete = async (id: string) => {
    // Usar ventana de confirmación nativa ya que el entorno Canvas permite la ejecución
    if (!window.confirm("¿Estás seguro de que quieres eliminar este registro?")) {
        return;
    }

    try {
      await apiCall(`/data/${id}`, 'DELETE');
      setSuccessMessage('✅ Registro eliminado exitosamente.');
      fetchData(); // Recargar datos
      setAnalysisResult(null); // Limpiar análisis al modificar datos
    } catch (err: any) {
      setError(`❌ Error al eliminar: ${err.message}`);
    }
  };

  // Función para iniciar la edición
  const handleEdit = (entry: DataEntry) => {
    setEntryToEdit(entry);
    setSuccessMessage(null); // Limpiar mensaje de éxito
    window.scrollTo(0, 0); // Desplazar al inicio para ver el formulario
  };
  
  // Función para cerrar el modo edición
  const handleCloseEdit = () => {
    setEntryToEdit(null);
  };

  return (
    <div className="container my-5">
      <h1 className="mb-4 text-primary">Panel de Gestión de Datos Científicos</h1>

      {/* Mensajes de Error y Éxito */}
      {error && (
        <div className="alert alert-danger shadow" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success shadow d-flex justify-content-between align-items-center" role="alert">
            {successMessage}
            <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)} aria-label="Close"></button>
        </div>
      )}

      {/* Columna de Formulario (siempre visible, se convierte en edición) */}
      <FormDataComponent 
        onDataSubmitted={() => {
            fetchData();
            setAnalysisResult(null); // Limpiar análisis al ingresar nuevos datos
            setSuccessMessage('Operación de datos completada exitosamente.');
        }}
        entryToEdit={entryToEdit}
        onCloseEdit={handleCloseEdit}
      />
      
      {/* SECCIÓN GEMINI (ANÁLISIS DE DATOS) */}
      <div className="card shadow mt-4 mb-4">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Análisis Avanzado de Registros</h5>
            <button 
                className="btn btn-warning btn-sm"
                onClick={generateAnalysis}
                disabled={dataEntries.length === 0 || analysisLoading}
            >
                {analysisLoading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Analizando...
                    </>
                ) : (
                    <>✨ Generar Resumen Analítico</>
                )}
            </button>
        </div>
        <div className="card-body">
            {analysisResult && (
                <div className="analysis-output p-3 border rounded bg-light">
                    <h6 className="text-info">Resumen Ejecutivo:</h6>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{analysisResult}</p>
                </div>
            )}
            {!analysisResult && !analysisLoading && dataEntries.length > 0 && (
                <p className="text-muted text-center mb-0">Haz clic en "Generar Resumen Analítico" para obtener una perspectiva de IA sobre tus datos.</p>
            )}
            {dataEntries.length === 0 && (
                <p className="text-muted text-center mb-0">Ingresa datos para activar el análisis de Gemini.</p>
            )}
        </div>
      </div>
      {/* FIN SECCIÓN GEMINI */}


      {/* Sección de Datos Almacenados */}
      <div className="card shadow mt-4">
        <div className="card-header bg-info text-white">
            <h5 className="mb-0">Datos Almacenados en MongoDB Atlas ({dataEntries.length} registros)</h5>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
                <span className="spinner-border text-primary" role="status"></span>
                <p className="mt-2">Cargando datos...</p>
            </div>
          ) : dataEntries.length === 0 ? (
            <div className="alert alert-warning m-3 text-center">
                Aún no hay registros de datos. ¡Usa el formulario para empezar!
            </div>
          ) : (
            <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>ID Corto</th>
                            <th>Tipo</th>
                            <th>Valor</th>
                            <th>Descripción</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataEntries.map((entry) => (
                            <tr key={entry._id}>
                                <td>{entry._id.substring(0, 8)}...</td>
                                <td><span className={`badge ${entry.dataType === 'Analysis' ? 'bg-primary' : entry.dataType === 'Experiment' ? 'bg-success' : 'bg-warning text-dark'}`}>{entry.dataType}</span></td>
                                <td>{entry.value.toFixed(2)}</td>
                                <td>{entry.description || '-'}</td>
                                <td>{new Date(entry.date).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn btn-sm btn-info me-2 text-white" onClick={() => handleEdit(entry)}>Editar</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(entry._id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};


interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const LoginComponent: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await apiCall('/login', 'POST', { username, password });
      
      onLoginSuccess(result.token);
      
    } catch (err: any) {
      setError(err.message || 'Error de conexión. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 150px)' }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="card-title text-center text-primary mb-4">Iniciar Sesión</h3>
        <p className="text-center text-muted">Usa: admin / password123</p>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Ingresando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};



const App: React.FC = () => {
  const [userToken, setUserToken] = useState<string | null>(localStorage.getItem('token') || null);
  const isLoggedIn = !!userToken;
  const navigate = useNavigate();

  const handleLoginSuccess = (token: string) => {
    setUserToken(token);
    localStorage.setItem('token', token);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUserToken(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginComponent onLoginSuccess={handleLoginSuccess} />} />
            
            {/* Ruta Protegida: Solo acceso si está logeado */}
            <Route 
              path="/dashboard" 
              element={isLoggedIn ? <Dashboard /> : <NavigateToLogin />} 
            />
          </Routes>
      </main>
      <Footer />
    </div>
  );
};

const NavigateToLogin: React.FC = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/login');
    }, [navigate]);
    return (
      <div className="container my-5 text-center">
        <p className="alert alert-warning">Acceso denegado. Redirigiendo a Iniciar Sesión...</p>
      </div>
    );
};

const Home: React.FC = () => (
    <div className="container my-5 text-center">
        <h1 className="display-4 text-primary">Bienvenido a Data Science App</h1>
        <p className="lead">La plataforma para gestionar y visualizar tus datos científicos.</p>
        <Slider />
    </div>
);


const WrappedApp: React.FC = () => (
    <Router>
        <App />
    </Router>
);

export default WrappedApp;
