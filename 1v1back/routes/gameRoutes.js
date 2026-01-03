import express from "express";
import { getJuegos, getHistorialPartidas } from "../controllers/gameController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/juego", getJuegos);
router.get("/mi-historial", authenticateToken, getHistorialPartidas);

export default router;