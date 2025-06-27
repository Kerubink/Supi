// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoutes from "./routes.jsx"; // <<< Import AppRoutes

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppRoutes /> {/* <<< Render AppRoutes here */}
  </StrictMode>
);