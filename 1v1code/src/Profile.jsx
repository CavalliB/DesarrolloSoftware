import React from 'react';
import { useAuth } from "./AuthContext";
import './Profile.css';

const Profile = () => {
    const { usuario } = useAuth();

    if (!usuario) return <div>Cargando datos del usuario...</div>;

    const formatearFecha = (fecha) => {
        if (!fecha) return "Fecha desconocida";
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <>
            <div className="profile-container">
                <div className="profile-card">
                    <div className="profile-header">
                        <img
                            className="profile-picture"
                            src={usuario.avatarUrl || "https://imgs.search.brave.com/uRLjIz0r9LwrGq9jagcfeSqoD188L_55nkk0IhaFSrw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvOTk5/NDQ1MzIyL3Bob3Rv/L25hbmR1LXJoZWEt/YW1lcmljYW5hLWdy/ZWF0ZXItcmhlYS5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/NGc2MDRpUFBPbDBH/LXlzalBKalVnTmdx/bnFvMGl4SFFGWGhK/dnRhMWRFWT0"
                            }
                            alt={`Perfil de ${usuario.nombre}`}
                        />
                        <div className="profile-details">
                            <h2 className="profile-name">{usuario.Nombre || "Usuario"}</h2>

                            {/* 5. Formateamos la fecha de creación de la cuenta */}
                            <p className="join-date">
                                Se unió el {formatearFecha(usuario.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="profile-footer">
                        {/* 6. Datos dinámicos (asegúrate de que tu backend los envíe) */}
                        <p className="friends">{usuario.PartidaTotal || 0} partidas jugadas</p>
                        <p className="views">{usuario.PartidaGanada || 0} victorias</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;