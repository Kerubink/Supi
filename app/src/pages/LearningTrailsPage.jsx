import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseconfig';
import { useNavigate } from 'react-router-dom';
import Avatar from "@mui/material/Avatar";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Loading from "../components/loading/loading";

const PRIMARY_BG = "#191919";
const SECTION_BG = "#282828";
const TEXT_COLOR = "#f9f2e7";
const ACCENT_BLUE = "#00a8c6";
const ACCENT_CYAN = "#40c0cb";
const ACCENT_GREEN = "#aee239";
const ACCENT_YELLOW_GREEN = "#8fbe00";
const ACCENT_ORANGE = "#FF8042";

const TrailIcon = () => <TrendingUpIcon sx={{ color: ACCENT_BLUE }} />;
const LessonIcon = () => <span className="text-xl" style={{ color: ACCENT_GREEN }}>💡</span>;
const ActivityIcon = () => <span className="text-xl" style={{ color: ACCENT_CYAN }}>📝</span>;
const XPIcon = () => <span className="text-xl" style={{ color: ACCENT_YELLOW_GREEN }}>✨</span>;
const CompletedIcon = () => <span style={{ color: ACCENT_GREEN }}>✓</span>;
const LockIcon = () => <span style={{ color: ACCENT_ORANGE }}>🔒</span>;

