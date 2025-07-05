import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import App from "./App";
import LearningTrailsPage from "./pages/LearningTrailsPage";
import Profile from "./pages/Profile";
import LoginPage from "./pages/Login";
import FinancesPage from "./pages/FinancesPage";
import RegisterPage from "./pages/Register";
import Ararinhabot from "./pages/Ararinhabot"; 
import FormsCustomization from "./pages/formsCustomization"; 

import { auth, db } from "./config/firebaseconfig"; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import DashboardHomePage from "./pages/HomePageContent";

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

function OnboardingGuard({ children }) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null); 
  const [loadingOnboarding, setLoadingOnboarding] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const userProfileRef = doc(
            db,
            `users/${user.uid}/user_profiles/profile`
          );
          const docSnap = await getDoc(userProfileRef);
          if (docSnap.exists() && docSnap.data().hasCompletedOnboardingForm) {
            setHasCompletedOnboarding(true);
          } else {
            setHasCompletedOnboarding(false);
          }
        } catch (error) {
          console.error("Erro ao verificar status do onboarding:", error);
          setHasCompletedOnboarding(false);
        } finally {
          setLoadingOnboarding(false);
        }
      } else {
        setHasCompletedOnboarding(false);
        setLoadingOnboarding(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loadingOnboarding) {
    return <div>Verificando perfil...</div>; 
  }

  if (userId && !hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<FormsCustomization />} />{" "}
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
          <Route path="finances" element={<FinancesPage />} />
          <Route path="ararinha-bot" element={<Ararinhabot />} />
          <Route path="statistics" element={<LearningTrailsPage />} />
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
