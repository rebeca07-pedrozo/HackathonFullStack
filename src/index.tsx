import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importa tu componente principal App.tsx

// Busca el elemento raíz en index.html (el div con id="root")
const rootElement = document.getElementById('root');

if (rootElement) {
  // Crea el contenedor de React 18
  const root = ReactDOM.createRoot(rootElement);

  // Renderiza el componente App dentro del contenedor
  root.render(
    <React.StrictMode>
      {/* App.tsx contiene toda la lógica, rutas y componentes */}
      <App />
    </React.StrictMode>
  );
} else {
  console.error("No se encontró el elemento raíz con ID 'root' en el HTML.");
}