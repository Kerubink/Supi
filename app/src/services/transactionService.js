// src/services/geminiService.js

// Define as categorias permitidas para classificação.
// Isso ajuda o Gemini a categorizar os itens de forma mais consistente.
const ALLOWED_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Contas",
  "Serviços",
  "Investimentos",
  "Salário",
  "Presentes",
  "Outros", // Categoria coringa para o que não se encaixa
];

/**
 * Gera o prompt para o Gemini extrair informações de transações.
 * @param {string} ocrText O texto OCR da fatura/extrato.
 * @returns {string} O prompt formatado para o Gemini.
 */
export function generateTransactionExtractionPrompt(ocrText) {
  return `
  Você é um assistente financeiro especializado em extrair e categorizar transações.

  Abaixo está o conteúdo de uma fatura, boleto ou extrato bancário.
  Sua tarefa é extrair as transações listadas e formatá-las como um array JSON de objetos.

  Cada objeto de transação DEVE ter as seguintes chaves:
  - "description": (string) Uma breve descrição do item da transação.
  - "amount": (number) O valor numérico da transação. Use ponto como separador decimal.
  - "type": (string) O tipo de transação. Deve ser "expense" para despesas ou "income" para receitas.
  - "category": (string) A categoria mais apropriada para a transação. Escolha APENAS entre as seguintes categorias permitidas:
    ${ALLOWED_CATEGORIES.map(cat => `- "${cat}"`).join('\n    ')}
    Se uma categoria não se encaixar perfeitamente, use "Outros".
  - "date": (string, opcional) A data da transação no formato "YYYY-MM-DD". Se não for explicitamente mencionada para uma transação específica, omita a chave.

  **Instruções Cruciais:**
  - O retorno deve ser SOMENTE o array JSON puro, sem qualquer texto adicional, explicações, ou formatação além do JSON.
  - Se não houver transações claras para extrair, retorne um array JSON vazio: [].
  - Priorize a precisão dos valores e descrições.

  Texto para análise:
  ${ocrText}

  Exemplo de formato de saída esperado:
  [
    {
      "description": "Pagamento de Aluguel",
      "amount": 1500.00,
      "type": "expense",
      "category": "Moradia",
      "date": "2025-06-28"
    },
    {
      "description": "Supermercado XYZ",
      "amount": 250.75,
      "type": "expense",
      "category": "Alimentação",
      "date": "2025-06-27"
    },
    {
      "description": "Salário Mensal",
      "amount": 3000.00,
      "type": "income",
      "category": "Salário",
      "date": "2025-06-30"
    }
  ]
  `;
}