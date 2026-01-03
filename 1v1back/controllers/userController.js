import bcrypt from "bcrypt";
import { supabase } from "../Supabase.js";
import { generateToken } from "../middleware/auth.js";

export const registerUser = async (req, res) => {
  try {
    const { Nombre, Email, Contraseña } = req.body;

    if (!Nombre || !Email || !Contraseña) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const hashedContraseña = await bcrypt.hash(Contraseña, 10);

    const { data, error } = await supabase
      .from("Usuario")
      .insert([{ Nombre, Email, Contraseña: hashedContraseña }])
      .select();

    if (error) throw error;

    res.status(201).json({ message: "Usuario creado exitosamente", user: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Login de usuario
export const loginUser = async (req, res) => {
  try {
    const { Email, Contraseña } = req.body;

    if (!Email || !Contraseña) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Buscar usuario por Email
    const { data, error } = await supabase
      .from("Usuario")
      .select("*")
      .eq("Email", Email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // Comparar contraseñas
    const validContraseña = await bcrypt.compare(Contraseña, data.Contraseña);

    if (!validContraseña) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // Generar token
    const token = generateToken({
      id: data.id,
      Nombre: data.Nombre
    });

    // Guardar token en cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true en producción HTTPS
      sameSite: 'lax',
      path: '/',
      maxAge: 3600000, // 1 hora
    };

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "Login exitoso",
      usuario: {
        id: data.id,
        Nombre: data.Nombre,
        Email: data.Email,
        Elo: data.Elo,
        created_at: data.created_at,
        PartidaTotal: data.PartidaTotal,
        PartidaGanada: data.PartidaGanada,
        AvatarUrl: data.AvatarUrl
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener perfil del usuario autenticado
export const getPerfil = async (req, res) => {
  try {
    const { id } = req.user;

    const { data, error } = await supabase
      .from("Usuario")
      .select("id, Nombre, Email, Elo, created_at, PartidaTotal, PartidaGanada, AvatarUrl")
      .eq("id", id)
      .single();

    if (error) throw error;

    res.status(200).json({ usuario: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cerrar sesión
export const logoutUser = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    };

    res.cookie('token', '', cookieOptions);
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

//  Actualizar Nombre o Avatar
export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { Nombre } = req.body;
    const file = req.file;

    let updates = {};

    if (Nombre && Nombre.trim() !== "") {
      updates.Nombre = Nombre;
    }

    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      updates.AvatarUrl = publicUrl;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No se enviaron datos para actualizar" });
    }

    const { data, error } = await supabase
      .from("Usuario")
      .update(updates)
      .eq("id", userId)
      .select("id, Nombre, Email, Elo, created_at, PartidaTotal, PartidaGanada, AvatarUrl")
      .single();

    if (error) throw error;

    res.status(200).json({
      message: "Perfil actualizado correctamente",
      usuario: data
    });

  } catch (error) {
    console.error("Error actualizando usuario:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};

// Obtener rankings de jugadores por partidas ganadas
export const getRankings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("Usuario")
      .select("id, Nombre, Elo, PartidaTotal, PartidaGanada, AvatarUrl")
      .order("PartidaGanada", { ascending: false })
      .limit(20);

    if (error) throw error;

    res.status(200).json({ rankings: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};