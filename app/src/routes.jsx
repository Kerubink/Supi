// src/routes.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import App from "./App";
import HomePageContent from "./pages/HomePageContent";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import LoginPage from "./pages/Login"; 
import RegisterPage from "./pages/Register"; 
import { auth } from "./config/firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react"; 


function PrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); 
      setLoading(false);
    });
    return () => unsubscribe(); 
  }, []);

  if (loading) {
    return <div>Carregando...</div>; 
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <App />
            </PrivateRoute>
          }
        >
          <Route index element={<HomePageContent />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="*"
            element={
              <div>
                <h1>404 - Página Não Encontrada</h1>
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default AppRoutes;