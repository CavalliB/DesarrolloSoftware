import { useState } from "react";
import { Link } from "react-router-dom";
import "./CodeEditor.css";
import Timer from "./Timer";

const CodeEditor = () => {
  const [html, setHtml] = useState(`<h1>Hola mundo</h1>`);
  const [css, setCss] = useState(`h1 { color: teal; }body{  color:#fffacd;}`);
  const [js, setJs] = useState(
    `let a = 2; let b = 3; return '<p>Suma: ' + (a+b) + '</p>';`
  );

  // JS del usuario
  let outputHtml = "";
  try {
    const fn = new Function(js);
    outputHtml = fn();
  } catch (err) {
    outputHtml = `<pre style="color:red">${err.message}</pre>`;
  }
  // Respuesta esperada
  const expectedHTML = `<h1>Hola mundo</h1>`;
    const expectedCSS = `h1 { color: teal; }
div {background-color:blue;padding:5px;margin:5px}
.box{display:flex;;background-color:purple; padding:20%}
.in{padding:20px;}
.ini{margin-left:40px}`;
    const expectedJS = `return '<div class="box"><div class="in"></div><div class="in"></div><div class="ini"></div></div>'`;


  let expectedOutput = "";
  try {
    const fnExp = new Function(expectedJS);
    expectedOutput = fnExp();
  } catch (err) {
    expectedOutput = `<pre style="color:red">${err.message}</pre>`;
  }

  // Iframe del usuario
  const srcDoc = `
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        ${outputHtml}
      </body>
    </html>
  `;

  // Iframe Expected
  const expectedSrcDoc = `
    <html>
      <head>
        <style>${expectedCSS}</style>
      </head>
      <body>
        ${expectedHTML}
        ${expectedOutput}
      </body>
    </html>
  `;

  const handleFinishTimer = (totalSeconds) => {
    console.log(`Tiempo total: ${totalSeconds} segundos`);
  };

  return (
    <>
      {/* Badge Work in Progress */}
      <div
        style={{
          position: "fixed",
          backgroundColor: "#FFD700",
          color: "#333",
          padding: "8px 16px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: "bold",
          zIndex: 1000,
        }}
      >
        ⚙️ WORK IN PROGRESS
      </div>
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
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
          marginTop: "20px",
        }}
      >
        <div>
          <h3>HTML</h3>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={6}
            cols={40}
          />

          <h3>CSS</h3>
          <textarea
            value={css}
            onChange={(e) => setCss(e.target.value)}
            rows={4}
            cols={40}
          />

          <h3>JS</h3>
          <textarea
            value={js}
            onChange={(e) => setJs(e.target.value)}
            rows={6}
            cols={40}
          />
        </div>

        <div>
          <h3>Preview</h3>
          <iframe
            title="preview"
            sandbox="allow-scripts"
            srcDoc={srcDoc}
            style={{
              width: "100%",
              height: "400px",
              border: "1px solid black",
            }}
          />
        </div>

        <div>
          <h3>Respuesta Esperada</h3>
          <iframe
            title="expected"
            sandbox="allow-scripts"
            srcDoc={expectedSrcDoc}
            style={{
              width: "100%",
              height: "400px",
              border: "1px solid black",
            }}
          />
        </div>
      </div>
    </>
  );
};
export default CodeEditor;
