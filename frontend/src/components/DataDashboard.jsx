import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  setLogLevel,
  deleteDoc,
  doc 
} from 'firebase/firestore';

// Habilitar logs de depuración de Firestore (útil para el desarrollo)
setLogLevel('debug');

// --- CONSTANTES GLOBALES DEL ENTORNO ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;


const VOICE_OPTIONS = [
  { name: 'Zephyr', description: 'Brillante' }, 
  { name: 'Puck', description: 'Animado' }, 
  { name: 'Charon', description: 'Informativo' },
  { name: 'Kore', description: 'Firme' }
];

// --- FUNCIONES DE UTILDAD DE AUDIO (TTS) ---

const base64ToArrayBuffer = (base64) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const pcmToWav = (pcm16, sampleRate) => {
  const numChannels = 1;
  const bytesPerSample = 2; // Int16
  const pcmData = pcm16.buffer;

  const buffer = new ArrayBuffer(44 + pcmData.byteLength);
  const view = new DataView(buffer);
  
  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + pcmData.byteLength, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 for PCM)
  view.setUint16(20, 1, true);
  // number of channels
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  // block align
  view.setUint16(32, numChannels * bytesPerSample, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, pcmData.byteLength, true);

  // Escribir los datos PCM
  const pcmArray = new Uint8Array(pcmData);
  for (let i = 0; i < pcmArray.length; i++) {
      view.setUint8(44 + i, pcmArray[i]);
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
};

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// --- COMPONENTE DE ENCABEZADO (HEADER) ---
const Header = ({ userId, view, setView }) => (
  <header className="bg-white shadow-md mb-8 py-4 px-6 rounded-xl">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
      <div className="text-left mb-3 sm:mb-0">
        <h1 className="text-3xl font-extrabold text-indigo-800">📊 DataScope Project</h1>
        <p className="text-gray-500 text-sm">Plataforma colaborativa de gestión de datos científicos.</p>
        
        {/* Selector de Vistas */}
        <div className="flex space-x-2 mt-3 p-1 bg-gray-50 rounded-lg">
          <button
            onClick={() => setView('dashboard')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition duration-150 ${
              view === 'dashboard' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('analytics')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition duration-150 ${
              view === 'analytics' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Análisis
          </button>
        </div>

      </div>
      <div className="text-right text-sm text-gray-500 bg-gray-100 p-2 rounded-lg">
        <p className="font-medium text-indigo-600">ID de Sesión (Compartido):</p>
        <p className="font-mono text-xs break-all">
          {userId ? userId : 'Conectando...'}
        </p>
      </div>
    </div>
  </header>
);

// --- VISTA DE ANÁLISIS ---
const AnalyticsView = ({ dataEntries }) => {
    
    // 1. Calcular resumen de datos
    const summaryData = useMemo(() => {
        const counts = { Analysis: 0, Experiment: 0, Simulation: 0 };
        const sums = { Analysis: 0, Experiment: 0, Simulation: 0 };
        
        dataEntries.forEach(entry => {
            if (counts.hasOwnProperty(entry.dataType)) {
                counts[entry.dataType] += 1;
                sums[entry.dataType] += entry.value || 0;
            }
        });

        // Convertir a formato de barra (por conteo)
        const totalCount = dataEntries.length;
        const barData = Object.keys(counts).map(key => ({
            name: key,
            count: counts[key],
            percent: totalCount > 0 ? (counts[key] / totalCount) * 100 : 0,
            avg: counts[key] > 0 ? sums[key] / counts[key] : 0
        })).sort((a, b) => b.count - a.count);

        return { barData, totalCount };
    }, [dataEntries]);

    const { barData, totalCount } = summaryData;

    const colorMap = {
        'Analysis': 'bg-blue-500',
        'Experiment': 'bg-purple-500',
        'Simulation': 'bg-teal-500'
    };


    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Análisis y Distribución de Datos</h2>
            <p className="text-gray-600">Visualización de la distribución de los **{totalCount}** registros en la base de datos.</p>

            {totalCount === 0 ? (
                <div className="bg-yellow-100 text-yellow-800 p-6 rounded-xl shadow-lg">
                    <p className="font-medium">No hay datos suficientes para generar gráficos. ¡Registra algunas entradas primero!</p>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                    <h3 className="text-xl font-semibold border-b pb-2 text-indigo-600">Distribución por Tipo de Dato (Conteo)</h3>
                    
                    {barData.map(item => (
                        <div key={item.name} className="space-y-1">
                            <div className="flex justify-between text-sm font-medium text-gray-700">
                                <span>{item.name} ({item.count} entradas)</span>
                                <span>{item.percent.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className={`${colorMap[item.name]} h-3 rounded-full transition-all duration-500`} 
                                    style={{ width: `${item.percent}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500">Valor promedio: **{item.avg.toFixed(2)}**</p>
                        </div>
                    ))}
                </div>
            )}
            
        </div>
    );
}

// --- VISTA DEL DASHBOARD (CONTENIDO ANTERIOR) ---
const DashboardView = ({ 
    db, 
    userId, 
    dataEntries, 
    form, 
    handleChange, 
    addDataEntry, 
    message, 
    ttsStatus, 
    speakDataSummary,
    appId
}) => {
    
    // Función para eliminar un registro
    const deleteDataEntry = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta entrada de datos?')) {
            return;
        }

        try {
            const dataCollectionPath = `artifacts/${appId}/public/data/dataEntries`;
            const docRef = doc(db, dataCollectionPath, id);
            await deleteDoc(docRef);
            
            // Simulación de mensaje modal simple sin usar alert()
            document.getElementById('modal-message').innerText = '✅ Entrada eliminada con éxito.';
            setTimeout(() => document.getElementById('modal-message').innerText = '', 3000);
            
        } catch (error) {
            console.error("Error al eliminar datos:", error);
            document.getElementById('modal-message').innerText = `❌ Error al eliminar: ${error.message}`;
            setTimeout(() => document.getElementById('modal-message').innerText = '', 5000);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            
            {/* Panel de Ingreso de Datos (Columna 1) */}
            <section className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit sticky top-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">Registrar Nueva Entrada</h2>
                
                <form onSubmit={addDataEntry} className="space-y-4">
                
                {/* Campo Fecha */}
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha del Registro</label>
                    <input
                    type="date"
                    name="date"
                    id="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                    />
                </div>

                {/* Campo Tipo de Dato */}
                <div>
                    <label htmlFor="dataType" className="block text-sm font-medium text-gray-700">Tipo de Dato</label>
                    <select
                    name="dataType"
                    id="dataType"
                    value={form.dataType}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500 appearance-none bg-white transition duration-150"
                    >
                    <option value="Analysis">Análisis</option>
                    <option value="Experiment">Experimento</option>
                    <option value="Simulation">Simulación</option>
                    </select>
                </div>

                {/* Campo Valor */}
                <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-700">Valor (Numérico)</label>
                    <input
                    type="number"
                    name="value"
                    id="value"
                    value={form.value}
                    onChange={handleChange}
                    placeholder="Ej: 42.5"
                    step="0.01"
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                    />
                </div>

                {/* Campo Descripción */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                    <textarea
                    name="description"
                    id="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Observaciones sobre la entrada de datos."
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                    />
                </div>

                {/* Botón de Enviar */}
                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
                    disabled={!db || !userId}
                >
                    {db && userId ? '💾 Guardar Entrada de Datos' : 'Conectando Base de Datos...'}
                </button>
                </form>

                {/* Mensajes del Sistema */}
                {message && (
                <p className={`mt-4 p-3 rounded-lg text-sm ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </p>
                )}

                {/* Estado TTS y Modal de Borrado */}
                {ttsStatus && (
                <p className="mt-4 p-3 rounded-lg text-sm bg-blue-100 text-blue-700 animate-pulse">
                    {ttsStatus}
                </p>
                )}
                <p id="modal-message" className="mt-4 p-3 rounded-lg text-sm text-center text-red-700"></p>

            </section>
            
            {/* Panel de Visualización de Datos (Columna 2 y 3) */}
            <section className="lg:col-span-2">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Visualización de Registros ({dataEntries.length})</h2>

                {dataEntries.length === 0 ? (
                <div className="bg-yellow-100 text-yellow-800 p-6 rounded-xl shadow-lg">
                    <p className="font-medium">No hay registros de datos. ¡Usa el formulario para empezar a crear entradas!</p>
                </div>
                ) : (
                <div className="space-y-4">
                    {dataEntries.map((entry) => (
                    <div key={entry.id} className="bg-white p-4 rounded-xl shadow-md border-l-4 border-indigo-500 transition duration-200 hover:shadow-lg">
                        <div className="sm:flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                            <p className="text-xs text-gray-500">
                            {entry.timestamp?.seconds ? new Date(entry.timestamp.seconds * 1000).toLocaleString('es-ES') : 'Fecha no disponible'}
                            </p>
                            <span className="text-xl font-bold text-indigo-700">
                            {entry.value ? entry.value.toFixed(2) : 'N/A'}
                            </span>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full mt-2 sm:mt-0 ${
                            entry.dataType === 'Analysis' ? 'bg-blue-100 text-blue-800' :
                            entry.dataType === 'Experiment' ? 'bg-purple-100 text-purple-800' :
                            'bg-teal-100 text-teal-800'
                        }`}>
                            {entry.dataType}
                        </span>
                        </div>
                        
                        <p className="text-gray-700 text-sm italic mt-1">
                        {entry.description || 'Sin descripción.'}
                        </p>

                        {/* Funcionalidad TTS y Borrar */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                            
                            {/* Selector de Voz TTS */}
                            <select
                                id={`voice-${entry.id}`}
                                className="py-1 px-2 text-sm rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {VOICE_OPTIONS.map(v => (
                                    <option key={v.name} value={v.name}>{v.name} ({v.description})</option>
                                ))}
                            </select>

                            {/* Botón TTS */}
                            <button
                                onClick={() => {
                                    const selectElement = document.getElementById(`voice-${entry.id}`);
                                    speakDataSummary(entry, selectElement.value);
                                }}
                                className="py-1 px-3 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600 transition duration-150 disabled:opacity-50"
                                disabled={!!ttsStatus}
                            >
                                {/* Icono de altavoz */}
                                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H3a1 1 0 01-1-1V9a1 1 0 011-1h2.586l4.707-4.707A1 1 0 0112 3v18a1 1 0 01-1.707.707L5.586 15z"></path></svg>
                                Leer Resumen (TTS)
                            </button>

                            {/* Botón Borrar (DELETE) */}
                            <button
                                onClick={() => deleteDataEntry(entry.id)}
                                className="ml-auto py-1 px-3 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition duration-150"
                            >
                                {/* Icono de basura */}
                                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                Eliminar
                            </button>

                            <span className="text-xs text-gray-400">
                                Por: {entry.userId ? entry.userId.substring(0, 8) : 'Anónimo'}
                            </span>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </section>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL (App) ---
const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [dataEntries, setDataEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // Nuevo estado para la navegación
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    dataType: 'Analysis',
    value: '',
    description: '',
  });
  const [message, setMessage] = useState('');
  const [ttsStatus, setTtsStatus] = useState(null);

  // 1. Inicialización de Firebase y Autenticación
  useEffect(() => {
    if (Object.keys(firebaseConfig).length === 0) {
      console.error("Firebase Config no está disponible.");
      setLoading(false);
      return;
    }

    try {
      const firebaseApp = initializeApp(firebaseConfig);
      const authInstance = getAuth(firebaseApp);
      const dbInstance = getFirestore(firebaseApp);
      
      setAuth(authInstance);
      setDb(dbInstance);

      // Manejo de autenticación
      const authenticate = async () => {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(authInstance, initialAuthToken);
          } else {
            await signInAnonymously(authInstance);
          }
        } catch (error) {
          console.error("Error durante la autenticación:", error);
          await signInAnonymously(authInstance);
        }
      };

      authInstance.onAuthStateChanged(currentUser => {
        if (currentUser) {
          setUser(currentUser);
          setUserId(currentUser.uid);
        } else if (authInstance && !currentUser) {
          // Si no hay usuario, forzar el inicio anónimo si la autenticación inicial falló
          authenticate();
        }
        setLoading(false);
      });
      
    } catch (e) {
      console.error("Error al inicializar Firebase:", e);
      setLoading(false);
    }
  }, []);

  // 2. Listener en Tiempo Real (onSnapshot)
  useEffect(() => {
    if (db && userId) {
      // Ruta para datos públicos/compartidos del proyecto
      const dataCollectionPath = `artifacts/${appId}/public/data/dataEntries`;
      const q = query(collection(db, dataCollectionPath), orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const dataList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDataEntries(dataList);
      }, (error) => {
        console.error("Error al escuchar datos:", error);
      });

      return () => unsubscribe();
    }
  }, [db, userId]); 

  // Manejadores de formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addDataEntry = async (e) => {
    e.preventDefault();
    if (!db || !userId) {
      setMessage('Error: Autenticación o base de datos no lista.');
      return;
    }
    
    // Validación básica de campos
    if (!form.date || form.value === '' || !form.dataType) {
        setMessage('Por favor, completa la Fecha, Tipo de Dato y Valor.');
        return;
    }

    try {
      const dataCollectionPath = `artifacts/${appId}/public/data/dataEntries`;
      await addDoc(collection(db, dataCollectionPath), {
        date: new Date(form.date),
        dataType: form.dataType,
        value: Number(form.value),
        description: form.description,
        timestamp: serverTimestamp(), // Marca de tiempo del servidor
        userId: userId, 
      });

      setMessage('✅ Entrada de datos registrada con éxito.');
      setForm({
        date: new Date().toISOString().split('T')[0],
        dataType: 'Analysis',
        value: '',
        description: '',
      });

    } catch (error) {
      setMessage(`❌ Error al añadir datos: ${error.message}`);
      console.error("Error al añadir datos:", error);
    }
  };

  // --- Función de TTS (Generación de Audio) ---
  const speakDataSummary = async (entry, voiceName) => {
    if (!voiceName) {
        setTtsStatus('Selecciona una voz.');
        return;
    }

    // Convertir Firestore Timestamp a objeto Date para formatear
    let entryDate;
    try {
      // Si es un objeto Timestamp de Firestore
      entryDate = entry.date.toDate ? entry.date.toDate() : new Date(entry.date.seconds * 1000);
    } catch (e) {
      // Si ya es un objeto Date o un string
      entryDate = new Date(entry.date);
    }

    const textToSpeak = `El dato ${entry.dataType} registrado el ${entryDate.toLocaleDateString('es-ES')}. El valor es ${entry.value.toFixed(2)}. Descripción: ${entry.description || 'No provista'}.`;
    setTtsStatus(`Generando audio con voz ${voiceName}...`);

    const payload = {
      contents: [{
        parts: [{ text: textToSpeak }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName }
            }
        }
      },
      model: "gemini-2.5-flash-preview-tts"
    };

    const apiKey = ""; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

    const fetchWithBackoff = async (url, options, retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (response.ok) return response;
                
                // Si falla (pero no es error de red), intentar de nuevo
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Backoff exponencial
                } else {
                    throw new Error(`Fallo en la llamada API después de ${retries} intentos: ${response.statusText}`);
                }
            } catch (error) {
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                } else {
                    throw error;
                }
            }
        }
    };


    try {
      const response = await fetchWithBackoff(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      const part = result?.candidates?.[0]?.content?.parts?.[0];
      const audioData = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType;

      if (audioData && mimeType && mimeType.startsWith("audio/")) {
        const pcmData = base64ToArrayBuffer(audioData);
        // La API devuelve datos PCM16 firmados.
        const sampleRateMatch = mimeType.match(/rate=(\d+)/);
        const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 16000;
        
        const pcm16 = new Int16Array(pcmData);
        const wavBlob = pcmToWav(pcm16, sampleRate);
        const audioUrl = URL.createObjectURL(wavBlob);
        
        const audio = new Audio(audioUrl);
        audio.play();
        setTtsStatus(`Reproduciendo resumen con voz ${voiceName}.`);
        audio.onended = () => setTtsStatus(null);

      } else {
        setTtsStatus('❌ Error al generar audio. Respuesta inesperada.');
        console.error("Respuesta del API TTS inesperada:", result);
      }
    } catch (error) {
      setTtsStatus(`❌ Error en la llamada al API: ${error.message}`);
      console.error("Error en TTS:", error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-indigo-600">Cargando aplicación y autenticación...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-0 sm:p-4 font-inter flex flex-col">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
      `}</style>
      
      <Header userId={userId} view={currentView} setView={setCurrentView} />

      {/* Contenido principal con margen superior e inferior */}
      <main className="flex-grow p-4 sm:p-0 max-w-7xl mx-auto w-full">
        {currentView === 'dashboard' && (
          <DashboardView 
            db={db}
            userId={userId}
            dataEntries={dataEntries}
            form={form}
            handleChange={handleChange}
            addDataEntry={addDataEntry}
            message={message}
            ttsStatus={ttsStatus}
            speakDataSummary={speakDataSummary}
            appId={appId}
          />
        )}
        {currentView === 'analytics' && (
          <AnalyticsView 
            dataEntries={dataEntries}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-indigo-700 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-300">
          <p className="text-sm">© {new Date().getFullYear()} DataScope Project. Desarrollado con React, Firebase/Firestore, y la API de Gemini.</p>
          <p className="text-xs mt-1">Solución de prototipo Full-Stack para gestión de entradas de datos científicos.</p>
        </div>
      </footer>

    </div>
  );
};

export default App;
