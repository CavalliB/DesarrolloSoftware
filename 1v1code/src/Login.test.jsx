import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ModalUsuario } from "./Login";

// Mock de la API_URL si es necesario, aunque para estas pruebas iniciales no es crítico
jest.mock("./config", () => ({
  API_URL: "http://localhost:3000",
}));

describe("ModalUsuario (Login/Registro)", () => {
  const mockOnClose = jest.fn();
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    // Limpia los mocks antes de cada prueba para asegurar que no haya interferencias
    mockOnClose.mockClear();
    mockOnLoginSuccess.mockClear();
  });

  test("no renderiza el modal cuando isOpen es false", () => {
    render(
      <ModalUsuario
        isOpen={false}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );
    expect(screen.queryByText("Bienvenido")).not.toBeInTheDocument();
  });

  test("renderiza el modal cuando isOpen es true", () => {
    render(
      <ModalUsuario
        isOpen={true}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );
    expect(screen.getByText("Bienvenido")).toBeInTheDocument();
    expect(screen.getByText("Entrar")).toBeInTheDocument();
  });

  test('cambia al modo de registro cuando se hace clic en "Registrate aquí"', () => {
    render(
      <ModalUsuario
        isOpen={true}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );

    expect(
      screen.queryByLabelText("Nombre de usuario")
    ).not.toBeInTheDocument();
    expect(screen.getByText("Entrar")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Registrate aquí"));

    expect(screen.getByLabelText("Nombre de usuario")).toBeInTheDocument();
    expect(screen.getByText("Registrar")).toBeInTheDocument();
  });

  test('cambia de nuevo al modo de inicio de sesión cuando se hace clic en "Inicia sesión"', () => {
    render(
      <ModalUsuario
        isOpen={true}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );

    fireEvent.click(screen.getByText("Registrate aquí"));
    expect(screen.getByText("Registrar")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Inicia sesión"));
    expect(screen.getByText("Entrar")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Nombre de usuario")
    ).not.toBeInTheDocument();
  });

  test("maneja la entrada de datos en los campos de email y contraseña", () => {
    render(
      <ModalUsuario
        isOpen={true}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );

    const emailInput = screen.getByLabelText("Correo electrónico");
    const passwordInput = screen.getByLabelText("Contraseña");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("maneja la entrada de datos en el campo de nombre de usuario en modo registro", () => {
    render(
      <ModalUsuario
        isOpen={true}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );

    fireEvent.click(screen.getByText("Registrate aquí"));

    const nameInput = screen.getByLabelText("Nombre de usuario");
    fireEvent.change(nameInput, { target: { value: "NuevoUsuario" } });

    expect(nameInput.value).toBe("NuevoUsuario");
  });

  test("muestra mensaje de error si los campos de login están vacíos al intentar iniciar sesión", async () => {
    render(
      <ModalUsuario
        isOpen={true}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );

    fireEvent.click(screen.getByText("Entrar"));

    expect(
      await screen.findByText("Completá todos los campos.")
    ).toBeInTheDocument();
    expect(screen.getByText("Completá todos los campos.")).toHaveClass("error");
  });

  test("login exitoso", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: "fake-token",
            usuario: { email: "test@example.com" },
          }),
      })
    );

    render(
      <ModalUsuario
        isOpen
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByText("Entrar"));

    await screen.findByText("¡Inicio de sesión exitoso!");

    await waitFor(
      () => {
        expect(mockOnLoginSuccess).toHaveBeenCalledWith({
          email: "test@example.com",
        });
        expect(mockOnClose).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );
  });
});
