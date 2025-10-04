import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      {/* App.tsx contiene toda la lógica, rutas y componentes */}
      <App />
    </React.StrictMode>
  );
} else {
  console.error("No se encontró el elemento raíz con ID 'root' en el HTML.");
}