const learningTrailsData = [
  {
    id: 'basico',
    name: 'Trilha Básica: Primeiros Passos',
    levelRequired: 0,
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
    levelRequired: 1,
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
    levelRequired: 2,
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
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
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
            setCompletedItems(data.completedLearningItems || {});
          } else {
            setUserProfile({ level: 0, xp: 0 });
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

  const handleCompleteItem = async (itemId, xpGained) => {
    if (!userId || !userProfile) return;

    if (completedItems[itemId]) {
      console.log(`${itemId} já está completo.`);
      return;
    }

    const newCompletedItems = {
      ...completedItems,
      [itemId]: true,
    };

    let newXp = (userProfile.xp || 0) + xpGained;
    let newLevel = userProfile.level || 0;

    const xpForNextLevel = (newLevel + 1) * 200;
    if (newXp >= xpForNextLevel) {
      newLevel++;
    }

    setCompletedItems(newCompletedItems);
    setUserProfile(prev => ({ ...prev, xp: newXp, level: newLevel }));

    try {
      const userProfileRef = doc(db, `users/${userId}/user_profiles/profile`);
      await setDoc(userProfileRef, {
        xp: newXp,
        level: newLevel,
        completedLearningItems: newCompletedItems,
      }, { merge: true });
    } catch (err) {
      console.error("Erro ao salvar progresso:", err);
    }
  };

  const isItemCompleted = (itemId) => completedItems[itemId];
  const isTrailUnlocked = (levelRequired) => (userProfile?.level || 0) >= levelRequired;

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center h-screen bg-[${PRIMARY_BG}] text-[#EF4444]`}>
        <p className="text-lg">Erro: {error}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className={`flex flex-col justify-center items-center h-screen bg-[${PRIMARY_BG}] text-[${TEXT_COLOR}]`}>
        <p className="text-lg mb-4">Seu perfil não foi carregado.</p>
        <button
          onClick={() => navigate('/')}
          className={`bg-[${ACCENT_BLUE}] text-[${TEXT_COLOR}] font-bold p-3 rounded-lg hover:bg-[${ACCENT_CYAN}]`}
        >
          Voltar para o Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-[url('https://i.pinimg.com/736x/09/8e/15/098e15db6e93a2fe19d7ddcc5ee9beee.jpg')] bg-cover bg-center bg-no-repeat min-h-screen`}>
      <div className={`container mx-auto p-4 md:p-8 backdrop-blur-2xl bg-black/70 min-h-screen text-[${TEXT_COLOR}]`}>
        <header className="flex justify-start items-center gap-2 mb-8">
          <span className="font-extrabold text-xl">Trilhas de Aprendizado</span>
        </header>

        <section className={`mb-8 bg-[${SECTION_BG}] bg-opacity-70 backdrop-blur-lg p-6 rounded-4xl border border-gray-700`}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <EmojiEventsIcon sx={{ color: ACCENT_BLUE }} /> Seu Progresso
          </h2>
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-xl font-semibold">
              Nível: <span className="text-3xl font-bold" style={{ color: ACCENT_GREEN }}>{userProfile.level || 0}</span>
            </p>
            <p className="text-xl font-semibold">
              XP: <span className="text-3xl font-bold" style={{ color: ACCENT_YELLOW_GREEN }}>{userProfile.xp || 0}</span>
            </p>
          </div>
          <p className="text-lg font-semibold mb-2">
            Progresso para o próximo nível: {userProfile.xp || 0} / {(userProfile.level + 1) * 200} XP
          </p>
          <div className={`w-full bg-gray-700 rounded-full h-3 mt-2`}>
            <div
              className={`h-3 rounded-full bg-[${ACCENT_GREEN}]`}
              style={{ width: `${Math.min(100, ((userProfile.xp || 0) / ((userProfile.level + 1) * 200)) * 100)}%` }}
            ></div>
          </div>
          <p className={`text-sm text-gray-400 mt-3`}>
            Complete aulas e atividades para ganhar mais XP e subir de nível!
          </p>
        </section>

        <section className="space-y-6">
          {learningTrailsData.map(trail => (
            <div
              key={trail.id}
              className={`bg-[${SECTION_BG}] bg-opacity-70 backdrop-blur-lg p-6 rounded-4xl border ${
                isTrailUnlocked(trail.levelRequired) ? 'border-[#00a8c6]' : 'border-gray-700 opacity-70'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrailIcon /> {trail.name}
                </h3>
                {!isTrailUnlocked(trail.levelRequired) && (
                  <span className="text-sm flex items-center gap-1" style={{ color: ACCENT_ORANGE }}>
                    <LockIcon /> Nível {trail.levelRequired} necessário
                  </span>
                )}
              </div>
              <p className={`text-gray-400 mb-4`}>{trail.description}</p>

              {isTrailUnlocked(trail.levelRequired) ? (
                <div className="space-y-4">
                  {trail.lessons.map(lesson => (
                    <div key={lesson.id} className={`bg-[${PRIMARY_BG}] bg-opacity-70 p-4 rounded-3xl border border-gray-700`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                          <LessonIcon /> {lesson.title}
                        </h4>
                        <span className="text-sm font-bold flex items-center gap-1" style={{ color: ACCENT_YELLOW_GREEN }}>
                          {lesson.xp} XP <XPIcon />
                        </span>
                      </div>
                      <p className="text-sm mb-3" style={{ color: isItemCompleted(lesson.id) ? ACCENT_GREEN : ACCENT_ORANGE }}>
                        Status: {isItemCompleted(lesson.id) ? <><CompletedIcon /> Concluído</> : 'Pendente'}
                      </p>
                      <button
                        onClick={() => handleCompleteItem(lesson.id, lesson.xp)}
                        disabled={isItemCompleted(lesson.id)}
                        className={`w-full py-2 rounded-3xl font-semibold ${
                          isItemCompleted(lesson.id)
                            ? 'bg-[#aee239] bg-opacity-20 text-[#aee239] cursor-not-allowed'
                            : `bg-[${ACCENT_BLUE}] text-white hover:bg-[${ACCENT_CYAN}]`
                        }`}
                      >
                        {isItemCompleted(lesson.id) ? 'Concluído' : 'Iniciar Aula'}
                      </button>

                      <div className="mt-4 pt-3 border-t border-gray-700">
                        <p className="font-medium mb-2">Atividades:</p>
                        <ul className="space-y-2">
                          {lesson.activities.map(activity => (
                            <li key={activity.id} className="flex justify-between items-center text-sm">
                              <span className="flex items-center gap-1">
                                <ActivityIcon /> {activity.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <span style={{ color: ACCENT_YELLOW_GREEN }}>{activity.xp} XP</span> <XPIcon />
                                {isItemCompleted(activity.id) ? (
                                  <CompletedIcon />
                                ) : (
                                  <button
                                    onClick={() => handleCompleteItem(activity.id, activity.xp)}
                                    className="ml-2 text-xs px-2 py-1 rounded-full hover:bg-[#00a8c6] hover:bg-opacity-20"
                                    style={{ color: ACCENT_BLUE }}
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
                <p className="text-center py-4 text-gray-400">Complete as trilhas anteriores para desbloquear!</p>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default LearningTrailsPage;