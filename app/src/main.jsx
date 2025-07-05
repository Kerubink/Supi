// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoutes from "./routes.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>
);

// 👇 Adicione isso no final do arquivo (fora do ReactDOM)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(reg => {
      console.log('Service worker registrado com sucesso:', reg);
    }).catch(err => {
      console.error('Erro ao registrar o service worker:', err);
    });
  });
}
