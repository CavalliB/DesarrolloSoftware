import express from "express";
import { getJuegos } from "../controllers/gameController.js";

const router = express.Router();

router.get("/juego",getJuegos);

export default router;