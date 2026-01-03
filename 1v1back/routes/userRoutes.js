import express from "express";
import multer from "multer";
import { registerUser, loginUser, getPerfil, logoutUser, updateUser, getRankings } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Configuración de Multer (Almacenamiento en memoria)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Límite de 5MB
});

// Ruta para registrar usuarios
router.post("/register", registerUser);

// Iniciar sesión
router.post("/login", loginUser);

// Ruta para obtener el perfil del usuario autenticado
router.get("/perfil", authenticateToken, getPerfil);

// Cerrar sesión
router.post("/logout", logoutUser);

// editar perfil (token y usa Multer)
router.put("/update", authenticateToken, upload.single("avatar"), updateUser);
// Rankings públicos
router.get("/rankings", getRankings);
export default router;