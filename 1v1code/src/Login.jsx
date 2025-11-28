import React, { useState } from "react";
import "./Login.css";
import { API_URL } from "./config";

const ModalUsuario = ({ isOpen, onClose, onLoginSuccess }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState("login");
  const [mensaje, setMensaje] = useState("");

  const manejarLogin = async () => {
    if (!email || !password) {
      setMensaje("Completá todos los campos.");
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // envía y guarda cookies
        body: JSON.stringify({ Email: email, Contraseña: password }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(data.error || "Error al iniciar sesión ❌");
        return;
      }

      setMensaje("Inicio de sesión exitoso ✅");
      onLoginSuccess(data.usuario);
      onClose();
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setMensaje("Error de conexión con el servidor ❌");
    }
  };

  const manejarRegistro = async () => {
    if (!nombre || !email || !password) {
      setMensaje("Completá todos los campos.");
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Nombre: nombre,
          Email: email,
          Contraseña: password,
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(data.error || "Error al registrar ❌");
        return;
      }

      setMensaje("Usuario registrado correctamente ✅");
      // Loguea automáticamente después del registro
      await manejarLogin();
    } catch (error) {
      console.error("Error al registrar:", error);
      setMensaje("Error de conexión con el servidor ❌");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modalUsuario-overlay">
      <div className="modalUsuario">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
        <h2>{modo === "login" ? "Iniciar Sesión" : "Registrarse"}</h2>

        {modo === "registro" && (
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="modalUsuario-btn"
          onClick={modo === "login" ? manejarLogin : manejarRegistro}
        >
          {modo === "login" ? "Entrar" : "Registrar"}
        </button>

        <p className="mensaje">{mensaje}</p>

        <p className="alternar">
          {modo === "login" ? (
            <>
              ¿No tenés cuenta?{" "}
              <span onClick={() => setModo("registro")}>Registrate</span>
            </>
          ) : (
            <>
              ¿Ya tenés cuenta?{" "}
              <span onClick={() => setModo("login")}>Iniciá sesión</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default ModalUsuario;
