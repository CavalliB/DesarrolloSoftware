// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "https://potential-space-spork-g9x9j5q7jp5f976g-5173.app.github.dev", // tu frontend
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://potential-space-spork-g9x9j5q7jp5f976g-5173.app.github.dev",
    methods: ["GET", "POST"],
  },
});


let waitingPlayer = null;
// Estructura: { [roomId]: { [socketId]: { time, finished } } }
const roomResults = {};

io.on("connection", (socket) => {
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`Jugador ${socket.id} se unió a la sala ${roomId}`);
  });

  socket.on("leave_room", (roomId) => {
    try {
      socket.leave(roomId);
      console.log(`Jugador ${socket.id} salió de la sala ${roomId}`);
    } catch (e) {
      console.warn("leave_room error", e);
    }
  });

  // Cuando un jugador termina la partida, notificamos al resto de la sala
  socket.on("playerFinished", ({ roomId, time }) => {
    console.log(`Jugador ${socket.id} terminó en sala ${roomId} (time=${time})`);
    if (!roomResults[roomId]) roomResults[roomId] = {};
    // Si ya hay un ganador, ignorar
    if (roomResults[roomId].winnerId) return;
    // El primero que termina es el ganador
    roomResults[roomId].winnerId = socket.id;
    roomResults[roomId].winnerTime = time;
    // Notificar a todos en la sala
    io.to(roomId).emit("gameResult", {
      winnerId: socket.id,
      winnerTime: time
    });
    // Limpiar resultados de la sala para futuras partidas
    setTimeout(() => { delete roomResults[roomId]; }, 5000);
  });

  socket.on("findMatch", () => {
    if (!waitingPlayer) {
      waitingPlayer = socket;
      socket.emit("waiting", "Esperando oponente...");
    } else {
      // Crear sala
      const roomId = `room-${waitingPlayer.id}-${socket.id}`;
      waitingPlayer.join(roomId);
      socket.join(roomId);

      // Enviar el roomId a ambos
      io.to(waitingPlayer.id).emit("matchFound", { roomId });
      io.to(socket.id).emit("matchFound", { roomId });

      waitingPlayer = null;
    }
  });

  socket.on("disconnect", () => {
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }
  });
});

server.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));
