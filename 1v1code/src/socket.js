import io from "socket.io-client";

// Puedes ajustar la URL mediante la variable de entorno Vite: VITE_SOCKET_URL
// import.meta.env es la forma recomendada en proyectos con Vite.
const SERVER_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SOCKET_URL)
  ? import.meta.env.VITE_SOCKET_URL
  : "https://potential-space-spork-g9x9j5q7jp5f976g-3000.app.github.dev";

const socket = io(SERVER_URL, {
  transports: ["websocket", "polling"],
});

// Exportamos una única instancia de socket para que toda la app la reutilice
export default socket;
