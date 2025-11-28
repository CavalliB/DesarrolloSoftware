import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { FRONTEND_URL } from "./config/urls.js";
import { supabase } from "./Supabase.js";
import userRoutes from "./routes/userRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // allow requests with no origin (like curl, mobile apps) and reflect the request origin for browsers
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: (origin, callback) => {
      // In development reflect the incoming origin so the Access-Control-Allow-Origin header
      // matches the requesting origin (works well with GitHub Codespaces app.github.dev URLs).
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ---- RUTAS REST ----

app.get("/juego", async (req, res) => {
  try {
    const { data: Juego, error } = await supabase.from("Juego").select("*");
    if (error) throw error;
    res.status(200).json(Juego);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// Rutas HTTP REST
app.use("/api", userRoutes);
app.use("/api", gameRoutes);

// ---- SOCKET.IO ----

let waitingPlayer = null;
const roomResults = {};

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("playerFinished", ({ roomId, time }) => {
    if (!roomResults[roomId]) roomResults[roomId] = {};
    if (roomResults[roomId].winnerId) return;

    roomResults[roomId].winnerId = socket.id;
    roomResults[roomId].winnerTime = time;

    io.to(roomId).emit("gameResult", {
      winnerId: socket.id,
      winnerTime: time,
    });

    setTimeout(() => {
      delete roomResults[roomId];
    }, 5000);
  });

  socket.on("findMatch", () => {
    if (!waitingPlayer) {
      waitingPlayer = socket;
      socket.emit("waiting", "Esperando oponente...");
    } else {
      const roomId = `room-${waitingPlayer.id}-${socket.id}`;

      waitingPlayer.join(roomId);
      socket.join(roomId);

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

// ---- INICIAR SERVIDOR ----

server.listen(PORT, () =>
  console.log(`Servidor con websockets en http://localhost:${PORT}`)
);



