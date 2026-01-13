import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

export default function Matchmaker() {
  const [status, setStatus] = useState("Conectando con el servidor..."); // Estado inicial cambiado
  const [roomId, setRoomId] = useState(null);
  
  // Nuevo estado para saber si el socket está listo
  const [isConnected, setIsConnected] = useState(socket.connected); 
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();

  const findMatch = () => {
    // Protección extra: no hacer nada si no está conectado
    if (isSearching || !isConnected) return;

    socket.emit("checkActiveGame", (response) => {
      if (response.hasActiveGame) {
        setStatus("⚠️ Ya tienes una partida activa");
        setTimeout(() => {
          navigate(`/js?room=${response.roomId}`);
        }, 1000);
      } else {
        setIsSearching(true);
        socket.emit("findMatch");
        setStatus("🔍 Buscando oponente...");
      }
    });
  };

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      setStatus("Esperando acción...");
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setStatus("🔴 Desconectado del servidor");
      setIsSearching(false);
    };

    const onWaiting = (msg) => setStatus(msg);

    const onMatchFound = ({ roomId }) => {
      setStatus("✅ ¡Partida encontrada!");
      setRoomId(roomId);
      setTimeout(() => {
        navigate(`/js?room=${roomId}`);
      }, 1000);
    };

    // 1. Configurar listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("waiting", onWaiting);
    socket.on("matchFound", onMatchFound);

    // 2. Lógica de conexión manual (LA SOLUCIÓN)
    if (socket.connected) {
      // Si ya estaba conectado de antes, actualizamos el estado visualmente
      onConnect();
    } else {
      // Si NO está conectado, forzamos la conexión manualmente
      setStatus("Iniciando conexión..."); 
      socket.connect(); 
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("waiting", onWaiting);
      socket.off("matchFound", onMatchFound);
    };
  }, [navigate]);

  return (
    <section className="boxApp">
      <h2 className="as">Matchmaker</h2>
      
      <button 
        className="botoncenter" 
        onClick={findMatch}
        // Deshabilitamos si está buscando O si NO está conectado
        disabled={isSearching || !isConnected}
        style={{ 
            opacity: (isSearching || !isConnected) ? 0.6 : 1, 
            cursor: (isSearching || !isConnected) ? 'not-allowed' : 'pointer' 
        }}
      >
        {/* Cambiamos el texto según el estado */}
        {!isConnected ? "Conectando..." : (isSearching ? "Buscando..." : "Jugar")}
      </button>

      <p>{status}</p>
      {roomId && <p>Sala: {roomId}</p>}
    </section>
  );
}