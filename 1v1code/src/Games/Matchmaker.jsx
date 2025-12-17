import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

export default function Matchmaker() {
  const [status, setStatus] = useState("Esperando acción...");
  const [roomId, setRoomId] = useState(null);
  
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();

  const findMatch = () => {
    if (isSearching) return;

    // Verificar si hay una partida activa
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
    socket.on("waiting", (msg) => setStatus(msg));

    socket.on("matchFound", ({ roomId }) => {
      setStatus("✅ ¡Partida encontrada!");
      setRoomId(roomId);
      setTimeout(() => {
        navigate(`/js?room=${roomId}`);
      }, 1000);
    });

    return () => {
      socket.off("waiting");
      socket.off("matchFound");
    };
  }, [navigate]);

  return (
    <section className="boxApp">
      <h2 className="as">Matchmaker</h2>
      
      <button 
        className="botoncenter" 
        onClick={findMatch}
        disabled={isSearching}
        style={{ 
            opacity: isSearching ? 0.6 : 1, 
            cursor: isSearching ? 'not-allowed' : 'pointer' 
        }}
      >
        {isSearching ? "Buscando..." : "Jugar"}
      </button>

      <p>{status}</p>
      {roomId && <p>Sala: {roomId}</p>}
    </section>
  );
}