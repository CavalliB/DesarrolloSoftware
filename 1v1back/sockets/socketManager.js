import { supabase } from "../Supabase.js";

const generateRandomLevel = () => {
    const filas = 15;
    const columnas = 15;
    const colors = ["red", "blue", "green", "yellow", "purple", "orange"];

    // Crear matriz vacía (all lightblue)
    const matrix = Array.from({ length: filas + 1 }, () =>
        Array.from({ length: columnas + 1 }, () => "lightblue")
    );

    // Seleccionar colores aleatorios para este nivel
    const selectedColors = [];
    const numShips = 3 + Math.floor(Math.random() * 4); // 3-6 barcos

    for (let i = 0; i < numShips; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const fila = 1 + Math.floor(Math.random() * filas);
        const col = 1 + Math.floor(Math.random() * columnas);
        const isHorizontal = Math.random() > 0.5;
        const length = 2 + Math.floor(Math.random() * 4); // 2-5 de largo

        selectedColors.push(color);

        // Dibujar en la matriz
        if (isHorizontal) {
            for (let j = 0; j < length && col + j <= columnas; j++) {
                matrix[fila][col + j] = color;
            }
        } else {
            for (let j = 0; j < length && fila + j <= filas; j++) {
                matrix[fila + j][col] = color;
            }
        }
    }

    return { matrix, selectedColors };
};

async function updateUsuarioStats(UsuarioId, isWinner) {
    try {
        // 1. Obtener datos actuales del usuario
        const { data: usuarios, error } = await supabase
            .from("Usuario")
            .select("PartidaTotal, PartidaGanada")
            .eq("id", UsuarioId);

        if (error || !usuarios || usuarios.length === 0) {
            console.error("Error obteniendo usuario:", error);
            return;
        }

        const usuario = usuarios[0];

        // 2. Calcular nuevos valores
        const updates = {
            PartidaTotal: (usuario.PartidaTotal || 0) + 1,
            PartidaGanada: isWinner ? (usuario.PartidaGanada || 0) + 1 : (usuario.PartidaGanada || 0)
        };

        // 3. Guardar cambios
        await supabase
            .from("Usuario")
            .update(updates)
            .eq("id", UsuarioId);

        console.log(`📊 Stats actualizadas para ${UsuarioId}:`, updates);

    } catch (err) {
        console.error("Error en updateStats:", err);
    }
}

let waitingPlayer = null;
const roomResults = {};
const roomData = {};
const roomPlayers = {};
const activeGamesSessions = {};

