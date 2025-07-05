// src/components/finances/HistoryMonthSelectorModal.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { generateFinancialReport } from "../../config/geminiConfig";
// Removido: import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#FFBB28",
  "#FF8042",
  "#0088FE",
  "#00C49F",
  "#a4de6c",
  "#d0ed57",
];

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className="flex-grow overflow-y-auto"
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function HistoryMonthSelectorModal({
  transactions,
  onClose,
  userData,
  userId,
  db,
}) {
  const [tabValue, setTabValue] = useState(0);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportError, setReportError] = useState(null);

  // Removido: const theme = useTheme();
  // Removido: const isDarkMode = theme.palette.mode === "dark";

  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setAvailableMonths([]);
      return;
    }
    const months = [
      ...new Set(transactions.map((t) => t.date.substring(0, 7))),
    ];
    months.sort((a, b) => b.localeCompare(a));
    setAvailableMonths(months);
    const currentMonth = new Date().toISOString().substring(0, 7);
    const index = months.indexOf(currentMonth);
    setTabValue(index !== -1 ? index : 0);
  }, [transactions]);

  useEffect(() => {
    const fetchReport = async () => {
      setReportData(null);
      setReportError(null);
      const currentMonthYear = availableMonths[tabValue];
      if (!currentMonthYear || !userId || !db) return;
      setLoadingReport(true);
      try {
        const reportRef = doc(db, `users/${userId}/reports`, currentMonthYear);
        const docSnap = await getDoc(reportRef);
        if (docSnap.exists()) {
          setReportData(docSnap.data().content);
        } else {
          setReportData(null);
        }
      } catch (error) {
        console.error("Erro ao buscar relatório:", error);
        setReportError("Erro ao carregar relatório salvo.");
      } finally {
        setLoadingReport(false);
      }
    };
    fetchReport();
  }, [tabValue, availableMonths, userId, db]);

  const handleChange = (event, newValue) => setTabValue(newValue);

  const getTransactionsForMonth = (monthYear) =>
    transactions.filter((t) => t.date.startsWith(monthYear));

  const handleGenerateReport = async () => {
    if (loadingReport || !userId || !db) return;
    const currentMonthYear = availableMonths[tabValue];
    if (!currentMonthYear) return;
    setLoadingReport(true);
    setReportError(null);
    setReportData(null);
    try {
      const monthTransactions = getTransactionsForMonth(currentMonthYear);
      if (monthTransactions.length === 0) {
        setReportError("Nenhuma transação encontrada para gerar o relatório.");
        return;
      }
      const report = await generateFinancialReport(
        monthTransactions,
        userData,
        currentMonthYear
      );
      if (report.error) {
        setReportError(report.error);
        return;
      }
      setReportData(report);
      const reportRef = doc(db, `users/${userId}/reports`, currentMonthYear);
      await setDoc(reportRef, {
        monthYear: currentMonthYear,
        generatedAt: new Date(),
        content: report,
      });
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setReportError("Erro ao gerar relatório.");
    } finally {
      setLoadingReport(false);
    }
  };

  const getChartDataFromTopExpenses = (topExpenses) => {
    if (!topExpenses || typeof topExpenses !== "object") return [];
    const totals = {};
    Object.keys(topExpenses).forEach((category) => {
      const valueString = topExpenses[category];
      const match = valueString.match(/R\$ ([\d.,]+)/);
      const amount = match
        ? parseFloat(match[1].replace(".", "").replace(",", "."))
        : 0;
      totals[category] = (totals[category] || 0) + amount;
    });
    const total = Object.values(totals).reduce((sum, val) => sum + val, 0);
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      percent: total > 0 ? value / total : 0,
    }));
  };

  return (
    <div className="fixed inset-0 bg-[url('https://i.pinimg.com/736x/dc/6c/f6/dc6cf63e17c534092ec5294dae19c66f.jpg')] bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-lg shadow-xl w-full max-w-2xl h-full flex flex-col text-gray-100">
        <div className="p-2 border-b border-gray-700 flex justify-center items-center">
          <button
            onClick={onClose}
            aria-label="Fechar"
            sx={{ color: "gray.400", "&:hover": { color: "gray.100" } }}
            className="absolute top-2 left-2"
          >
            <ArrowBackIcon />
          </button>
          <h2 className="text-xl font-semibold">Históricos</h2>
        </div>

        <Box sx={{ borderBottom: 1, borderColor: "gray.700" }}>
          <Tabs
            value={tabValue}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="tabs"
            TabIndicatorProps={{
              sx: { backgroundColor: "#3B82F6" },
            }}
          >
            {availableMonths.map((m, i) => (
              <Tab
                key={m}
                label={new Date(m + "-01").toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
                {...a11yProps(i)}
                sx={{
                  color: "#ffffff", 
                  "&.Mui-selected": {
                    color: "#3B82F6", 
                  },
                  "&:hover": {
                    color: "gray.200", 
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Conteúdo das Abas */}
        <div className="overflow-y-auto flex-grow">
          {availableMonths.map((monthYear, i) => (
            <CustomTabPanel key={monthYear} value={tabValue} index={i}>
              <div>
                {loadingReport ? (
                  <div className="flex items-center justify-center py-4">
                    <CircularProgress size={24} sx={{ color: "#3B82F6" }} />
                    <Typography sx={{ ml: 2, color: "#3B82F6" }}>
                      Gerando relatório...
                    </Typography>
                  </div>
                ) : reportError ? (
                  <Typography
                    color="error"
                    sx={{ color: "#EF4444" }}
                    className="text-center"
                  >
                    {reportError}
                  </Typography>
                ) : reportData ? (
                  <Accordion
                    sx={{
                      backgroundColor: "#1F2937", // Fundo do acordeão no dark mode
                      color: "#F9FAFB", // Cor do texto do acordeão no dark mode
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ArrowDropDownIcon sx={{ color: "gray.300" }} />
                      }
                      sx={{
                        backgroundColor: "#1F2937", // Fundo do sumário do acordeão no dark mode
                        color: "#F9FAFB", // Cor do texto do sumário no dark mode
                        "&:hover": {
                          backgroundColor: "#374151", // Cor de hover do sumário no dark mode
                        },
                      }}
                    >
                      <Typography variant="h6" sx={{ color: "#F9FAFB" }}>
                        Resumo do Relatório
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        borderTop: 1,
                        borderColor: "gray.700", // Borda superior do detalhe no dark mode
                        backgroundColor: "#1F2937", // Fundo do detalhe no dark mode
                        color: "#E5E7EB", // Cor do texto do detalhe no dark mode
                      }}
                      className="space-y-2"
                    >
                      <Typography sx={{ color: "#E5E7EB" }}>
                        <strong sx={{ color: "#F9FAFB" }}>
                          Análise Geral:
                        </strong>{" "}
                        {reportData.overallAnalysis}
                      </Typography>
                      <Typography sx={{ color: "#E5E7EB" }}>
                        <strong sx={{ color: "#F9FAFB" }}>
                          Padrões de Gasto:
                        </strong>{" "}
                        {reportData.spendingPatterns}
                      </Typography>
                      <Typography sx={{ color: "#E5E7EB" }}>
                        <strong sx={{ color: "#F9FAFB" }}>Dicas:</strong>{" "}
                        {reportData.actionableInsights}
                      </Typography>

                      {reportData.topExpenses && (
                        <>
                          <Typography
                            variant="h6"
                            className="mt-4"
                            sx={{ color: "#F9FAFB" }}
                          >
                            Distribuição de Gastos
                          </Typography>
                          <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={getChartDataFromTopExpenses(
                                    reportData.topExpenses
                                  )}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  dataKey="value"
                                  label={({ name, percent }) =>
                                    `${name} ${(percent * 100).toFixed(0)}%`
                                  }
                                  labelLine={false}
                                >
                                  {getChartDataFromTopExpenses(
                                    reportData.topExpenses
                                  ).map((_, i) => (
                                    <Cell
                                      key={`cell-${i}`}
                                      fill={COLORS[i % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#374151",
                                    borderColor: "#4B5563",
                                    color: "#F3F4F6",
                                  }}
                                  itemStyle={{ color: "#F3F4F6" }}
                                />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleGenerateReport}
                    sx={{
                      backgroundColor: "#3B82F6",
                      "&:hover": { backgroundColor: "#2563EB" },
                    }}
                    className="w-full text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                  >
                    Gerar Relatório com IA
                  </Button>
                )}
              </div>

              <div className="">
                <h3 className="text-lg font-semibold mb-3 mt-3 text-gray-100">
                  Movimentações Detalhadas
                </h3>
                {getTransactionsForMonth(monthYear).length > 0 ? (
                  <ul className="space-y-3">
                    {getTransactionsForMonth(monthYear).map((t) => (
                      <li
                        key={t.id}
                        className="flex justify-between items-center bg-gray-800 p-3 rounded-md shadow-sm"
                      >
                        <div>
                          <p className="font-semibold text-gray-100 text-sm">
                            {t.description}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(t.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <p
                          className={`font-bold ${
                            t.type === "expense"
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {t.type === "expense" ? "-" : "+"}
                          {parseFloat(t.amount).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-400 py-4">
                    Nenhuma movimentação registrada neste mês.
                  </p>
                )}
              </div>
            </CustomTabPanel>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HistoryMonthSelectorModal;
