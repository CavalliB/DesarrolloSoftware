import express from "express";
import { registerUser, loginUser, getPerfil, logoutUser } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Ruta para registrar usuarios
router.post("/register", registerUser);

// Iniciar sesión
router.post("/login", loginUser);

// Ruta para obtener el perfil del usuario autenticado
router.get("/perfil", authenticateToken, getPerfil);

// Cerrar sesión
router.post("/logout", logoutUser); 

export default router;