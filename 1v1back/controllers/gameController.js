import { supabase } from "../Supabase.js";

export const getJuegos = async (req, res) => {
  try {
    const { data: Juego, error } = await supabase
      .from("Juego")
      .select("*");

    if (error) throw error;
    res.status(200).json(Juego);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};