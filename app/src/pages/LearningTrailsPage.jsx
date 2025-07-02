// src/pages/LearningTrailsPage.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Importar setDoc para salvar progresso
import { auth, db } from '../config/firebaseconfig'; // Ajuste o caminho conforme necessário
import { useNavigate } from 'react-router-dom';

// Ícones de exemplo
const TrailIcon = () => <span className="text-xl">🗺️</span>;
const LessonIcon = () => <span className="text-xl">💡</span>;
const ActivityIcon = () => <span className="text-xl">📝</span>;
const XPIcon = () => <span className="text-xl">✨</span>;
const CompletedIcon = () => <span className="text-green-500">✅</span>;
const LockIcon = () => <span className="text-gray-400">🔒</span>;
const LevelIcon = () => <span className="text-xl">🏅</span>;


// Dados de exemplo para as trilhas de aprendizado
// Em um aplicativo real, isso viria de um banco de dados ou API
const learningTrailsData = [
  {
    id: 'basico',
    name: 'Trilha Básica: Primeiros Passos',
    levelRequired: 0, // Nível 0 significa disponível para todos
    description: 'Fundamentos essenciais para começar a gerenciar suas finanças.',
    lessons: [
      {
        id: 'l1-o-que-e-orcamento',
        title: 'Aula 1: O que é Orçamento Pessoal?',
        xp: 50,
        activities: [
          { id: 'a1-quiz-orcamento', name: 'Quiz: Conceitos de Orçamento', xp: 20 },
          { id: 'a2-exercicio-despesas', name: 'Exercício: Liste Suas Despesas', xp: 30 },
        ],
      },
      {
        id: 'l2-controle-gastos',
        title: 'Aula 2: Como Controlar Seus Gastos',
        xp: 70,
        activities: [
          { id: 'a3-quiz-controle', name: 'Quiz: Ferramentas de Controle', xp: 25 },
          { id: 'a4-exercicio-plano', name: 'Exercício: Crie Seu Plano de Gastos', xp: 45 },
        ],
      },
    ],
  },
  {
    id: 'intermediario',
    name: 'Trilha Intermediária: Investimentos Inteligentes',
    levelRequired: 1, // Exemplo: Requer Nível 1 para desbloquear
    description: 'Aprenda a investir seu dinheiro de forma estratégica.',
    lessons: [
      {
        id: 'l3-tipos-investimento',
        title: 'Aula 3: Tipos de Investimento',
        xp: 100,
        activities: [
          { id: 'a5-quiz-investimentos', name: 'Quiz: Renda Fixa vs Variável', xp: 40 },
        ],
      },
    ],
  },
  {
    id: 'avancado',
    name: 'Trilha Avançada: Planejamento de Aposentadoria',
    levelRequired: 2, // Exemplo: Requer Nível 2 para desbloquear
    description: 'Prepare-se para o futuro com um planejamento sólido.',
    lessons: [
      {
        id: 'l4-previdencia-privada',
        title: 'Aula 4: Previdência Privada e Fundos',
        xp: 120,
        activities: [
          { id: 'a6-simulacao-aposentadoria', name: 'Simulação: Seu Futuro Financeiro', xp: 60 },
        ],
      },
    ],
  },
];

