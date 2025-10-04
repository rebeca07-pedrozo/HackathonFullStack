# Data Science App - Proyecto Fullstack Funcional

Este proyecto representa una aplicación Fullstack robusta para la gestión y análisis (CRUD) de datos científicos. Superamos múltiples desafíos de configuración de entornos y dependencias para lograr la funcionalidad completa.  

# Vistas 

![Pantalla de Inicio1](./pics/vista1.png)
![Pantalla de Inicio2](./pics/vista2.png)
![Login](./pics/iniciarSesion.png)
![Dashboard](./pics/vista3.png)


## Requisitos del Proyecto Cumplidos

| Módulo | Requisito Cumplido | Detalle de Implementación | 
 | :--- | :--- | :--- | 
| **Frontend** | React, TypeScript, HTML5, CSS3, JavaScript | Toda la aplicación en `src/App.tsx` y `src/index.tsx`. | 
| **Diseño** | Bootstrap (Menu, Header, Footer, Sliders) | Utilizado para diseño responsive y componentes UI. | 
| **Rutas** | React Router | Manejo de rutas `/login`, `/dashboard`, y `/`. | 
| **Datos** | Formularios con Validaciones | Validación de campos y valores positivos en `FormDataComponent`. | 
| **Acceso** | Login e Inicio de Sesión (Simulación Estática) | Implementado en `apiRoutes.ts` y `LoginComponent` con credenciales estáticas. | 
| **API/LLM** | Análisis de IA (Gemini API) | Nueva función en el Dashboard que analiza los datos de MongoDB y genera un **Resumen Ejecutivo**. | 
| **Backend** | Node.js con Express.js | Servidor funcionando en puerto 5000. | 
| **Persistencia** | MongoDB Atlas (Conexión No Local) | Conexión probada y estable, gestionada por Mongoose. | 
| **CRUD** | API REST (GET, POST, DELETE, PUT) | Implementado en `apiRoutes.ts` y `dataController.ts`. | 
| **Errores** | Manejo de Excepciones | Middleware `errorHandler.ts` para capturar errores de servidor, conexión, validación y concurrencia. | 

## Estructura Final y Ubicaciones Clave

La estructura se ajustó para cumplir con los requisitos del servidor de desarrollo de React (`react-scripts`).
```
/data-science-app (Raíz del Proyecto)
├── /backend
│   ├── server.ts           # Servidor principal (Conexión BD, CORS, Middlewares)
│   ├── /controllers
│   │    └── dataController.ts  # Lógica CRUD
│   └── ... (otros archivos de backend)
├── /dist                   # Código JS compilado por TypeScript
├── /node_modules
├── /public                 # Contiene index.html (Punto de entrada HTML)
├── /src
│   ├── index.tsx           # Punto de entrada de la aplicación React
│   └── App.tsx             # TODA la lógica, componentes (Login, Dashboard, Gemini)
├── .env                    # MONGO_URI y PORT
├── package.json            # Scripts de inicio y configuración de proxy
└── tsconfig.json
```

## Datos de Acceso y Comandos de Inicio

### 1. Variables de Entorno
 
PORT=5000
`MONGO_URI=mongodb+srv://rebecapedrozocueto_db_user:DXh5Q3LcfCtwmUsD@clusterparaweb.udelnpd.mongodb.net/data-science-db?retryWrites=true&w=majority&appName=ClusterParaWeb`


### 2. Instalación 

`Si desea hacer clone al proyecto ejecute el siguiente comando: 

```bash
npm install --legacy-peer-deps
```

### 3. Iniciar el Proyecto Fullstack

Se necesitan **dos terminales** abiertas en la raíz del proyecto.

| Servicio | Comando | Puerto | 
 | :--- | :--- | :--- | 
| **Backend (API)** | `npm run start:backend` | 5000 | 
| **Frontend (React)** | `npm run start:frontend` | 3000 | 

### 4. Credenciales de Login (Simulado)

Una vez que ambos servicios estén corriendo, usa estas credenciales para acceder al Dashboard:

| Campo | Valor | 
 | :--- | :--- | 
| **Usuario** | `admin` | 
| **Contraseña** | `password123` | 

