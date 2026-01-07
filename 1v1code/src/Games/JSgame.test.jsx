import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter as Router } from "react-router-dom";
import JSgame from "./JSgame";
import socket from "../socket";

// Mock de react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    search: "", // simula URL limpia en vez de una especifica como '?room=123'
  }),
}));

// Mock de socket.io-client
jest.mock("../socket", () => ({
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  id: "test-socket-id",
}));

describe("JSgame", () => {
  beforeEach(() => {
    socket.emit.mockClear();
    socket.on.mockClear();
    socket.off.mockClear();
  });

  test("renders basic game interface structure", async () => {
    render(
      <Router>
        <JSgame />
      </Router>
    );

    // Verificamos elementos estáticos principales
    expect(screen.getByText("JS Input")).toBeInTheDocument();
    expect(screen.getByText("Tu Solución")).toBeInTheDocument();
    expect(screen.getByText("00:00")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Finalizar/i })
    ).toBeInTheDocument();
  });

  test("inicializa el tablero objetivo cuando el socket envía datos (initGame)", async () => {
    //  Simulamos los datos que enviaría el backend
    const mockMatrix = Array(16).fill(Array(16).fill("lightblue"));
    const mockColors = [{ color: "red" }, { color: "blue" }];

    //  Cuando el componente escuche 'initGame', ejecutamos el callback inmediatamente
    socket.on.mockImplementation((event, callback) => {
      if (event === "initGame") {
        callback({ matrix: mockMatrix, selectedColors: mockColors });
      }
    });

    render(
      <Router>
        <JSgame />
      </Router>
    );

    // verificamos que no esté el mensaje de carga o que aparezca el tablero.

    await waitFor(() => {
      expect(
        screen.queryByText("Esperando servidor...")
      ).not.toBeInTheDocument();
    });

    // Verificamos que se renderizó la sección del objetivo correctamente
    expect(screen.getByText("Objetivo (Random)")).toBeInTheDocument();
  });

  test("permite al usuario escribir código en el editor", () => {
    render(
      <Router>
        <JSgame />
      </Router>
    );

    const inputArea = screen.getByPlaceholderText(/barco red/i);
    const nuevoCodigo = "barco blue(1, 1) vertical 2";

    // Simulamos que el usuario escribe
    fireEvent.change(inputArea, { target: { value: nuevoCodigo } });

    // Verificamos que el valor del textarea cambio
    expect(inputArea.value).toBe(nuevoCodigo);
  });

  test("envía evento de finalización al hacer click en Finalizar (simulación manual)", () => {
    render(
      <Router>
        <JSgame />
      </Router>
    );

    // Simulamos click en Finalizar
    fireEvent.click(screen.getByText("Finalizar"));

    expect(screen.getByText(/Incorrecto/i)).toBeInTheDocument();
  });
});
