import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "./config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const res = await fetch(`${API_URL}/api/perfil`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUsuario(data.usuario);
        } else {
          setUsuario(null);
          try {
            localStorage.removeItem("hasValidLogin");
          } catch (e) {}
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);

        try {
          const has = localStorage.getItem("hasValidLogin");
          if (has) {
            setUsuario({ Nombre: "Offline User" });
          } else {
            setUsuario(null);
          }
        } catch (e) {
          setUsuario(null);
        }
      } finally {
        setCargando(false);
      }
    };

    verificarSesion();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
