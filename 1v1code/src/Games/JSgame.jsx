import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./JSgame.css";
import Timer from "./Timer";
import socket from "../socket";

const JSgame = () => {
  const [modal, setModal] = useState({ open: false, message: "" });
  const location = useLocation();
  const [checkedActiveGame, setCheckedActiveGame] = useState(false);

  // Estados para el nivel dinámico
  const filas = 15;
  const columnas = 15;
  const [expected, setExpected] = useState([]); // Ahora empieza vacío
  const [hintColors, setHintColors] = useState([]); // Colores pista
  const [isLoading, setIsLoading] = useState(true);

  const [js, setJs] = useState("barco red(2, 3) horizontal 3"); // Input del usuario
  const [hintVisible, setHintVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);

  // Extraer colores del array
  const getColors = () => {
    return hintColors.map((item) =>
      typeof item === "string" ? item : item.color
    );
  };

  // Verificar partida activa una vez
  useEffect(() => {
    if (!checkedActiveGame) {
      socket.emit("checkActiveGame", (response) => {
        setCheckedActiveGame(true);
        if (response.hasActiveGame) {
          const params = new URLSearchParams(location.search);
          const currentRoom = params.get("room");
          // Redirigir en caso de desconexión
          if (!currentRoom) {
            console.log(`⚠️ Partida activa detectada: ${response.roomId}`);
            window.location.href = `/js?room=${response.roomId}`;
          }
        }
      });
    }
  }, [checkedActiveGame, location.search]);

  // Recibir nivel
  useEffect(() => {
    socket.on("initGame", ({ matrix, selectedColors }) => {
      console.log("Nivel recibido del servidor");
      setExpected(matrix);
      setHintColors(selectedColors);
      setIsLoading(false);
    });

    socket.on("gameResult", ({ winnerId, winnerTime }) => {
      const myId = socket.id;
      if (winnerId === myId) {
        setModal({
          open: true,
          message: "🎉 ¡Ganaste! ¡Fuiste el más rápido! 🎉",
        });
      } else {
        setModal({
          open: true,
          message: "😢 Perdiste. El oponente fue más rápido.",
        });
      }
      setResultVisible(true);
    });

    // Unirse a la sala si venimos de url y pedir datos iniciales
    const params = new URLSearchParams(location.search);
    const room = params.get("room");
    if (room) {
      socket.emit("join_room", room);
    }

    return () => {
      socket.off("initGame");
      socket.off("gameResult");
      if (room) socket.emit("leave_room", room);
    };
  }, [location.search]);

  // PREVIEW
  const preview = Array.from({ length: filas + 1 }, () =>
    Array.from({ length: columnas + 1 }, () => "lightblue")
  );

  js.trim()
    .split("\n")
    .forEach((line) => {
      const match = line.match(
        /barco\s+(\w+)\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*(horizontal|vertical)?\s*(\d+)?/i
      );
      if (!match) return;

      const color = match[1];
      const col = parseInt(match[2]); // pos x
      const fila = parseInt(match[3]); // pos y
      const dir = match[4] ? match[4].toLowerCase() : null;
      const length = match[5] ? parseInt(match[5]) : 1;

      if (dir === "horizontal") {
        for (let j = 0; j < length; j++) {
          if (col + j <= columnas && fila >= 1 && fila <= filas)
            preview[fila][col + j] = color;
        }
      } else if (dir === "vertical") {
        for (let i = 0; i < length; i++) {
          if (fila + i <= filas && col >= 1 && col <= columnas)
            preview[fila + i][col] = color;
        }
      } else {
        if (fila >= 1 && fila <= filas && col >= 1 && col <= columnas)
          preview[fila][col] = color;
      }
    });

  // VERIFICACIÓN
  const isCorrect =
    !isLoading &&
    expected.length > 0 &&
    preview.every((fila, i) =>
      fila.every((color, j) => color === expected[i][j])
    );

  // PALABRA SECRETA PARA GANAR
  const SECRET_WORD = "GANAR_AHORA";

  const handleFinish = (manualWin = false) => {
    // Si es la palabra secreta o si el ejercicio es correcto
    if (manualWin || isCorrect) {
      const params = new URLSearchParams(location.search);
      const room = params.get("room");
      // null en tiempo si es manual
      if (room)
        socket.emit("playerFinished", {
          roomId: room,
          time: manualWin ? 0.1 : null,
        });
      setResultVisible(true);
    } else {
      setResultVisible(true); // Muestra mensaje de error
    }
  };

  // Detectar palabra secreta en tiempo real
  useEffect(() => {
    if (js.includes(SECRET_WORD)) {
      handleFinish(true); // Gana automáticamente
    }
  }, [js]);

  const handleFinishTimer = (totalSeconds) => {
    if (!isCorrect) {
      setResultVisible(true);
      return;
    }
    const params = new URLSearchParams(location.search);
    const room = params.get("room");
    if (room) {
      socket.emit("playerFinished", { roomId: room, time: totalSeconds });
    }
    setResultVisible(true);
  };

  const handleHint = () => setHintVisible(!hintVisible);
  const blockSize = 18;

  function Board({ matrix, blockSize }) {
    if (!matrix || matrix.length === 0) return <div>Cargando tablero...</div>;
    return (
      <table style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
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
                  color: "cyan",
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
                  color: "cyan",
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

  return (
    <>
      {modal.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: 48,
              borderRadius: 20,
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              maxWidth: 500,
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 20 }}>
              {modal.message.includes("Ganaste") ? "🏆" : "😢"}
            </div>
            <h1 style={{ color: "white", marginBottom: 24, fontSize: 32 }}>
              {modal.message}
            </h1>
            <Link to="/">
              <button
                style={{
                  marginTop: 24,
                  padding: "12px 32px",
                  fontSize: 16,
                  backgroundColor: "white",
                  color: "#667eea",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                Volver al Inicio
              </button>
            </Link>
          </div>
        </div>
      )}

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "10px 0",
          marginTop: "60px",
        }}
      >
        <Timer onFinish={handleFinishTimer} />
      </div>

      <div
        style={{
          display: "flex",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginTop: "20px",
        }}
      >
        <div style={{ minWidth: 320, maxWidth: 320 }}>
          <h3>JS Input</h3>
          <p style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>
            <strong>Cómo jugar:</strong> para crear un barco y colocarlo sigue
            las indicaciones:
            <br />
            -barco -color -(pos x, pos y) -dirección -tamaño
            <br />
            <span style={{ fontSize: 10, color: "#999" }}>
              (Palabra mágica de prueba: GANAR_AHORA)
            </span>
          </p>
          <textarea
            value={js}
            onChange={(e) => setJs(e.target.value)}
            rows={10}
            cols={40}
            placeholder="barco red(2, 3) horizontal 3"
          />
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => handleFinish(false)}
              style={{ marginRight: 10 }}
            >
              Finalizar
            </button>
            <button onClick={handleHint}>Pista</button>
          </div>

          {/* PISTAS DINÁMICAS */}
          {hintVisible && (
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                padding: 10,
                backgroundColor: "#2a2a2a",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: 5,
              }}
            >
              <p>
                <strong>Colores disponibles:</strong> {getColors().join(", ")}
              </p>
            </div>
          )}

          {resultVisible && !isCorrect && (
            <p style={{ marginTop: 10, color: "red" }}>❌ Incorrecto</p>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div>
            <h3>Tu Solución</h3>
            <Board matrix={preview} blockSize={blockSize} />
          </div>
          <div>
            <h3>Objetivo (Random)</h3>
            {isLoading ? (
              <p>Esperando servidor...</p>
            ) : (
              <Board matrix={expected} blockSize={blockSize} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default JSgame;
