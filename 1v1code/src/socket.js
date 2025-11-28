import io from "socket.io-client";
import { SOCKET_URL } from "./config.js";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
});

export default socket;
