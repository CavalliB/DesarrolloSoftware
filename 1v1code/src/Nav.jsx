import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Nav.css";

function Nav() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const avatarSrc =
    (usuario && (usuario.AvatarUrl || usuario.avatarUrl)) ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  return (
    <div className="containerNav">
      <button className="home" onClick={() => navigate("/")}>
        Home
      </button>
      <button className="home" onClick={() => navigate("/User")}>
        <img className="usericon" src={avatarSrc} alt="Icono" />
      </button>
    </div>
  );
}

export default Nav;
