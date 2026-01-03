import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { API_URL } from "./config";
import "./Profile.css";

const Profile = () => {
  const { usuario, setUsuario } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [historialPartidas, setHistorialPartidas] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    cargarHistorialPartidas();
  }, [usuario]);

  const cargarHistorialPartidas = async () => {
    if (!usuario) return;

    setCargandoHistorial(true);
    try {
      const response = await fetch(`${API_URL}/api/mi-historial`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setHistorialPartidas(data);
      } else {
        console.error("Error al cargar historial");
        setHistorialPartidas([]);
      }
    } catch (error) {
      console.error("Error al cargar historial:", error);
      setHistorialPartidas([]);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        console.error("Error al cerrar sesión en el servidor");
        setUsuario(null);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }

    navigate("/login");
  };

  const handleEditClick = () => {
    setNewName(usuario.Nombre);
    setNewFile(null);
    setPreviewUrl(usuario.AvatarUrl);
    setIsEditing(true);
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Guardar cambios
  const handleSave = async () => {
    setIsSaving(true);
    const formData = new FormData();

    // Solo agregar cambios
    formData.append("Nombre", newName);
    if (newFile) {
      formData.append("avatar", newFile);
    }

    try {
      const response = await fetch(`${API_URL}/api/update`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUsuario(data.usuario);
        setIsEditing(false);
      } else {
        alert("Error al actualizar perfil");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!usuario) return <div>Cargando datos del usuario...</div>;

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha desconocida";
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        {!isEditing && (
          <button
            className="edit-btn"
            onClick={handleEditClick}
            title="Editar perfil"
            aria-label="Editar perfil"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="edit-icon"
            >
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </button>
        )}

        <div className="profile-header">
          <div className={`avatar-section ${isEditing ? "editing-mode" : ""}`}>
            <img
              className="profile-picture"
              src={
                previewUrl ||
                usuario.AvatarUrl ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              }
              alt="Perfil"
            />

            {isEditing && (
              <>
                <div
                  className="avatar-overlay"
                  onClick={() => fileInputRef.current.click()}
                >
                  <span>📷 Cambiar</span>
                </div>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*"
            />
          </div>

          <div className="profile-details">
            {isEditing ? (
              <div className="edit-form">
                <label>Nombre de usuario</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="name-input"
                />
              </div>
            ) : (
              <>
                <h2 className="profile-name">{usuario.Nombre}</h2>
                <p className="join-date">
                  Se unió el {formatearFecha(usuario.created_at)}
                </p>
              </>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="edit-actions">
            <button
              className="cancel-btn"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        )}

        {!isEditing && (
          <div className="profile-footer">
            <p className="friends">
              {usuario.PartidaTotal || 0} partidas jugadas
            </p>
            <p className="views">{usuario.PartidaGanada || 0} victorias</p>
          </div>
        )}

        {!isEditing && (
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        )}
      </div>

      {!isEditing && (
        <div className="historial-section">
          <h3>Historial de Partidas</h3>
          {cargandoHistorial ? (
            <p className="loading">Cargando historial...</p>
          ) : historialPartidas.length === 0 ? (
            <p className="no-games">Aún no tienes partidas registradas</p>
          ) : (
            <div className="historial-container">
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Resultado</th>
                    <th>Oponente</th>
                    <th>Duración (seg)</th>
                  </tr>
                </thead>
                <tbody>
                  {historialPartidas.map((partida, index) => {
                    const fecha = partida.created_at 
                      ? new Date(partida.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Desconocida";

                    // Determinar resultado comparando Resultado ('Jugador1'|'Jugador2') con los ids
                    let esVictoria = false;
                    const resultadoRaw = partida.Resultado ? String(partida.Resultado).toLowerCase() : "";

                    if (resultadoRaw === "jugador1" || resultadoRaw === "jugador2") {
                      if (resultadoRaw === "jugador1") {
                        esVictoria = String(partida.Jugador1) === String(usuario.id);
                      } else {
                        esVictoria = String(partida.Jugador2) === String(usuario.id);
                      }
                    } else {
                      // Fallback: admitir valores como 'victoria' o 'win'
                      esVictoria = /victoria|win/i.test(partida.Resultado || "");
                    }

                    const resultado = esVictoria ? "Victoria" : "Derrota";
                    const claseResultado = esVictoria ? "victoria" : "derrota";

                    return (
                      <tr key={index} className="partida-row">
                        <td>{fecha}</td>
                        <td className={`resultado ${claseResultado}`}>{resultado}</td>
                        <td>{partida.nombreOponente || "Desconocido"}</td>
                        <td>{partida.Tiempo ? partida.Tiempo.toFixed(1) : "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}    </div>
  );
};

export default Profile;