import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CodeEditor from './Games/CodeEditor';
import Profile from './Profile';
import JSgame from './Games/JSgame';
import Nav from "./Nav.jsx";
import Matchmaker from './Games/Matchmaker';
import './App.css';

function Home() {
  return (
    <section className='boxApp'>
      <h1 className='as'>Bienvenido a 1v1Code!</h1>
      <div className="buttonRow">
        <Link to="/mode"><button className="botoncenter">Jugar</button></Link>
        <Link to="/user"><button className="botoncenter">Ver perfil</button></Link>
      </div>
    </section>

  );
}

function SelectMode() {
  return (
    <section>
      <h2 className='as'>Selecciona un modo de juego</h2>
<Link to="/matchmaker"><button className="botoncenter">JS game</button></Link>
      <Link to="/code"><button className="botoncenter">CSS game</button></Link>
      <Link to="/"><button className="botoncenter">Volver</button></Link>
    </section>
  );
}

function App() {
  return (
    <Router>
      <Nav />
      <div className="app-container">
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mode" element={<SelectMode />} />
            <Route path="/code" element={<CodeEditor />} />
            <Route path="/js" element={<JSgame />} />
            <Route path="/user" element={<Profile />} />
            <Route path="/matchmaker" element={<Matchmaker />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;