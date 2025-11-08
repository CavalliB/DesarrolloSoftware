import { useState, useEffect } from "react";
import { Link, useLocation } from 'react-router-dom';
import './JSgame.css';
import Timer from './Timer';
import socket from "../socket";

const JSgame = () => {
  const [_isWinner, _setIsWinner] = useState(false);
  const [_status, setStatus] = useState("¡Comienza el juego!");
  const [modal, setModal] = useState({ open: false, message: "" });
  const location = useLocation();

  // Escuchar cuando el oponente termina
  useEffect(() => {
    // Cuando el servidor decide el resultado final
    socket.on("gameResult", ({ winnerId, winnerTime }) => {
      const myId = socket.id;
      if (winnerId === myId) {
        setModal({ open: true, message: "🎉 ¡Ganaste! ¡Fuiste el más rápido! 🎉" });
      } else {
        setModal({ open: true, message: "😢 Perdiste. El oponente fue más rápido." });
      }
      setResultVisible(true);
    });
    return () => {
      socket.off("gameResult");
    };
  }, []);

  const [js, setJs] = useState(`barco gray (12 , 14) vertical 2`);
  const [hintVisible, setHintVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);

  const filas = 15;
  const columnas = 15;

  // EXPECTED

  const expected = Array.from({ length: filas + 1 }, () =>
    Array.from({ length: columnas + 1 }, () => "lightblue")
  );
  for (let j = 3; j <= 6; j++) expected[3][j] = "gray";
  for (let i = 5; i <= 9; i++) expected[i][10] = "darkgray";
  expected[12][4] = "black";
  expected[12][5] = "black";


  // PREVIEW

  const preview = Array.from({ length: filas + 1 }, () =>
    Array.from({ length: columnas + 1 }, () => "lightblue")
  );

  js.trim().split("\n").forEach((line) => {
    const match = line.match(
      /barco\s+(\w+)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*(horizontal|vertical)?\s*(\d+)?/i
    );
    if (!match) return;

    const color = match[1];
    const fila = parseInt(match[2]);
    const col = parseInt(match[3]);
    const dir = match[4] ? match[4].toLowerCase() : null;
    const length = match[5] ? parseInt(match[5]) : 1;

    if (dir === "horizontal") {
      for (let j = 0; j < length; j++) {
        if (col + j <= columnas && fila >= 1 && fila <= filas) preview[fila][col + j] = color;
      }
    } else if (dir === "vertical") {
      for (let i = 0; i < length; i++) {
        if (fila + i <= filas && col >= 1 && col <= columnas) preview[fila + i][col] = color;
      }
    } else {
      if (fila >= 1 && fila <= filas && col >= 1 && col <= columnas) preview[fila][col] = color;
    }
  });

  // FUNCIONES

  const handleHint = () => setHintVisible(!hintVisible);
  const handleFinish = () => {
    if (!isCorrect) {
      setStatus("❌ El ejercicio no es correcto. Corrige antes de finalizar.");
      setResultVisible(true);
      return;
    }
    // Emitir fin manual sin tiempo
    const params = new URLSearchParams(location.search);
    const room = params.get("room");
    if (room) socket.emit("playerFinished", { roomId: room, time: null });
    setStatus("Has terminado");
    setResultVisible(true);
  };

  const isCorrect = preview.every((fila, i) =>
    fila.every((color, j) => color === expected[i][j])
  );

  const blockSize = 18;

  // BOARD

  // Al montar el componente, nos unimos a la sala indicada en la query ?room=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const room = params.get("room");
    if (room) {
      socket.emit("join_room", room);
    }

    return () => {
      // Intentamos salir de la sala al desmontar (si el servidor maneja 'leaveRoom')
      if (room) socket.emit("leave_room", room);
    };
  }, [location.search]);

  function Board({ matrix, blockSize }) {
    return (
      <table
        style={{
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          <tr>
            <td style={{ width: blockSize, height: blockSize }}></td>
            {Array.from({ length: columnas }, (_, j) => (
              <td
                key={j}
                style={{
                  width: blockSize,
                  height: blockSize,
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: "bold",
                  border: "1px solid #333",
                  color: "cyan"
                }}
              >
                {j + 1}
              </td>
            ))}
          </tr>

          {matrix.slice(1).map((fila, i) => (
            <tr key={i}>
              <td
                style={{
                  width: blockSize,
                  height: blockSize,
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: "bold",
                  border: "1px solid #333",
                  color: "cyan"
                }}
              >
                {i + 1}
              </td>
              {fila.slice(1).map((color, j) => (
                <td
                  key={j}
                  style={{
                    width: blockSize,
                    height: blockSize,
                    backgroundColor: color,
                    border: "1px solid #333",
                  }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const handleFinishTimer = (totalSeconds) => {
    console.log(`Tiempo total: ${totalSeconds} segundos`);
    if (!isCorrect) {
      setStatus("❌ El ejercicio no es correcto. Corrige antes de finalizar.");
      setResultVisible(true);
      return;
    }
    // Emitimos al servidor que este jugador terminó, para notificar al oponente
    const params = new URLSearchParams(location.search);
    const room = params.get("room");
    if (room) {
      socket.emit("playerFinished", { roomId: room, time: totalSeconds });
    }
    // Mostrar resultado localmente también
    setResultVisible(true);
  };

  

  return (
    <>
      {/* Modal de resultado */}
      {modal.open && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "white",
            padding: 32,
            borderRadius: 12,
            boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
            minWidth: 300,
            textAlign: "center",
            fontSize: 24
          }}>
            {modal.message}
            <br />
            <button style={{ marginTop: 24, fontSize: 18 }} onClick={() => setModal({ open: false, message: "" })}>
              Cerrar
            </button>
          </div>
        </div>
      )}
      <div style={{ 
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "10px 0",
        marginTop: "60px"
      }}>
        <Timer onFinish={handleFinishTimer} />
      </div>
      <div style={{ display: "flex", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: "20px" }}>
        <div style={{ minWidth: 320, maxWidth: 320 }}>
          <h3>JS Input</h3>
          <textarea
            value={js}
            onChange={(e) => setJs(e.target.value)}
            rows={10}
            cols={40}
          />
          <p style={{ width: "100%", marginTop: 8, marginBottom: 0, wordBreak: "break-word" }}>
            Cómo jugar: para crear un barco y colocarlo sigue las indicaciones: -barco -color -(pos y, pos x) -direccion -tamaño
          </p>
          <div style={{ marginTop: 10 }}>
            <button onClick={handleFinish} style={{ marginRight: 10 }}>Finalizar</button>
            <button onClick={handleHint}>Pista</button>
          </div>
          {hintVisible && (
            <p style={{ marginTop: 10, fontSize: 12 }}>
              Colores de los barcos esperados: gray, darkgray, black
            </p>
          )}
          {resultVisible && (
            <p style={{ marginTop: 10, fontSize: 12, fontWeight: "bold", color: isCorrect ? "green" : "red" }}>
              {isCorrect ? "¡Correcto!" : "Incorrecto"}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div>
            <h3>Preview</h3>
            <Board matrix={preview} blockSize={blockSize} />
          </div>
          <div>
            <h3>Expected</h3>
            <Board matrix={expected} blockSize={blockSize} />
          </div>
        </div>
      </div>
    </>
  );
}
export default JSgame;