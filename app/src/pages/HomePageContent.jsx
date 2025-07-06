import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseconfig";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Loading from "../components/loading/loading";

const PRIMARY_BG = "#191919";
const SECTION_BG = "#282828";
const TEXT_COLOR = "#f9f2e7";
const ACCENT_BLUE = "#00a8c6";
const ACCENT_CYAN = "#40c0cb";
const ACCENT_GREEN = "#aee239";
const ACCENT_YELLOW_GREEN = "#8fbe00";
const ACCENT_ORANGE = "#FF8042";

function DashboardHomePage() {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        setLoading(true);
        try {
          const userProfileRef = doc(
            db,
            `users/${userId}/user_profiles/profile`
          );
          const docSnap = await getDoc(userProfileRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData(null);
            console.log(
              "Nenhum documento de perfil encontrado para o utilizador!"
            );
          }
        } catch (err) {
          console.error("Erro ao buscar dados do utilizador:", err);
          setError("Falha ao carregar os seus dados. Tente novamente.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId]);

  const getProgressPercentage = () => {
    return userData
      ? Math.min(
          100,
          (parseFloat(userData.currentBalance || 0) / 5000) * 100
        ).toFixed(0)
      : 0;
  };

  const getUserLevel = () => {
    const progress = parseFloat(getProgressPercentage());
    if (progress < 25) return "Iniciante";
    if (progress < 50) return "Aprendiz";
    if (progress < 75) return "Conquistador";
    return "Mestre Financeiro";
  };

  const getWeeklyCalendarData = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        day: date.toLocaleDateString("pt-BR", { weekday: "short" }),
        date: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        hasEvent:
          i === 6 &&
          userData?.objective?.includes("Criar uma reserva de emergência"),
      });
    }
    return weekDays;
  };

  const getSuggestedExercises = () => {
    const exercises = [
      {
        id: 1,
        title: "Orçamento Descomplicado",
        description: "Aprenda a criar e seguir seu primeiro orçamento.",
        category: "Básico",
      },
      {
        id: 2,
        title: "Introdução a Investimentos",
        description: "Entenda os tipos de investimento e como começar.",
        category: "Investimentos",
      },
      {
        id: 3,
        title: "Negociando Dívidas",
        description: "Estratégias eficazes para renegociar suas dívidas.",
        category: "Dívidas",
      },
      {
        id: 4,
        title: "Planejamento para Aposentadoria",
        description: "Passos iniciais para construir sua aposentadoria.",
        category: "Planejamento",
      },
      {
        id: 5,
        title: "Economia no Dia a Dia",
        description: "Dicas práticas para economizar nas pequenas coisas.",
        category: "Economia",
      },
    ];
    return exercises;
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div
        className={`flex justify-center items-center h-screen bg-[${PRIMARY_BG}] text-[#EF4444]`}
      >
        <p className="text-lg">Erro: {error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div
        className={`flex flex-col justify-center items-center h-screen bg-[${PRIMARY_BG}] text-[${TEXT_COLOR}]`}
      >
        <p className="text-lg mb-4">Nenhum dado de perfil encontrado.</p>
        <button
          onClick={() => navigate("/customize")}
          className={`bg-[${ACCENT_BLUE}] text-[${TEXT_COLOR}] font-bold p-3 rounded-lg hover:bg-[${ACCENT_CYAN}]`}
        >
          Preencher Formulário de Personalização
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-[url('https://i.pinimg.com/736x/09/8e/15/098e15db6e93a2fe19d7ddcc5ee9beee.jpg')] bg-cover bg-center bg-no-repeat min-h-screen`}
    >
      <div
        className={`container mx-auto p-4 md:p-8 backdrop-blur-2xl bg-black/70 min-h-screen text-[${TEXT_COLOR}]`}
      >
        <header className="flex justify-start items-center gap-2 mb-8">
          <Avatar sx={{ bgcolor: ACCENT_BLUE }}>A</Avatar>
          <span className="font-extrabold text-xl">Olá, usuário</span>
        </header>

        <section className={`mb-8 p-6 rounded-4xl border border-gray-700`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AccountBalanceWalletIcon sx={{ color: ACCENT_BLUE }} /> Finanças
          </h2>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="font-black">Veja seus gastos mensais</p>
              <span className="text-sm font-medium block">
                Você gastou mais com:
                <span className="font-bold"> Alimentação</span>
              </span>
            </div>

            <button
              onClick={() => navigate("/finances")}
              className={`bg-[${ACCENT_BLUE}] text-[${TEXT_COLOR}] font-bold py-2 px-2 rounded-full hover:bg-[${ACCENT_CYAN}] transition-colors duration-200`}
            >
              <ArrowForwardIcon />
            </button>
          </div>
        </section>

        <section className={`mb-8 rounded-lg px-1`}>
          <div className="grid grid-cols-7 text-center gap-2">
            {getWeeklyCalendarData().map((day, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg ${
                  day.isToday
                    ? `bg-[${ACCENT_BLUE}] text-[${TEXT_COLOR}]`
                    : `bg-[${PRIMARY_BG}] bg-opacity-70 backdrop-blur-lg text-[${TEXT_COLOR}] border border-gray-800`
                }`}
              >
                <p className="text-xs font-medium">{day.day}</p>
                <p className="text-lg font-bold">{day.date}</p>
                {day.hasEvent && (
                  <span
                    className={`block text-xs mt-1 bg-[${ACCENT_GREEN}] text-[${PRIMARY_BG}] rounded-full px-2 py-0.5`}
                  >
                    Tarefa!
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className={`mb-8  rounded-lg`}>
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            Progresso
          </h2>
          <div className="p-4  border border-gray-700 rounded-3xl">
            <div className="flex justify-between items-baseline mb-2">
              <p className="text-xl font-semibold">
                Nível:
                <span className="text-xl font-bold"> {getUserLevel()}</span>
              </p>
            </div>

            <div className={`w-full bg-gray-700 rounded-full h-3 mt-2`}>
              <div
                className={`h-3 rounded-full bg-[${ACCENT_GREEN}]`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className={`text-sm text-gray-400 mt-3`}>
              Continue a aprender para subir de nível!
            </p>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FitnessCenterIcon sx={{ color: ACCENT_BLUE }} /> Exercícios
              Sugeridos
            </h2>
            <button
              onClick={() => navigate("/exercises")}
              className={`text-[${ACCENT_BLUE}] font-bold text-sm hover:underline`}
            >
              Ver Mais
            </button>
          </div>

          <div className="flex overflow-x-auto pb-4 space-x-3 scrollbar-hide">
            {getSuggestedExercises().map((exercise) => (
              <div
                key={exercise.id}
                className={`flex flex-col min-w-50 items-start justify-between h-55 backdrop-blur-md p-4 rounded-3xl border border-gray-800 transform transition duration-200 hover:scale-[1.01] cursor-pointer`}
                onClick={() => alert(`Iniciar exercício: ${exercise.title}`)}
              >
                <div>
                  <h3
                    className={`text-md font-semibold text-[${TEXT_COLOR}] mb-2`}
                  >
                    {exercise.title}
                  </h3>
                  <p className={`text-sm text-gray-400 mb-3`}>
                    {exercise.description}
                  </p>
                </div>

                <span
                  className={`inline-block bg-[#00a8c6] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full`}
                >
                  {exercise.category}
                </span>
              </div>
            ))}
          </div>
          <p className={`text-sm text-gray-400 mt-4 text-center`}>
            Baseado nos seus tópicos de interesse.
          </p>
        </section>
      </div>
    </div>
  );
}

export default DashboardHomePage;
