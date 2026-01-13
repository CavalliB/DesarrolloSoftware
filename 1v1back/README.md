# Documentación del backend de 1v1back (backend)

Este documento ofrece una descripción general de la aplicación backend de 1v1Code, desarrollada con Node.js, Express y Supabase.

## Descripción general del proyecto

El backend se encarga de gestionar la autenticación de usuarios, la lógica del juego, el almacenamiento de datos de los usuarios (perfiles, clasificaciones) y la comunicación en tiempo real entre jugadores mediante WebSockets. Interactúa con una base de datos de Supabase para el almacenamiento persistente de datos.

## Pila tecnológica

* **Node.js**: Entorno de ejecución de JavaScript.
* **Express**: Framework de aplicaciones web para Node.js.
* **Supabase**: Backend como servicio para bases de datos, autenticación y funciones en tiempo real.
* **WebSockets (Socket.IO)**: Para la comunicación bidireccional en tiempo real.

## Manual de despliegue

Para configurar y ejecutar la aplicación backend localmente, siga estos pasos:

1. **Clonar el repositorio:**
```bash
git clone <url_del_repositorio>
cd 1v1back
```
2. **Instalar dependencias:**
```bash
npm install
```
3. **Variables de entorno:**
Cree un archivo `.env` en el directorio `1v1back` con las siguientes variables:
```
SUPABASE_URL=url_de_su_proyecto_de_Supabase
SUPABASE_ANON_KEY=clave_anónima_de_Supabase
JWT_SECRET=secreto_de_JWT
FRONTEND_URL=url del front (http://localhost:5173)
JWT_EXPIRES_IN=1h
PORT= puerto (5000)
```

4. **Iniciar el servidor de desarrollo:**
```bash
npm start
```
El servidor normalmente se ejecutará en `http://localhost:3001` (o en el puerto definido en `config/urls.js`).

## Scripts disponibles

* `npm start`: Inicia el servidor backend.
* `npm run dev`: Inicaia el servidor backend con nodemon

## Esquema de la Base de Datos

El siguiente diagrama describe la estructura de la base de datos utilizada por la aplicación, incluyendo las tablas principales y sus relaciones.

### Tablas

#### Usuario
*   `id` (int8, Primary Key): Identificador único del usuario.
*   `Nombre` (varchar): Nombre de usuario.
*   `Email` (varchar): Correo electrónico del usuario. 
*   `Elo` (varchar): Puntuación Elo del usuario. NO EN USO
*   `created_at` (timestamptz): Fecha y hora de creación del registro del usuario.
*   `Contraseña` (text): Contraseña del usuario (hashed).
*   `PartidaTotal` (int2): Número total de partidas jugadas.
*   `PartidaGanada` (int2): Número de partidas ganadas.
*   `AvatarUrl` (text): URL del avatar del usuario.

#### Juego
*   `id` (int8, Primary Key): Identificador único del juego.
*   `Nombre` (varchar): Nombre del juego.
*   `Descripcion` (varchar): Descripción del juego.

    NO EN USO
*   `JS` (bool): Indica si el juego es de JavaScript.
*   `HTML` (bool): Indica si el juego es de HTML.
*   `CSS` (bool): Indica si el juego es de CSS.


#### Partida
*   `id` (int8, Primary Key): Identificador único de la partida.
*   `Jugador1` (int8): ID del primer jugador (Foreign Key a `Usuario.id`).
*   `Jugador2` (int8): ID del segundo jugador (Foreign Key a `Usuario.id`).
*   `Resultado` (varchar): Resultado de la partida (e.g., 'Ganador', 'Perdedor', 'Empate').
*   `Estado` (varchar): Estado actual de la partida (e.g., 'en curso', 'finalizada').
*   `Tiempo` (float4): Tiempo total de la partida.
*   `Juego` (int8): ID del juego al que pertenece la partida (Foreign Key a `Juego.id`).
*   `created_at` (timestamptz): Fecha y hora de creación del registro de la partida.

### Relaciones

*   **Usuario y Partida**: Un usuario puede participar en múltiples partida1.
*   **Juego y Partida**: Un juego puede tener múltiples partidas asociadas.

### Puntos de conexión de la API

### Gestión de usuarios (`routes/userRoutes.js`)

* `POST /api/register`: Registrar un nuevo usuario.
* `POST /api/login`: Autenticar un usuario y devolver un JWT.
* `GET /api/user/:id`: Obtener el perfil del usuario por ID.

### Gestión del juego (Eventos de WebSocket en `sockets/socketManager.js`)

Las interacciones relacionadas con el juego, incluyendo el inicio de nuevas sesiones, las acciones de los jugadores y las actualizaciones en tiempo real, se manejan principalmente a través de eventos de WebSocket gestionados por `socketManager.js`.

*  `connection`: Gestiona las nuevas conexiones de clientes, las autentica y configura el estado inicial del juego.
*  `checkActiveGame`: Permite a los clientes comprobar si tienen una sesión de juego activa y unirse de nuevo si es necesario.
*  `join_room`: Los clientes se unen a una sala de juego específica.
*  `playerFinished`: Enviado por un cliente cuando completa un desafío de juego, lo que activa el procesamiento de los resultados del juego, la determinación del ganador/perdedor y la actualización de las estadísticas.

#### Puntos de conexión de la API relacionados con el juego (`routes/gameRoutes.js`)

*  `GET /api/game/juego`: Obtiene información sobre los juegos disponibles.
*  `GET /api/game/mi-historial`: Obtiene el historial de partidas del usuario autenticado.

## Desglose de archivos

A continuación, se detallan los archivos y directorios importantes de la carpeta `1v1back`:

* `index.js`: El punto de entrada principal de la aplicación backend, que configura el servidor Express e integra rutas y sockets.
* `Supabase.js`: Inicializa y configura el cliente Supabase.

### Directorio `config/`

* `urls.js`: Contiene la configuración de las URL de la API y otras opciones del entorno.

### Directorio `controllers/`

* `gameController.js`: Gestiona la lógica de negocio para las operaciones relacionadas con los juegos. 
* `userController.js`: Gestiona la lógica de negocio para la autenticación de usuarios y la gestión de perfiles.

### Directorio `middleware/`

* `auth.js`: Middleware para la autenticación JWT, que protege las rutas API.
* `socketAuth.js`: Middleware para la autenticación de conexiones WebSocket.

### Directorio `routes/`

* `gameRoutes.js`: Define las rutas API relacionadas con la funcionalidad del juego.
* `userRoutes.js`: Define las rutas API relacionadas con la gestión de usuarios.

### Directorio `sockets/`

* `socketManager.js`: Gestiona los eventos WebSocket y la comunicación del juego en tiempo real.