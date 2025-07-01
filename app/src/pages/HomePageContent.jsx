// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseconfig';
import { useNavigate } from 'react-router-dom';

const CalendarIcon = () => <span className="text-xl">📅</span>;
const ProgressIcon = () => <span className="text-xl">📈</span>;
const LevelIcon = () => <span className="text-xl">🏅</span>;
const ExerciseIcon = () => <span className="text-xl">📚</span>;
const FinanceIcon = () => <span className="text-xl">💰</span>;

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
          const userProfileRef = doc(db, `users/${userId}/user_profiles/profile`);
          const docSnap = await getDoc(userProfileRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData(null);
            console.log("Nenhum documento de perfil encontrado para o usuário!");
          }
        } catch (err) {
          console.error("Erro ao buscar dados do usuário:", err);
          setError("Falha ao carregar seus dados. Tente novamente.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId]);

  const getProgressPercentage = () => {
    return userData ? Math.min(100, (parseFloat(userData.currentBalance || 0) / 5000) * 100).toFixed(0) : 0;
  };

  const getUserLevel = () => {
 
    const progress = parseFloat(getProgressPercentage());
    if (progress < 25) return "Iniciante";
    if (progress < 50) return "Aprendiz";
    if (progress < 75) return "Conquistador";
    return "Mestre Financeiro";
  };

  const getUserXP = () => {
    return userData ? (parseFloat(userData.currentBalance || 0) * 10).toFixed(0) : 0;
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
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        date: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        hasEvent: i === 6 && userData?.objective?.includes('Criar uma reserva de emergência'),
      });
    }
    return weekDays;
  };

  const getSuggestedExercises = () => {

    const exercises = [
      { id: 1, title: "Orçamento Descomplicado", description: "Aprenda a criar e seguir seu primeiro orçamento.", category: "Básico" },
      { id: 2, title: "Introdução a Investimentos", description: "Entenda os tipos de investimento e como começar.", category: "Investimentos" },
      { id: 3, title: "Negociando Dívidas", description: "Estratégias eficazes para renegociar suas dívidas.", category: "Dívidas" },
      { id: 4, title: "Planejamento para Aposentadoria", description: "Passos iniciais para construir sua aposentadoria.", category: "Planejamento" },
      { id: 5, title: "Economia no Dia a Dia", description: "Dicas práticas para economizar nas pequenas coisas.", category: "Economia" },
    ];
    return exercises;
  };

  // --- Renderização Condicional ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Carregando sua visão geral financeira...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg text-red-600">Erro: {error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <p className="text-lg text-gray-700 mb-4">Nenhum dado de perfil encontrado.</p>
        <button
          onClick={() => navigate('/customize')} // Usar navigate para ir ao formulário
          className="bg-purple-600 text-white font-bold p-3 rounded-lg shadow-md hover:bg-purple-700"
        >
          Preencher Formulário de Personalização
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Seu Dashboard Financeiro</h1>

      {/* 1. Card de Finanças */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-xl transform transition duration-300 hover:scale-[1.02]">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <FinanceIcon /> Finanças: Veja seus gastos mensais
          </h2>
          <span className="text-lg font-medium block mb-4">
            Você gastou mais com: <span className="font-bold">Alimentação</span> (Exemplo)
          </span>
          <button
            onClick={() => navigate('/finances')} 
            className="bg-white text-blue-700 font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-100 transition-colors duration-200"
          >
            Ir para Finanças
          </button>
        </div>
      </section>

      {/* 2. Calendário Semanal */}
      <section className="bg-white p-6 rounded-lg shadow-xl mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <CalendarIcon /> Seu Calendário Semanal
        </h2>
        <div className="grid grid-cols-7 text-center gap-2">
          {getWeeklyCalendarData().map((day, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${day.isToday ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}
            >
              <p className="text-xs font-medium">{day.day}</p>
              <p className="text-lg font-bold">{day.date}</p>
              {day.hasEvent && <span className="block text-xs mt-1 bg-green-400 text-white rounded-full px-2 py-0.5">Tarefa!</span>}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">Eventos e tarefas importantes para esta semana.</p>
      </section>

      {/* 3. Seção de Progresso, Nível e XP (Combinados) */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-green-700 text-white p-6 rounded-lg shadow-xl transform transition duration-300 hover:scale-[1.02]">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <LevelIcon /> Seu Progresso e Nível
          </h2>
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-xl font-semibold">Nível: <span className="text-3xl font-bold">{getUserLevel()}</span></p>
            <p className="text-xl font-semibold">XP: <span className="text-3xl font-bold">{getUserXP()}</span></p>
          </div>
          <p className="text-lg font-semibold mb-2">Progresso: {`${getProgressPercentage()}%`}</p>
          <div className="w-full bg-purple-300 rounded-full h-3 mt-2">
            <div className="bg-white h-3 rounded-full" style={{ width: `${getProgressPercentage()}%` }}></div>
          </div>
          <p className="text-sm opacity-80 mt-3">Continue aprendendo para subir de nível!</p>
        </div>
      </section>

      {/* 4. Seção de Exercícios com Carrossel */}
      <section className="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <ExerciseIcon /> Exercícios Sugeridos
          </h2>
          <button
            onClick={() => navigate('/exercises')} 
            className="text-purple-600 font-bold hover:underline"
          >
            Veja Mais
          </button>
        </div>

        {/* Carrossel de Cards de Exercícios */}
        <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide"> {/* 'scrollbar-hide' para esconder a barra de rolagem */}
          {getSuggestedExercises().map((exercise) => (
            <div
              key={exercise.id}
              className="flex-none w-64 bg-gray-50 p-4 rounded-lg shadow-md border border-gray-100 transform transition duration-200 hover:scale-[1.01] cursor-pointer"
              onClick={() => alert(`Iniciar exercício: ${exercise.title}`)} // Ação ao clicar no card
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{exercise.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
              <span className="inline-block bg-purple-200 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {exercise.category}
              </span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">Baseado nos seus tópicos de interesse.</p>
      </section>
    </div>
  );
}

export default DashboardHomePage;
