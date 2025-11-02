import { useNavigate } from "react-router-dom";
import './Nav.css';

function Nav() {
  const navigate = useNavigate();

  return (
    <div className="containerNav">
      <button className="home" onClick={() => navigate("/")}>Home</button>
      <button className='home' onClick={() => navigate("/User")}>
        <img className='usericon' src="https://imgs.search.brave.com/uRLjIz0r9LwrGq9jagcfeSqoD188L_55nkk0IhaFSrw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvOTk5/NDQ1MzIyL3Bob3Rv/L25hbmR1LXJoZWEt/YW1lcmljYW5hLWdy/ZWF0ZXItcmhlYS5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/NGc2MDRpUFBPbDBH/LXlzalBKalVnTmdx/bnFvMGl4SFFGWGhK/dnRhMWRFWT0" alt="Icono" />
      </button>
    </div>
  );
}

export default Nav;
