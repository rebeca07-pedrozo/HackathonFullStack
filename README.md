#  Data Science App - Proyecto Fullstack (MERN-like Stack)

Este es un proyecto Fullstack construido con React y TypeScript en el Frontend, y Node.js/Express.js conectado a MongoDB Atlas en el Backend.

Sirve como una aplicación de gestión y visualización de datos simulados de Ciencia de Datos (CRUD).

##  Tecnologías Utilizadas

| Categoría | Tecnología | Versión/Detalle |
| :--- | :--- | :--- |
| **Frontend** | **React** | Componentes funcionales, Hooks |
| **Routing** | **React Router** | Navegación entre Login y Dashboard |
| **Lenguaje (FT/BK)** | **TypeScript** | Tipado estricto en ambos lados |
| **Estilos** | **Bootstrap** | Diseño responsive y componentes UI |
| **Backend** | **Node.js + Express.js** | Servidor API REST |
| **Base de Datos**| **MongoDB Atlas** | Persistencia de datos en la nube |
| **ORM** | **Mongoose** | Modelado y conexión con MongoDB |

##  Estructura del Proyecto

- **/data-science-app**
  - **/backend**
    - `server.ts` → Servidor principal Express
    - **/routes**
      - `apiRoutes.ts` → Definición de rutas CRUD y login
    - **/controllers**
      - `dataController.ts` → Lógica de negocio (Funciones CRUD)
    - **/models**
      - `dataModel.ts` → Definición del esquema Mongoose
    - **/middlewares**
      - `errorHandler.ts` → Manejo centralizado de errores y CustomError
    - **/utils**
      - `dbConnect.ts` → Función de conexión a MongoDB
  - **/frontend**
    - **/src**
      - `App.tsx` → Componente único con rutas y UI
  - `package.json` → Dependencias y scripts de inicio
  - `tsconfig.json` → Configuración de TypeScript
  - `.env` → Variables de entorno (¡clave!)


##  Configuración y Conexión a MongoDB Atlas

El Backend requiere una cadena de conexión a MongoDB para arrancar.

### 1. Crear el Archivo `.env`

Crea un archivo llamado `.env` en la **raíz del proyecto** (`/data-science-app/`) y añade las siguientes variables, reemplazando el placeholder por tu cadena real de Atlas:

PORT=5000
MONGO_URI='mongodb+srv://<user>:<password>@clustername.mongodb.net/data-science-db?retryWrites=true&w=majority'

markdown
Copiar código

### 2. Verificar la Conexión a Atlas

Asegúrate de haber configurado tu cluster en Atlas para:  
* Crear un **Usuario de Base de Datos** con contraseña.  
* Configurar **Network Access** para permitir el acceso (idealmente tu IP, o `0.0.0.0/0` para desarrollo).

##  Cómo Iniciar el Proyecto

Una vez que el archivo `.env` esté configurado, sigue estos pasos:

### 1. Instalar Dependencias

Abre la terminal en la raíz del proyecto y ejecuta:

npm install

css
Copiar código

### 2. Iniciar el Backend (API REST)

Esto compila el código TypeScript a JavaScript y arranca el servidor en el puerto 5000.

npm run start:backend

yaml
Copiar código

Verificación: Debes ver el mensaje: ✅ Conexión exitosa a MongoDB Atlas.

### 3. Iniciar el Frontend (React App)

Abre una **segunda terminal** y ejecuta. Esto inicia la aplicación React en el puerto 3000.

npm run start:frontend

yaml
Copiar código

##  Credenciales de Acceso (Simuladas)

Para ingresar al Dashboard, utiliza estas credenciales simuladas:

| Campo   | Valor        |
| ------- | ------------ |
| Usuario | admin        |
| Contraseña | password123 |



¡Eso es todo!

Rebeca Pedrozo Cueto 