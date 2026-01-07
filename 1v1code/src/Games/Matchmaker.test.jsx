import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import Matchmaker from "./Matchmaker";
import socket from "../socket";

// Mock de react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock de socket.io-client
jest.mock("../socket", () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}));

describe("Matchmaker", () => {
  beforeEach(() => {
    socket.emit.mockClear();
    socket.on.mockClear();
    socket.off.mockClear();
    mockNavigate.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renderiza correctamente el estado inicial", () => {
    render(
      <Router>
        <Matchmaker />
      </Router>
    );
    expect(screen.getByText("Matchmaker")).toBeInTheDocument();
    expect(screen.getByText("Esperando acción...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Jugar/i })).toBeInTheDocument();
  });

  test("inicia la búsqueda cuando NO hay partida activa", async () => {
    // Simulamos que el socket responde que NO hay partida activa
    socket.emit.mockImplementation((event, callback) => {
      if (event === "checkActiveGame" && callback) {
        callback({ hasActiveGame: false });
      }
    });

    render(
      <Router>
        <Matchmaker />
      </Router>
    );

    fireEvent.click(screen.getByRole("button", { name: /Jugar/i }));

    await waitFor(() => {
      expect(screen.getByText("🔍 Buscando oponente...")).toBeInTheDocument();
    });
    expect(socket.emit).toHaveBeenCalledWith("findMatch");
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("redirige automáticamente si YA EXISTE una partida activa", async () => {
    // Simulamos que el socket responde que si hay partida activa
    const activeRoomId = "sala-existente-123";
    socket.emit.mockImplementation((event, callback) => {
      if (event === "checkActiveGame" && callback) {
        callback({ hasActiveGame: true, roomId: activeRoomId });
      }
    });

    render(
      <Router>
        <Matchmaker />
      </Router>
    );

    fireEvent.click(screen.getByRole("button", { name: /Jugar/i }));

    // Esperamos el mensaje de advertencia
    await waitFor(() => {
      expect(
        screen.getByText("⚠️ Ya tienes una partida activa")
      ).toBeInTheDocument();
    });

    act(() => {
      jest.runAllTimers();
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/js?room=${activeRoomId}`);
  });

  test('navega a la sala cuando el socket recibe "matchFound"', async () => {
    let matchFoundCallback;
    socket.on.mockImplementation((event, callback) => {
      if (event === "matchFound") {
        matchFoundCallback = callback;
      }
    });

    render(
      <Router>
        <Matchmaker />
      </Router>
    );

    // Simulamos que el servidor emite el evento 'matchFound'
    const newRoomId = "nueva-sala-999";

    expect(matchFoundCallback).toBeDefined();
    act(() => {
      matchFoundCallback({ roomId: newRoomId });
    });

    // Verificamos mensaje de éxito
    expect(screen.getByText("✅ ¡Partida encontrada!")).toBeInTheDocument();

    act(() => {
      jest.runAllTimers();
    });

    expect(mockNavigate).toHaveBeenCalledWith(`/js?room=${newRoomId}`);
  });
});