export default function socketManager(io) {
    io.on("connection", (socket) => {
        const currentUsuario = socket.data.user;

        if (!currentUsuario || !currentUsuario.id) {
            console.warn(`⚠️ Conexión sin autenticación: ${socket.id}`);
            socket.disconnect();
            return;
        }

        console.log(`🔌 Conectado: ${currentUsuario.Nombre} (ID: ${currentUsuario.id})`);

        socket.on("checkActiveGame", (callback) => {
            const activeRoom = activeGamesSessions[currentUsuario.id];
            if (activeRoom) {
                console.log(`⚠️ Usuario ${currentUsuario.id} tiene partida activa en ${activeRoom}`);
                callback({ hasActiveGame: true, roomId: activeRoom });
            } else {
                callback({ hasActiveGame: false });
            }
        });

        socket.on("join_room", (roomId) => {
            socket.join(roomId);
            if (roomData[roomId]) {
                socket.emit("initGame", roomData[roomId]);
            }
        });

        socket.on("playerFinished", async ({ roomId, time }) => {
            if (!roomResults[roomId]) roomResults[roomId] = {};

            if (roomResults[roomId].winnerId) {
                const loserData = roomPlayers[roomId]?.find(p => p.id !== roomResults[roomId].winnerId);
                if (loserData && loserData.usuarioId) {
                    await updateUsuarioStats(loserData.usuarioId, false);
                    console.log(`😢 PERDEDOR ACTUALIZADO - Sala: ${roomId}, Usuario: ${loserData.usuarioId}`);
                    if (roomResults[roomId]?.loserTimeout) {
                        clearTimeout(roomResults[roomId].loserTimeout);
                    }
                }
                return;
            }

            roomResults[roomId].winnerId = socket.id;
            roomResults[roomId].winnerTime = time;

            console.log(`🏆 PARTIDA FINALIZADA - Sala: ${roomId}`);
            console.log(`   Ganador: ${currentUsuario.Nombre} (ID: ${currentUsuario.id})`);
            console.log(`   Tiempo: ${time} segundos`);

            io.to(roomId).emit("gameResult", {
                winnerId: socket.id,
                winnerTime: time,
            });

            if (currentUsuario && currentUsuario.id) {
                await updateUsuarioStats(currentUsuario.id, true);
                console.log(`🏆 GANADOR ACTUALIZADO - Sala: ${roomId}, Usuario: ${currentUsuario.id}`);
            }

            const loserTimeout = setTimeout(async () => {
                const loserData = roomPlayers[roomId]?.find(p => p.id !== socket.id);
                if (loserData && loserData.usuarioId && !roomResults[roomId].loserUpdated) {
                    await updateUsuarioStats(loserData.usuarioId, false);
                    roomResults[roomId].loserUpdated = true;
                    console.log(`😢 PERDEDOR ACTUALIZADO AUTOMÁTICAMENTE - Sala: ${roomId}, Usuario: ${loserData.usuarioId}`);
                }
            }, 2000);

            roomResults[roomId].loserTimeout = loserTimeout;

            setTimeout(() => {
                if (roomResults[roomId]?.loserTimeout) {
                    clearTimeout(roomResults[roomId].loserTimeout);
                }

                delete roomResults[roomId];
                delete roomData[roomId];

                const players = roomPlayers[roomId];
                if (players) {
                    players.forEach(player => {
                        delete activeGamesSessions[player.usuarioId];
                    });
                }
                delete roomPlayers[roomId];

                console.log(`🗑️ Sala ${roomId} eliminada después de 5 segundos`);
            }, 5000);
        });

        socket.on("findMatch", () => {
            if (!waitingPlayer) {
                waitingPlayer = socket;
                socket.emit("waiting", "Esperando oponente...");
            } else {
                if (!waitingPlayer.data?.user?.id || !currentUsuario?.id || waitingPlayer.data.user.id === currentUsuario.id) return;

                const roomId = `room-${waitingPlayer.id}-${socket.id}`;

                // Generar nivel
                const levelData = generateRandomLevel();
                roomData[roomId] = levelData;

                // Guardar info de ambos jugadores
                roomPlayers[roomId] = [
                    { id: waitingPlayer.id, usuarioId: waitingPlayer.data.user.id },
                    { id: socket.id, usuarioId: currentUsuario.id }
                ];

                // Registrar partida activa para ambos jugadores
                activeGamesSessions[waitingPlayer.data.user.id] = roomId;
                activeGamesSessions[currentUsuario.id] = roomId;

                waitingPlayer.join(roomId);
                socket.join(roomId);

                console.log(`🎮 PARTIDA CREADA - Sala: ${roomId}`);
                console.log(`   Jugador 1: ${waitingPlayer.data.user.Nombre} (ID: ${waitingPlayer.data.user.id})`);
                console.log(`   Jugador 2: ${currentUsuario.Nombre} (ID: ${currentUsuario.id})`);

                io.to(waitingPlayer.id).emit("matchFound", { roomId });
                io.to(socket.id).emit("matchFound", { roomId });

                // Enviar nivel
                io.to(roomId).emit("initGame", levelData);

                waitingPlayer = null;
            }
        });

        socket.on("disconnect", () => {
            console.log(`❌ Desconectado: ${currentUsuario.Nombre} (ID: ${currentUsuario.id})`);

            if (waitingPlayer && waitingPlayer.id === socket.id) {
                waitingPlayer = null;
                console.log(`   Cancelada búsqueda de matchmaking`);
            }

        });
    });
}
