import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./Supabase.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/juego", async (req, res) => {
  try {
    const { data: Juego, error } = await supabase
      .from("Juego")
      .select("*");

    if (error) throw error;
    res.status(200).json(Juego);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente ");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
