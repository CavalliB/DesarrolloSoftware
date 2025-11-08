// src/Games/Matchmaker.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";

export default function Matchmaker() {
  const [status, setStatus] = useState("Esperando acción...");
  const [roomId, setRoomId] = useState(null);
  const navigate = useNavigate();

  const findMatch = () => {
    socket.emit("findMatch");
    setStatus("🔍 Buscando oponente...");
  };

  useEffect(() => {
    socket.on("waiting", (msg) => setStatus(msg));

socket.on("matchFound", ({ roomId }) => {
  setStatus("✅ ¡Partida encontrada!");
  setRoomId(roomId);
  setTimeout(() => {
    // Navegamos a la ruta pasándole solo el id de sala en la query
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
      <button className="botoncenter" onClick={findMatch}>
        Jugar
      </button>
      <p>{status}</p>
      {roomId && <p>Sala: {roomId}</p>}
    </section>
  );
}
