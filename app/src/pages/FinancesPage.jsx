import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  collection,
  query,
  onSnapshot,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../config/firebaseconfig";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import ScannerModal from "../components/finances/ScannerModal";
import HistoryMonthSelectorModal from "../components/finances/HistoryMonthSelectorModal";
import Loading from "../components/loading/loading"; // Importa o componente de loading

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PieChartIcon from "@mui/icons-material/PieChart";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"; // Para receitas
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"; // Para despesas


// Cores para o gráfico de pizza (ajustadas para o novo tema escuro)
const COLORS = ["#00a8c6", "#40c0cb", "#aee239", "#8fbe00", "#FF8042"]; // Usando as cores fornecidas

function FinancesPage() {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  // Mock de dados de metas para demonstrar a nova estrutura
  const [goals, setGoals] = useState([
    {
      id: "1",
      name: "Viagem dos Sonhos",
      description: "Juntar grana para a viagem de férias para Maceió!",
      currentAmount: 1500,
      targetAmount: 5000,
    },
    {
      id: "2",
      name: "Carro Novo",
      description: "Economizar pra dar entrada no possante.",
      currentAmount: 8000,
      targetAmount: 25000,
    },
    {
      id: "3",
      name: "Reserva de Emergência",
      description: "Construir um colchão de segurança.",
      currentAmount: 3000,
      targetAmount: 10000,
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  useEffect(() => {
    if (!auth) {
      setError(
        "Firebase Auth is not available. Check Firebase configuration in '../config/firebaseconfig.js'."
      );
      setLoading(false);
      setIsAuthReady(true);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setUserData(null);
        setTransactions([]);
        setGoals([]); // Resetar metas no logout
      }
      setIsAuthReady(true);
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (isAuthReady && userId && db) {
      const userProfileRef = doc(db, `users/${userId}/user_profiles/profile`);

      const unsubscribeProfile = onSnapshot(
        userProfileRef,
        async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            // Manter o mock de metas por enquanto, pois a estrutura de Firebase não foi alterada para objetos de meta
            // setGoals(Array.isArray(data.objective) ? data.objective : []);

            if (data.currentBalance !== undefined && !data.balanceSetDate) {
              const today = new Date().toISOString().split("T")[0];
              await setDoc(
                userProfileRef,
                { balanceSetDate: today },
                { merge: true }
              );
              setUserData((prevData) => ({
                ...prevData,
                balanceSetDate: today,
              }));
            }
          } else {
            setUserData(null);
            // setGoals([]); // Resetar metas se não houver perfil
          }
        },
        (err) => {
          console.error("Error fetching profile:", err);
          setError("Failed to load profile.");
        }
      );

      const transactionsColRef = collection(db, `users/${userId}/transactions`);
      // Removido orderBy para evitar problemas de índice no Firestore, ordenar em memória
      const q = query(transactionsColRef);
      const unsubscribeTransactions = onSnapshot(
        q,
        (snapshot) => {
          const fetchedTransactions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            // Garante que a data seja uma string no formato YYYY-MM-DD
            date: doc.data().date?.toDate
              ? doc.data().date.toDate().toISOString().split("T")[0]
              : doc.data().date || new Date().toISOString().split("T")[0],
          }));
          // Ordena as transações por data em ordem decrescente em memória
          fetchedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
          setTransactions(fetchedTransactions);
        },
        (err) => {
          console.error("Error fetching transactions:", err);
          setError("Failed to load transactions.");
        }
      );

      return () => {
        unsubscribeProfile();
        unsubscribeTransactions();
      };
    } else if (isAuthReady && !userId) {
      setLoading(false);
    }
  }, [userId, db, isAuthReady]);

  // Função para calcular o saldo total (diretamente do DB)
  const calculateOverallBalance = () => {
    const balance = parseFloat(userData?.currentBalance || 0);
    return balance.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Nova função para calcular receitas e despesas do mês atual
  const getMonthlySummary = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    transactions.forEach((t) => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        const amount = parseFloat(t.amount || 0);
        if (t.type === "income") {
          monthlyIncome += amount;
        } else if (t.type === "expense") {
          monthlyExpenses += amount;
        }
      }
    });

    return {
      income: monthlyIncome.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      expenses: monthlyExpenses.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    };
  };


  const getMonthlyBudget = () => {
    return parseFloat(userData?.monthlyBudget || 0);
  };

  const getExpenseDataForChart = () => {
    const allExpenses = transactions.filter((t) => t.type === "expense");

    const categories = {};
    allExpenses.forEach((t) => {
      const categoryName = t.category ? String(t.category) : "Outros";
      categories[categoryName] =
        (categories[categoryName] || 0) + parseFloat(t.amount || 0);
    });

    const chartData = Object.keys(categories)
      .map((category) => ({
        name: category,
        value: parseFloat(categories[category].toFixed(2)),
      }))
      .filter((entry) => entry.value > 0);

    if (chartData.length === 0 && Object.keys(categories).length > 0) {
      return [{ name: "Outros", value: 0 }];
    }

    return chartData;
  };

  const getFilteredTransactions = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    // Formato 'YYYY-MM' para comparação
    const currentMonthYear = `${currentYear}-${(currentMonth + 1)
      .toString()
      .padStart(2, "0")}`;

    if (selectedHistoryMonth) {
      const filtered = transactions.filter((t) => {
        const tDate = new Date(t.date);
        const transactionMonthYear = `${tDate.getFullYear()}-${(
          tDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}`;
        return transactionMonthYear === selectedHistoryMonth;
      });
      return filtered;
    } else {
      // Filtra transações do mês atual para exibição
      const filtered = transactions.filter((t) => {
        const tDate = new Date(t.date);
        const isCurrentMonth =
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear;
        return isCurrentMonth;
      });
      return filtered;
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      const testDate = new Date(transactions[0].date);
    }
  }, [transactions]);

  const handleScanSuccess = (parsedData) => {
    setIsScannerOpen(false);
    setScanMessage(
      `Importação concluída: ${parsedData.length} itens adicionados.`
    );
  };

  const overallBalance = calculateOverallBalance(); // Saldo total do DB
  const monthlySummary = getMonthlySummary(); // Resumo de receitas e despesas do mês atual

  if (loading) {
    return (
      <Loading/>
    );
  }


  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#191919] text-[#EF4444]">
        <p className="text-lg">Erro: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[url('https://i.pinimg.com/736x/09/8e/15/098e15db6e93a2fe19d7ddcc5ee9beee.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="container mx-auto p-3 md:p-8 backdrop-blur-2xl bg-black/70  min-h-screen text-[#f9f2e7]">
        <header className="flex justify-between items-center mb-8 pt-4">
          <h1 className="text-2xl font-bold text-center flex-grow text-[#f9f2e7]">
            Finanças
          </h1>
          <button
            onClick={() => {
              setIsScannerOpen(true);
              setScanMessage("");
            }}
            className="bg-[#00a8c6] hover:bg-[#40c0cb] text-[#f9f2e7] absolute right-4 font-bold p-2 rounded-full flex items-center justify-center transition duration-300 ease-in-out transform hover:scale-105"
            aria-label="Escanear Boleto/Fatura"
          >
            <QrCodeScannerIcon sx={{ fontSize: 24 }} />
          </button>
        </header>

        <section className="backdrop-blur-lg rounded-lg mb-8">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col items-start backdrop-blur-lg rounded-lg">
              <div className="bg-[#00a8c6]/10 backdrop-blur-lg p-2 rounded-lg w-full">
                <h3 className="text-lg font-medium text-[#f9f2e7] flex items-center gap-2 mb-2">
                  <AccountBalanceWalletIcon
                    sx={{ color: "#00a8c6", fontSize: 20 }}
                  />
                  Saldo na Mão:
                </h3>
                <p className="text-3xl font-bold text-[#aee239] mb-4">
                  {overallBalance}
                </p>

                <div className="w-full flex justify-between items-center text-base">
                  <div className="flex items-center gap-1 text-[#aee239]">
                    <ArrowUpwardIcon sx={{ fontSize: 18 }} />
                    <span>Receitas: {monthlySummary.income}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#FF8042]">
                    <ArrowDownwardIcon sx={{ fontSize: 18 }} />
                    <span>Despesas: {monthlySummary.expenses}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-opacity-70 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#f9f2e7] flex items-center gap-2">
            <EmojiEventsIcon sx={{ color: "#00a8c6", fontSize: 20 }} /> Suas
            metas
          </h2>
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const progress = Math.min(
                  100,
                  (goal.currentAmount / goal.targetAmount) * 100 || 0
                );
                const radius = 40;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (progress / 100) * circumference;

                return (
                  <div
                    key={goal.id}
                    className="flex items-center gap-4  p-4 rounded-lg border border-gray-800"
                  >
                    {/* Barra de progresso circular */}
                    <div className="max-w-12 max-h-24">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-gray-700"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r={radius}
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className="text-[#aee239]"
                          strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r={radius}
                          cx="50"
                          cy="50"
                          transform="rotate(-90 50 50)"
                        />
                        <text
                          x="50"
                          y="50"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-lg font-bold text-[#f9f2e7]"
                          fill="#f9f2e7"
                        >
                          {`${progress.toFixed(0)}%`}
                        </text>
                      </svg>
                    </div>

                    {/* Título e descrição */}
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-[#f9f2e7]">
                        {goal.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-base">
              Nenhuma meta de grana definida ainda. Bora planejar!
            </p>
          )}
        </section>

        {/* Seção de Despesas por Categoria (Gráfico) */}
        <section className="rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[#f9f2e7] flex items-center gap-2">
            <PieChartIcon sx={{ color: "#00a8c6", fontSize: 20 }} /> Onde sua
            Grana Vai
          </h2>
          {getExpenseDataForChart().length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={getExpenseDataForChart()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent, value }) =>
                    value > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                  }
                >
                  {getExpenseDataForChart().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#191919",
                    borderColor: "#40c0cb",
                    color: "#f9f2e7",
                  }}
                  itemStyle={{ color: "#f9f2e7" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center text-base">
              Nenhuma despesa registrada para o gráfico.
            </p>
          )}
        </section>

        {/* Seção de Histórico de Movimentações Recentes */}
        <section className="rounded-lg mb-12">
          <h2 className="text-xl font-semibold mb-4 text-[#f9f2e7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HistoryIcon sx={{ color: "#00a8c6", fontSize: 20 }} /> Últimas
              Movimentações
            </div>
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="text-[#f9f2e7] font-semibold py-2 px-4 rounded-lg text-sm transition duration-200 ease-in-out"
            >
              Ver Tudo
            </button>
          </h2>
          {getFilteredTransactions().length > 0 ? (
            <ul className="space-y-3">
              {getFilteredTransactions()
                .slice(0, 100) 
                .map(
                  (
                    t 
                  ) => (
                    <li
                      key={t.id}
                      className="flex justify-between items-center p-3 bg-[#191919] bg-opacity-70 backdrop-blur-lg rounded-lg border border-gray-800"
                    >
                      <div>
                        <p className="font-semibold text-[#f9f2e7] text-base">
                          {t.description}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(t.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <p
                        className={`font-bold text-base ${
                          t.type === "expense"
                            ? "text-[#FF8042]"
                            : "text-[#aee239]"
                        }`}
                      >
                        {t.type === "expense" ? "-" : "+"}
                        {parseFloat(t.amount).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </li>
                  )
                )}
            </ul>
          ) : (
            <p className="text-gray-400 text-center text-base">
              Nenhuma movimentação registrada para o mês atual.
            </p>
          )}
        </section>

        {isScannerOpen && (
          <ScannerModal
            onClose={() => setIsScannerOpen(false)}
            onScanSuccess={handleScanSuccess}
            userId={userId}
            db={db}
          />
        )}

        {isHistoryModalOpen && (
          <HistoryMonthSelectorModal
            transactions={transactions}
            onClose={() => setIsHistoryModalOpen(false)}
            userData={userData}
            userId={userId}
            db={db}
          />
        )}
      </div>
    </div>
  );
}

export default FinancesPage;
