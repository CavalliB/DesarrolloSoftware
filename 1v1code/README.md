# Documentación del frontend de 1v1Code (frontend)

Este documento ofrece una descripción general de la aplicación frontend para 1v1Code, desarrollada con React y Vite.

## Descripción general del proyecto

1v1Code es una pagina de juegos multijugador en tiempo real donde los usuarios compiten entre sí en desafíos. El frontend proporciona la interfaz de usuario para la autenticación, los modos de juego (juego JS, juego CSS), los perfiles de usuario y las clasificaciones.

## Pila tecnológica

*  **React**: Biblioteca de JavaScript para construir interfaces de usuario.
*  **Vite**: Herramienta de construcción rápida para proyectos web modernos.
*  **JavaScript**: Lenguaje de programación principal del frontend.
*  **WebSockets (Socket.IO)**: Para la comunicación bidireccional en tiempo real con el backend.
*  **CSS**: Para el estilo de la aplicación.

## Manual de despliegue

Para configurar y ejecutar la aplicación frontend localmente, siga estos pasos:

1. **Clonar el repositorio:**
```bash
git clone <repository_url>
cd 1v1code
```
2. **Instalar dependencias:**
```bash
npm install
```
3. **Variables de entorno:**
Cree un archivo `.env` en el directorio `1v1code` con las siguientes variables:
```
VITE_SOCKET_URL= url backend (http://localhost:5000)
VITE_API_URL= url backend
```
4. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

## Scripts disponibles

* `npm run dev`: Inicia el servidor de desarrollo con recarga en caliente.
* `npm run build`: Compila la aplicación para producción en la carpeta `dist`.
* `npm run test`: Ejecuta pruebas con Jest y la biblioteca de pruebas de React.



## Desglose de archivos

A continuación, se muestra un desglose de los archivos y directorios importantes en la carpeta `src`:

* `App.css`: Estilos globales para el diseño principal de la aplicación.
* `App.jsx`: El componente principal de la aplicación, que gestiona el enrutamiento y el diseño.
* `AuthContext.jsx`: Proporciona contexto de autenticación a toda la aplicación, gestionando el estado de inicio/cierre de sesión del usuario.
* `config.js`: Archivo de configuración para las URL de la API y otras variables específicas del entorno. * `index.css`: Estilos CSS base, que a menudo incluyen restablecimientos o tipografía global.
* `Login.css`: Estilos específicos para los formularios de inicio de sesión y registro.
* `Login.jsx`: Componente para el inicio de sesión y registro de usuarios, que interactúa con la API de autenticación.
* `Login.test.jsx`: Pruebas unitarias para el componente `Login`.
* `LoginPage.jsx`: Componente contenedor para el componente `Login`, ruta protegida para el inicio de sesión.
* `main.jsx`: Punto de entrada de la aplicación React, responsable de renderizar el componente `App`.
* `Nav.css`: Estilos para la barra de navegación.
* `Nav.jsx`: Componente de la barra de navegación.
* `Profile.css`: Estilos para la página de perfil de usuario.
* `Profile.jsx`: Componente para mostrar y gestionar la información del perfil de usuario. 
* `ProtectedRoute.jsx`: componente de ruta personalizado que protege las rutas, garantizando que solo los usuarios autenticados puedan acceder a ellas.
* `Rankings.css`: Estilos para la página de clasificaciones.
* `Rankings.jsx`: Componente para mostrar las clasificaciones globales de los usuarios.
* `setupTests.js`: Archivo de configuración para la biblioteca de pruebas de Jest.
* `socket.js`: Gestiona las conexiones WebSocket para la comunicación en tiempo real dentro de la aplicación.

## Directorio `src/Games/`

* `CodeEditor.css`: Estilos para el editor de código del juego.
* `CodeEditor.jsx`: Componente para el editor de código del juego donde los usuarios escriben y envían código (EN DESARROLLO).
* `JSgame.css`: Estilos específicos del juego `JSgame.jsx`. 
* `JSgame.jsx`: Juego de colorear?.
* `JSgame.test.jsx`: Pruebas unitarias para el componente `JSgame`.
* `Matchmaker.jsx`: Componente responsable de emparejar jugadores para partidas en tiempo real.
* `Matchmaker.test.jsx`: Pruebas unitarias para el componente `Matchmaker`.
* `Timer.jsx`: Un temporizador reutilizable para cuentas regresivas o límites de tiempo dentro del juego.