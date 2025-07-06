import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseconfig";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Loading from "../components/loading/loading";
import { usePWAInstall } from "../hooks/usePWAInstall";

const PRIMARY_BG = "#191919";
const SECTION_BG = "#282828";
const TEXT_COLOR = "#f9f2e7";
const ACCENT_BLUE = "#00a8c6";
const ACCENT_CYAN = "#40c0cb";
const ACCENT_GREEN = "#aee239";

function Profile() {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { canInstall, installApp } = usePWAInstall();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setUserData(null);
        setLoading(false);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        setLoading(true);
        try {
          const userProfileRef = doc(db, `users/${userId}/user_profiles/profile`);
          const docSnap = await getDoc(userProfileRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData(null);
            console.log("Nenhum documento de perfil encontrado!");
          }
        } catch (err) {
          console.error("Erro ao buscar dados:", err);
          setError("Falha ao carregar os dados. Tente novamente.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className={`flex justify-center items-center h-screen bg-[${PRIMARY_BG}] text-[#EF4444]`}>
        <p className="text-lg">Erro: {error}</p>
      </div>
    );
  }
  if (!userData) {
    return (
      <div className={`flex flex-col justify-center items-center h-screen bg-[${PRIMARY_BG}] text-[${TEXT_COLOR}]`}>
        <p className="text-lg mb-4">Nenhum dado de perfil encontrado.</p>
      </div>
    );
  }

  return (
    <div className={`bg-[url('https://i.pinimg.com/736x/09/8e/15/098e15db6e93a2fe19d7ddcc5ee9beee.jpg')] bg-cover bg-center bg-no-repeat min-h-screen`}>
      <div className={`container mx-auto p-4 md:p-8 backdrop-blur-2xl bg-black/70 min-h-screen text-[${TEXT_COLOR}]`}>
        {/* Header */}
        <header className="flex justify-start items-center gap-2 mb-8">
          <Avatar sx={{ bgcolor: ACCENT_BLUE }}>A</Avatar>
          <span className="font-extrabold text-xl">Meu Perfil</span>
        </header>

        {/* Seção de Saldo */}
        <section className="mb-3  rounded-4xl">
          <div className="space-y-1">
            <p className="text-2xl font-black">
              R$ {userData.currentBalance ? parseFloat(userData.currentBalance).toFixed(2) : "0,00"}
            </p>
            <span className="text-sm font-medium block">
              Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </span>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-8 rounded-4xl">
          <div className="grid grid-cols-3 gap-4">
            {[["Iniciante", ACCENT_BLUE], ["Economista", ACCENT_GREEN], ["Investidor", ACCENT_CYAN]].map(
              ([label, color], index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center p-4 rounded-xl bg-[${PRIMARY_BG}] border border-gray-600`}
                >
                  <div className={`w-16 h-16 rounded-full bg-[${color}] bg-opacity-20 flex items-center justify-center mb-2`}>
                    <EmojiEventsIcon sx={{ color, fontSize: 32 }} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              )
            )}
          </div>
        </section>

        {/* Configurações */}
        <section className="mb-8 rounded-4xl">
          <h2 className="text-xl font-bold mb-4">Configurações</h2>
          <div className="space-y-4">
            {[
              "Minha Conta",
              "Segurança e Privacidade",
              "Notificações",
              "Idioma e Moeda",
              "Assinatura/Plano",
            ].map((item, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-4 rounded-xl border border-gray-600 cursor-pointer hover:bg-[${PRIMARY_BG}]/50 transition-colors`}
                onClick={() => console.log(`${item} clicado`)}
              >
                <span className="font-medium">{item}</span>
                <span className="text-gray-400">→</span>
              </div>
            ))}

            {/* Botão Instalar App (PWA) */}
            {canInstall && (
              <div
                className={`flex justify-between items-center p-4 rounded-xl border border-gray-600 cursor-pointer hover:bg-[${PRIMARY_BG}]/50 transition-colors`}
                onClick={installApp}
              >
                <span className="font-medium">Instalar App</span>
                <span className="text-gray-400">⬇️</span>
              </div>
            )}

            {/* Botão Logout */}
            <div
              className={`flex justify-between items-center p-4 rounded-xl border border-gray-600 cursor-pointer hover:bg-red-700/50 transition-colors`}
              onClick={handleLogout}
            >
              <span className="font-medium text-red-400">Sair do App</span>
              <span className="text-red-400">⎋</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;
