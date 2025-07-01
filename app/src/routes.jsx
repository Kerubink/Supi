// src/routes.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import App from "./App";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import LoginPage from "./pages/Login"; 
import RegisterPage from "./pages/Register"; 
// Import FormsCustomization component
import FormsCustomization from "./pages/formsCustomization"; // Make sure the path is correct

import { auth, db } from "./config/firebaseconfig"; // Import 'db' here
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import getDoc for fetching data
import DashboardHomePage from "./pages/HomePageContent";


// PrivateRoute remains for basic authentication check
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

// New component to guard access based on onboarding status
function OnboardingGuard({ children }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null); // null means still loading
  const [loadingOnboarding, setLoadingOnboarding] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const userProfileRef = doc(db, `users/${user.uid}/user_profiles/profile`);
          const docSnap = await getDoc(userProfileRef);
          if (docSnap.exists() && docSnap.data().hasCompletedOnboardingForm) {
            setHasCompletedOnboarding(true);
          } else {
            // If document doesn't exist, or flag is false/undefined, assume not completed
            setHasCompletedOnboarding(false);
          }
        } catch (error) {
          console.error("Erro ao verificar status do onboarding:", error);
          // In case of error, assume onboarding needs to be completed for safety
          setHasCompletedOnboarding(false); 
        } finally {
          setLoadingOnboarding(false);
        }
      } else {
        // Not authenticated, let PrivateRoute handle redirection to login
        setHasCompletedOnboarding(false); 
        setLoadingOnboarding(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loadingOnboarding) {
    return <div>Verificando perfil...</div>; // Or a custom loading spinner
  }

  // If user is authenticated and has NOT completed onboarding, redirect to onboarding form
  if (userId && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is authenticated and HAS completed onboarding, or not authenticated (PrivateRoute will handle login redirect)
  return children;
}


function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<FormsCustomization />} /> {/* New route for the onboarding form */}

        <Route
          path="/"
          element={
            <PrivateRoute>
              <OnboardingGuard>
                <App />
              </OnboardingGuard>
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardHomePage />} />
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