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

// Obtener historial de partidas del usuario autenticado
export const getHistorialPartidas = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const { data: partidas, error } = await supabase
      .from("Partida")
      .select("*")
      .or(`Jugador1.eq.${userId},Jugador2.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: usuarios, error: usuariosError } = await supabase
      .from("Usuario")
      .select("id, Nombre");

    if (usuariosError) throw usuariosError;

    const usuariosMap = {};
    (usuarios || []).forEach(u => {
      usuariosMap[u.id] = u.Nombre;
    });

    const partidasEnriquecidas = (partidas || []).map(p => ({
      ...p,
      nombreOponente: p.Jugador1 === userId 
        ? usuariosMap[p.Jugador2] 
        : usuariosMap[p.Jugador1],
      oponenteId: p.Jugador1 === userId ? p.Jugador2 : p.Jugador1
    }));

    res.status(200).json(partidasEnriquecidas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};