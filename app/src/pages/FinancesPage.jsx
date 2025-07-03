// src/pages/FinancesPage.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseconfig'; 

// Imports for Recharts components needed for the chart
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Importa o novo componente ScannerModal
import ScannerModal from '../components/finances/ScannerModal'; 

// Example Icons
const BalanceIcon = () => <span className="text-xl">💵</span>;
const GoalsIcon = () => <span className="text-xl">🎯</span>;
const ChartIcon = () => <span className="text-xl">📊</span>;
const HistoryIcon = () => <span className="text-xl">📜</span>;
const ProgressIcon = () => <span className="text-xl">📈</span>;
const ScannerIcon = () => <span className="text-xl">📸</span>;

// Colors for the pie chart (you can customize)
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function FinancesPage() {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]); 
  const [goals, setGoals] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); 
  const [isScannerOpen, setIsScannerOpen] = useState(false); 
  const [scanMessage, setScanMessage] = useState(''); 

  // Effect to set up the authentication state listener
  useEffect(() => {
    if (!auth) {
      setError("Firebase Auth is not available. Check Firebase configuration in '../config/firebaseconfig.js'.");
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
        setGoals([]);
      }
      setIsAuthReady(true); 
      setLoading(false); 
    });
    return () => unsubscribeAuth();
  }, []);

  // Effect to fetch user profile and goals data, depending on userId and db
  useEffect(() => {
    if (isAuthReady && userId && db) {
      // Listener for user profile
      const userProfileRef = doc(db, `users/${userId}/user_profiles/profile`);
      const unsubscribeProfile = onSnapshot(userProfileRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setGoals(Array.isArray(data.objective) ? data.objective : []); 
        } else {
          setUserData(null);
          setGoals([]);
          console.log("No profile document found.");
        }
      }, (err) => {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile.");
      });

      // Listener for transactions
      const transactionsColRef = collection(db, `users/${userId}/transactions`);
      const q = query(transactionsColRef, orderBy('date', 'desc'));
      const unsubscribeTransactions = onSnapshot(q, (snapshot) => {
        const fetchedTransactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate ? doc.data().date.toDate().toISOString().split('T')[0] : (doc.data().date || new Date().toISOString().split('T')[0])
        }));
        setTransactions(fetchedTransactions);
      }, (err) => {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions.");
      });

      return () => {
        unsubscribeProfile();
        unsubscribeTransactions();
      };
    } else if (isAuthReady && !userId) {
      setLoading(false);
    }
  }, [userId, db, isAuthReady]);

  // --- Helper Functions for Financial Data Calculation ---
  // Calculates the overall balance based on initial balance and all historical transactions (income and expenses).
  const calculateBalance = () => {
    const initialBalance = parseFloat(userData?.currentBalance || 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    return (initialBalance + totalIncome - totalExpenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Calculates total expenses for the current month.
  const getMonthlyExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const expensesThisMonth = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    return expensesThisMonth;
  };

  // Retrieves the monthly budget from user data, or defaults to 0 if not set.
  // This value should ideally be set by the user in their profile.
  const getMonthlyBudget = () => {
    return parseFloat(userData?.monthlyBudget || 0); // Prioriza 'monthlyBudget' do userData
  };

  // Function to get expense data for the chart, now including ALL historical expenses
  const getExpenseDataForChart = () => {
    const allExpenses = transactions.filter(t => t.type === 'expense');

    const categories = {};
    allExpenses.forEach(t => {
      const categoryName = t.category ? String(t.category) : 'Outros'; 
      categories[categoryName] = (categories[categoryName] || 0) + parseFloat(t.amount || 0);
    });

    console.log("Expense data for chart (all historical):", categories);

    const chartData = Object.keys(categories)
      .map(category => ({
        name: category,
        value: categories[category],
      }))
      .filter(entry => entry.value > 0); 

    if (chartData.length === 0 && Object.keys(categories).length > 0) {
      return [{ name: 'Outros', value: 0 }];
    }

    return chartData;
  };

  // Added for debugging: logs the transaction state whenever it changes
  useEffect(() => {
    console.log("Current transaction state:", transactions);
    if (transactions.length === 0) {
      console.log("No transactions loaded. Check your 'transactions' collection in Firestore.");
    } else {
      const currentMonthExpenses = transactions.filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate.getMonth() === new Date().getMonth() && tDate.getFullYear() === new Date().getFullYear();
      });
      if (currentMonthExpenses.length === 0) {
        console.log("No expenses for the current month. The chart might not appear if it's filtered by month.");
      }
    }
  }, [transactions]);

  // Function to handle successful scan from ScannerModal
  const handleScanSuccess = (parsedData) => {
    setIsScannerOpen(false); 
    setScanMessage(`Importação concluída: ${parsedData.length} itens adicionados.`);
  };

  // --- Conditional Rendering ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Carregando suas finanças...</p>
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

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Gerenciamento de Finanças</h1>

      {/* Botão para abrir o scanner */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => {
            setIsScannerOpen(true);
            setScanMessage(''); 
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition duration-300 ease-in-out transform hover:scale-105"
        >
          <ScannerIcon /> Escanear Boleto/Fatura
        </button>
      </div>

      {scanMessage && ( 
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p className="font-bold">Sucesso!</p>
          <p>{scanMessage}</p>
        </div>
      )}

      {/* Current Balance */}
      <section className="bg-white p-6 rounded-lg shadow-xl mb-8 border border-gray-200 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <BalanceIcon /> Saldo Atual:
        </h2>
        <p className="text-3xl font-bold text-green-600">{calculateBalance()}</p>
      </section>

      {/* Financial Goals/Objectives */}
      <section className="bg-white p-6 rounded-lg shadow-xl mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <GoalsIcon /> Suas Metas/Objetivos
        </h2>
        {goals.length > 0 ? (
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            {goals.map((goal, index) => (
              <li key={index} className="text-lg">{goal}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Nenhuma meta definida ainda. Vá para o perfil para definir suas metas!</p>
        )}
      </section>

      {/* Pie Chart of Expenses (Recharts) */}
      <section className="bg-white p-6 rounded-lg shadow-xl mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <ChartIcon /> Despesas Totais (Gráfico)
        </h2>
        {getExpenseDataForChart().length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getExpenseDataForChart()}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent, value }) => value > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''} 
              >
                {getExpenseDataForChart().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-600 text-center">Nenhuma despesa registrada para o gráfico.</p>
        )}
      </section>

      {/* Monthly Spending Progress Bar */}
      <section className="bg-white p-6 rounded-lg shadow-xl mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <ProgressIcon /> Gastos do Mês
        </h2>
        <div className="text-center mb-4">
          <p className="text-xl font-bold text-gray-800">
            {getMonthlyExpenses().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {getMonthlyBudget().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-sm text-gray-600">Gastos atuais vs. Orçamento mensal</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-red-500 h-4 rounded-full"
            style={{ width: `${Math.min(100, (getMonthlyExpenses() / Math.max(1, getMonthlyBudget())) * 100)}%` }}
          ></div>
        </div>
        {getMonthlyBudget() > 0 && getMonthlyExpenses() > getMonthlyBudget() && (
          <p className="text-red-600 text-sm mt-2 text-center font-semibold">Você excedeu seu orçamento este mês!</p>
        )}
        {getMonthlyBudget() <= 0 && (
          <p className="text-orange-500 text-sm mt-2 text-center">Defina um orçamento mensal em seu perfil para acompanhar seus gastos!</p>
        )}
      </section>

      {/* Monthly Transaction History */}
      <section className="bg-white p-6 rounded-lg shadow-xl mb-8 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <HistoryIcon /> Histórico de Movimentações
        </h2>
        {transactions.length > 0 ? (
          <ul className="space-y-3">
            {transactions.map(t => (
              <li key={t.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-semibold text-gray-800">{t.description}</p>
                  <p className="text-sm text-gray-500">{t.category} - {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <p className={`font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                  {t.type === 'expense' ? '-' : '+'}{parseFloat(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-center">Nenhuma movimentação registrada ainda.</p>
        )}
      </section>

      {/* Scanner Modal */}
      {isScannerOpen && (
        <ScannerModal
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleScanSuccess} 
          userId={userId}
          db={db}
        />
      )}
    </div>
  );
}

export default FinancesPage;