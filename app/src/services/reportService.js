// src/services/reportService.js

/**
 * Gera o prompt para o Gemini criar um relatório financeiro.
 * @param {Array<Object>} transactions Lista de transações do usuário.
 * @param {Object} userData Dados do perfil do usuário.
 * @param {string} monthYear Mês e ano no formato 'YYYY-MM'.
 * @returns {string} O prompt formatado para o Gemini.
 */
export function generateFinancialReportPrompt(transactions, userData, monthYear) {
  const simplifiedTransactions = transactions.map(t => ({
    description: t.description,
    amount: parseFloat(t.amount),
    type: t.type,
    date: t.date,
    category: t.category
  }));

  // Calculate total expenses for percentage breakdown
  const totalExpenses = simplifiedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate expense breakdown by percentage
  const expenseCategories = simplifiedTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const expenseBreakdownPercentages = {};
  for (const category in expenseCategories) {
    if (expenseCategories.hasOwnProperty(category)) {
      const percentage = (expenseCategories[category] / totalExpenses) * 100;
      expenseBreakdownPercentages[category] = parseFloat(percentage.toFixed(2)); // Round to 2 decimal places
    }
  }

  // Sort expense breakdown by percentage (descending) and get top 3
  const sortedExpenseBreakdown = Object.entries(expenseBreakdownPercentages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  const userContext = {
    currentBalance: userData?.currentBalance,
    financialSituation: userData?.financialSituation,
    learningTopic: userData?.learningTopic?.join(', '),
    monthlyIncome: userData?.monthlyIncome,
    objective: userData?.objective?.join(', '),
    occupation: userData?.occupation,
    personalDescription: userData?.personalDescription,
    trackingFrequency: userData?.trackingFrequency,
  };

  return `
  Você é um assistente financeiro inteligente e **altamente empático**. Seu objetivo é fornecer um relatório financeiro mensal (para ${monthYear}) que seja **extremamente claro, motivador e acionável**, ajudando o usuário a compreender profundamente seu comportamento financeiro e a tomar melhores decisões. O relatório deve ser objetivo, conciso e **em FORMATO JSON**.

  O relatório deve conter as seguintes chaves, com foco em personalização e tom de voz positivo:

  - 'overallAnalysis': Uma string que fornece uma análise geral do mês. Vá além de apenas números. Comente sobre o saldo final em relação às expectativas (se houver), à renda, e aos objetivos do usuário. Use uma linguagem que reconheça o esforço ou as dificuldades. Ex: "Seu mês de [Mês] mostrou um saldo positivo de R$X. Considerando seu objetivo de [Objetivo], este é um bom progresso, embora haja espaço para otimização em [Área]."
  - 'topExpenses': Um objeto JSON com as 2-3 principais categorias de gastos e seus totais numéricos (ex: {"Alimentação": 500.00, "Lazer": 200.00}) E suas respectivas porcentagens sobre o total de despesas. Ex: {"Alimentação": "R$ 500.00 (25%)", "Lazer": "R$ 200.00 (10%)"}. Estas são as áreas onde o dinheiro do usuário está mais concentrado.
  - 'spendingPatterns': Uma string com observações sobre padrões de gasto ou destaques que o usuário possa não ter notado. Pense em hábitos (muitas compras por impulso, gastos concentrados em dias específicos, etc.) e como eles afetam a saúde financeira e os objetivos do usuário. Relacione os padrões identificados com as topExpenses. Ex: "Notamos um aumento nos gastos com [Categoria] nos finais de semana, o que pode estar impactando seu saldo final."
  - 'actionableInsights': Uma string com 1-2 dicas financeiras **altamente personalizadas, práticas e encorajadoras**. Estas recomendações DEVERÃO considerar profundamente a 'situação financeira' do usuário, seus 'objetivos' e 'tópicos de aprendizado'. As recomendações NÃO DEVEM sugerir o uso de planilhas, aplicativos externos ou ferramentas de orçamento. Elas devem focar em AÇÕES ou MUDANÇAS DE HÁBITO que o usuário pode implementar diretamente com base em SEUS PRÓPRIOS DADOS e contexto. Mantenha o foco em comportamentos e decisões diárias. Ex: "Para avançar em seu objetivo de [Objetivo], tente [Ação específica, ex: planejar suas refeições para reduzir gastos com delivery, ou revisar assinaturas desnecessárias em Lazer]."

  A resposta DEVE ser APENAS o objeto JSON, puro e sem qualquer texto adicional antes ou depois. Mantenha os textos de cada chave curtos e diretos para otimização de armazenamento (Firestore free plan limit).

  **Dados do Usuário para Contexto (Use estas informações para personalizar o relatório):**
  - Saldo Atual: R$${userContext.currentBalance || 'Não informado'}
  - Situação Financeira: ${userContext.financialSituation || 'Não informada'}
  - Interesse em Aprender: ${userContext.learningTopic || 'Nenhum'}
  - Renda Mensal: R$${userContext.monthlyIncome || 'Não informada'}
  - Objetivos Financeiros: ${userContext.objective || 'Nenhum'}
  - Ocupação: ${userContext.occupation || 'Não informada'}
  - Frequência de Rastreamento: ${userContext.trackingFrequency || 'Não informada'}
  - Descrição Pessoal: "${userContext.personalDescription || 'Não informada'}"

  **Transações do Mês (${monthYear}):**
  ${JSON.stringify(simplifiedTransactions, null, 2)}
  `;
}