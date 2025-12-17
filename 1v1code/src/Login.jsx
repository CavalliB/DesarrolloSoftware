import React, { useState } from "react";
import "./Login.css";
import { API_URL } from "./config";

const ModalUsuario = ({ isOpen, onClose, onLoginSuccess }) => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState("login");
  const [mensaje, setMensaje] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const manejarLogin = async () => {
    if (!email || !password) {
      setMensaje("Completá todos los campos.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    try {
      const respuesta = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ Email: email, Contraseña: password }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(data.error || "Error al iniciar sesión");
        setMessageType("error");
        return;
      }

      setMensaje("¡Inicio de sesión exitoso!");
      setMessageType("success");
      onLoginSuccess(data.usuario);
      setTimeout(onClose, 1000);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setMensaje("Error de conexión con el servidor");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const manejarRegistro = async () => {
    if (!nombre || !email || !password) {
      setMensaje("Completá todos los campos.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
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
        setMensaje(data.error || "Error al registrar");
        setMessageType("error");
        return;
      }

      setMensaje("¡Usuario registrado correctamente!");
      setMessageType("success");
      setTimeout(() => manejarLogin(), 1000);
    } catch (error) {
      console.error("Error al registrar:", error);
      setMensaje("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modalUsuario-overlay">
      <div className="modalUsuario">
        <div className="modalUsuario-header">
          <h2>{modo === "login" ? "Bienvenido" : "Crear Cuenta"}</h2>
          <p className="subtitle">
            {modo === "login"
              ? "Inicia sesión para comenzar a jugar"
              : "Únete a nuestra comunidad"}
          </p>
        </div>

        <div className="form-group">
          {modo === "registro" && (
            <div className="input-wrapper">
              <label htmlFor="nombre">Nombre de usuario</label>
              <input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="input-wrapper">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="input-wrapper">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          className={`modalUsuario-btn ${isLoading ? "loading" : ""}`}
          onClick={modo === "login" ? manejarLogin : manejarRegistro}
          disabled={isLoading}
        >
          {isLoading
            ? "Procesando..."
            : modo === "login"
            ? "Entrar"
            : "Registrar"}
        </button>

        {mensaje && (
          <p
            className={`mensaje ${
              messageType
                ? messageType
                : mensaje.includes("Error") || mensaje.includes("Completá")
                ? "error"
                : "success"
            }`}
          >
            {mensaje}
          </p>
        )}

        <div className="divider"></div>

        <p className="alternar">
          {modo === "login" ? (
            <>
              ¿No tenés cuenta?{" "}
              <span
                onClick={() => {
                  setModo("registro");
                  setMensaje("");
                  setMessageType("");
                }}
              >
                Registrate aquí
              </span>
            </>
          ) : (
            <>
              ¿Ya tenés cuenta?{" "}
              <span
                onClick={() => {
                  setModo("login");
                  setMensaje("");
                  setMessageType("");
                }}
              >
                Inicia sesión
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default ModalUsuario;
