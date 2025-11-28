import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div>Cargando sesión...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}