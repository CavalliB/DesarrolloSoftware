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
          credentials: "include", // envia cookies al backend
        });

        if (res.ok) {
          const data = await res.json();
          setUsuario(data.usuario);
        } else {
          setUsuario(null);
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);
        setUsuario(null);
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
