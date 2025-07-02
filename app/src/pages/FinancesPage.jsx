// src/pages/FinancesPage.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore'; // Adicionado addDoc
// Imports for auth and db instances from your Firebase configuration file.
// The path is relative: '..' goes up one level (from 'pages' to 'src'), then enters 'config'.
import { auth, db } from '../config/firebaseconfig'; 

// Imports for Recharts components needed for the chart
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Importa o novo componente ScannerModal
import ScannerModal from '../components/finances/ScannerModal'; // Ajuste o caminho conforme a estrutura da sua pasta

// Example Icons
const BalanceIcon = () => <span className="text-xl">💵</span>;
const GoalsIcon = () => <span className="text-xl">🎯</span>;
const ChartIcon = () => <span className="text-xl">📊</span>;
const HistoryIcon = () => <span className="text-xl">📜</span>;
const ProgressIcon = () => <span className="text-xl">📈</span>;
const ScannerIcon = () => <span className="text-xl">📸</span>; // Novo ícone para o scanner

// Colors for the pie chart (you can customize)
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function FinancesPage() {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]); // Transaction history
  const [goals, setGoals] = useState([]); // User goals
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // State to control authentication readiness
  const [isScannerOpen, setIsScannerOpen] = useState(false); // Estado para controlar a visibilidade do modal do scanner

  // Effect to set up the authentication state listener
  useEffect(() => {
    // Checks if 'auth' was imported correctly before attempting to use it
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
      setIsAuthReady(true); // Marks authentication as ready after the first check
      setLoading(false); // Sets loading to false after initial authentication
    });
    return () => unsubscribeAuth();
  }, []); // Runs only once on component mount

  // Effect to fetch user profile and goals data, depending on userId and db
  useEffect(() => {
    // Only attempts to fetch data if authentication is ready, there's a userId, and db is available
    if (isAuthReady && userId && db) {
      // Listener for user profile
      const userProfileRef = doc(db, `users/${userId}/user_profiles/profile`);
      const unsubscribeProfile = onSnapshot(userProfileRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          // Ensures 'objective' is an array or handles cases where it's undefined/null
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
          // Converts Timestamp to date string. Ensures 'date' is a valid string.
          // If doc.data().date is a Timestamp, convert to Date and then to ISO string.
          // Otherwise, use the existing value or current date as fallback.
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
      // If authentication is ready but no userId (unlogged/anonymous user),
      // ensures loading is false and doesn't display Firestore not configured error.
      setLoading(false);
    }
  }, [userId, db, isAuthReady]); // Depends on userId, db, and isAuthReady

  // --- Helper Functions for Financial Data Calculation ---
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

  const getMonthlyBudget = () => {
    const monthlyIncome = parseFloat(userData?.monthlyIncome || 0);
    // Example budget: 70% of monthly income. You can adjust this logic.
    return monthlyIncome * 0.7;
  };

  // Function to get expense data for the chart, now including ALL historical expenses
  const getExpenseDataForChart = () => {
    // Filter only expense transactions
    const allExpenses = transactions.filter(t => t.type === 'expense');

    const categories = {};
    allExpenses.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + parseFloat(t.amount || 0);
    });

    // Log the data that will be used in the chart for debugging
    console.log("Expense data for chart (all historical):", categories);

    return Object.keys(categories).map(category => ({
      name: category,
      value: categories[category],
    }));
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

  // Função para adicionar uma nova transação (chamada pelo scanner)
  const handleScannedData = async (scannedText) => {
    setIsScannerOpen(false); // Fecha o modal do scanner
    if (!userId) {
      setError("Usuário não autenticado. Não é possível adicionar transação.");
      return;
    }

    try {
      // Tenta parsear o texto escaneado como JSON.
      // Em um cenário real, você teria uma lógica de parsing mais robusta
      // para boletos, faturas, etc.
      let transactionData = {
        description: "Transação Escaneada",
        amount: 0,
        type: "expense", // Assume despesa por padrão, ajuste conforme a lógica de parsing
        category: "Outros", // Categoria padrão, ajuste conforme a lógica de parsing
        date: new Date().toISOString().split('T')[0], // Data atual
      };

      try {
        const parsedData = JSON.parse(scannedText);
        // Exemplo de como você pode mapear dados de um JSON escaneado
        if (parsedData.description) transactionData.description = parsedData.description;
        if (parsedData.amount) transactionData.amount = parseFloat(parsedData.amount);
        if (parsedData.type) transactionData.type = parsedData.type;
        if (parsedData.category) transactionData.category = parsedData.category;
        if (parsedData.date) transactionData.date = parsedData.date;
      } catch (jsonError) {
        console.warn("Texto escaneado não é um JSON válido, usando valores padrão:", scannedText);
        transactionData.description = `Dados Escaneados: ${scannedText.substring(0, 50)}...`;
        // Você pode adicionar uma lógica para tentar extrair valores de texto simples aqui
      }

      const transactionsColRef = collection(db, `users/${userId}/transactions`);
      await addDoc(transactionsColRef, transactionData);
      console.log("Transação adicionada com sucesso!");
    } catch (err) {
      console.error("Erro ao adicionar transação escaneada:", err);
      setError("Falha ao adicionar transação escaneada.");
    }
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
          onClick={() => setIsScannerOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition duration-300 ease-in-out transform hover:scale-105"
        >
          <ScannerIcon /> Escanear Boleto/Fatura
        </button>
      </div>

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
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            style={{ width: `${Math.min(100, (getMonthlyExpenses() / getMonthlyBudget()) * 100)}%` }}
          ></div>
        </div>
        {getMonthlyExpenses() > getMonthlyBudget() && (
          <p className="text-red-600 text-sm mt-2 text-center font-semibold">Você excedeu seu orçamento este mês!</p>
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
          onScanSuccess={handleScannedData}
          userId={userId} // Passa o userId para o modal
          db={db} // Passa a instância do db para o modal
        />
      )}
    </div>
  );
}

export default FinancesPage;
