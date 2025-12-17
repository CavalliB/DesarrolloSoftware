import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ModalUsuario from "./Login";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUsuario } = useAuth();

  return (
    <ModalUsuario
      isOpen={true}
      onClose={() => {}}
      onLoginSuccess={(user) => {
        setUsuario(user);
        try {
          localStorage.setItem("hasValidLogin", "1");
        } catch (e) {}
        navigate("/");
      }}
    />
  );
}
