import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import userRoutes from "./routes/userRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import { socketAuthMiddleware } from "./middleware/socketAuth.js";
import socketManager from "./sockets/socketManager.js";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// --- CONFIGURACIÓN ---
app.use(cors({ origin: (o, c) => c(null, true), credentials: true }));
app.use(express.json());
app.use(cookieParser());

// --- RUTAS HTTP ---
app.use("/api", userRoutes);
app.use("/api", gameRoutes);

app.get("/", (req, res) => res.send("Servidor OK"));

// --- CONFIGURACIÓN SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      console.log(`📡 Socket.IO connection attempt from: ${origin}`);
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowEIO3: true,
  },
  transports: ['websocket', 'polling'],
});

io.use(socketAuthMiddleware);

socketManager(io);

// --- START ---
server.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);