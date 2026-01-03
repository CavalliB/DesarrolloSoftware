import React, { useEffect, useState } from "react";
import "./App.css";
import "./Rankings.css";

export default function Rankings() {
  const [rankings, setRankings] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch("/api/rankings");
        if (!res.ok) throw new Error("Error al obtener rankings");
        const json = await res.json();
        setRankings(json.rankings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) return <p>Cargando rankings...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <section className="boxApp rankings">
      <h2 className="as">Rankings - Más victorias</h2>
      <div className="rankings-list">
        {(() => {
          const visibles = (rankings || []).filter(
            (u) => (u.PartidaTotal || 0) > 0
          );
          if (visibles.length === 0) return <p>No hay datos todavía.</p>;
          return (
            <ol>
              {visibles.map((u, idx) => (
                <li key={u.id} className="ranking-item">
                  <div className="rank-pos">{idx + 1}</div>
                  <img
                    src={
                      u.AvatarUrl ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    }
                    alt={u.Nombre}
                    className="avatarSmall"
                  />
                  <div className="rank-info">
                    <strong>{u.Nombre}</strong>
                    <div className="sub">
                      Victorias: {u.PartidaGanada || 0} • Partidas:{" "}
                      {u.PartidaTotal || 0}
                    </div>
                  </div>
                  <div className="rank-elo">Elo: {u.Elo ?? "-"}</div>
                </li>
              ))}
            </ol>
          );
        })()}
      </div>
    </section>
  );
}