function LearningTrailsPage() {
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Para armazenar o nível e XP do usuário
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estado para controlar o progresso do usuário nas aulas/atividades
  // Ex: { 'l1-o-que-e-orcamento': true, 'a1-quiz-orcamento': true }
  const [completedItems, setCompletedItems] = useState({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchUserProfileAndProgress = async () => {
      if (userId) {
        setLoading(true);
        try {
          const userProfileRef = doc(db, `users/${userId}/user_profiles/profile`);
          const docSnap = await getDoc(userProfileRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile(data);
            // Carregar o progresso das trilhas do Firestore
            setCompletedItems(data.completedLearningItems || {});
          } else {
            setUserProfile({ level: 0, xp: 0 }); // Define um perfil inicial se não existir
            setCompletedItems({});
          }
        } catch (err) {
          console.error("Erro ao buscar perfil do usuário ou progresso:", err);
          setError("Falha ao carregar seu progresso. Tente novamente.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfileAndProgress();
  }, [userId]);

  // Função para simular a conclusão de uma aula/atividade
  const handleCompleteItem = async (itemId, xpGained) => {
    if (!userId || !userProfile) return;

    // Se o item já está completo, não faz nada
    if (completedItems[itemId]) {
      console.log(`${itemId} já está completo.`);
      return;
    }

    const newCompletedItems = {
      ...completedItems,
      [itemId]: true,
    };

    // Calcula novo XP e Nível (lógica simplificada)
    let newXp = (userProfile.xp || 0) + xpGained;
    let newLevel = userProfile.level || 0;

    // Lógica de subida de nível (exemplo: 200 XP por nível)
    const xpForNextLevel = (newLevel + 1) * 200;
    if (newXp >= xpForNextLevel) {
      newLevel++;
      // Opcional: resetar XP ou levar o excedente para o próximo nível
      // newXp = newXp - xpForNextLevel;
    }

    setCompletedItems(newCompletedItems);
    setUserProfile(prev => ({ ...prev, xp: newXp, level: newLevel }));

    // Salvar o progresso e o novo XP/Nível no Firestore
    try {
      const userProfileRef = doc(db, `users/${userId}/user_profiles/profile`);
      await setDoc(userProfileRef, {
        xp: newXp,
        level: newLevel,
        completedLearningItems: newCompletedItems,
      }, { merge: true });
      console.log(`Progresso e XP atualizados para ${userId}`);
    } catch (err) {
      console.error("Erro ao salvar progresso:", err);
      // Reverter estado local se o salvamento falhar (opcional)
    }
  };

  // Função para verificar se uma trilha/aula/atividade está completa
  const isItemCompleted = (itemId) => completedItems[itemId];

  // Função para verificar se uma trilha está desbloqueada
  const isTrailUnlocked = (levelRequired) => {
    return (userProfile?.level || 0) >= levelRequired;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Carregando trilhas de aprendizado...</p>
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

  if (!userProfile) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <p className="text-lg text-gray-700 mb-4">Seu perfil não foi carregado.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-purple-600 text-white font-bold p-3 rounded-lg shadow-md hover:bg-purple-700"
        >
          Voltar para o Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Trilhas de Aprendizado</h1>

      {/* Visão Geral do Progresso do Usuário */}
      <section className="bg-gradient-to-r from-purple-600 to-green-700 text-white p-6 rounded-lg shadow-xl mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <LevelIcon /> Seu Progresso
        </h2>
        <div className="flex justify-between items-baseline mb-2">
          <p className="text-xl font-semibold">Nível: <span className="text-3xl font-bold">{userProfile.level || 0}</span></p>
          <p className="text-xl font-semibold">XP: <span className="text-3xl font-bold">{userProfile.xp || 0}</span></p>
        </div>
        <p className="text-lg font-semibold mb-2">
          Progresso para o próximo nível: {userProfile.xp || 0} / {(userProfile.level + 1) * 200} XP
        </p>
        <div className="w-full bg-purple-300 rounded-full h-3 mt-2">
          <div
            className="bg-white h-3 rounded-full"
            style={{ width: `${Math.min(100, ((userProfile.xp || 0) / ((userProfile.level + 1) * 200)) * 100)}%` }}
          ></div>
        </div>
        <p className="text-sm opacity-80 mt-3">Complete aulas e atividades para ganhar mais XP e subir de nível!</p>
      </section>

      {/* Lista de Trilhas de Aprendizado */}
      <section className="space-y-6">
        {learningTrailsData.map(trail => (
          <div
            key={trail.id}
            className={`bg-white p-6 rounded-lg shadow-xl border ${isTrailUnlocked(trail.levelRequired) ? 'border-purple-200' : 'border-gray-200 opacity-70'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <TrailIcon /> {trail.name}
              </h3>
              {!isTrailUnlocked(trail.levelRequired) && (
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <LockIcon /> Nível {trail.levelRequired} necessário
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-4">{trail.description}</p>

            {isTrailUnlocked(trail.levelRequired) ? (
              <div className="space-y-4">
                {trail.lessons.map(lesson => (
                  <div key={lesson.id} className="bg-gray-50 p-4 rounded-md border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <LessonIcon /> {lesson.title}
                      </h4>
                      <span className="text-sm text-purple-600 font-bold flex items-center gap-1">
                        {lesson.xp} XP <XPIcon />
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Status: {isItemCompleted(lesson.id) ? <CompletedIcon /> : 'Pendente'}
                    </p>
                    <button
                      onClick={() => handleCompleteItem(lesson.id, lesson.xp)}
                      disabled={isItemCompleted(lesson.id)}
                      className={`px-4 py-2 rounded-md font-semibold text-white ${isItemCompleted(lesson.id) ? 'bg-green-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {isItemCompleted(lesson.id) ? 'Concluído' : 'Iniciar Aula'}
                    </button>

                    {/* Atividades da Aula */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="font-medium text-gray-700 mb-2">Atividades:</p>
                      <ul className="space-y-2">
                        {lesson.activities.map(activity => (
                          <li key={activity.id} className="flex justify-between items-center text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <ActivityIcon /> {activity.name}
                            </span>
                            <span className="flex items-center gap-1">
                              {activity.xp} XP <XPIcon />
                              {isItemCompleted(activity.id) && <CompletedIcon />}
                              {!isItemCompleted(activity.id) && (
                                <button
                                  onClick={() => handleCompleteItem(activity.id, activity.xp)}
                                  className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                                >
                                  Fazer
                                </button>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Complete as trilhas anteriores para desbloquear!</p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

export default LearningTrailsPage;
