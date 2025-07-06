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
  "Outros",
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
  Sua tarefa é extrair **TODAS** as transações financeiras individuais listadas e formatá-las como um array JSON de objetos.

  Cada objeto de transação DEVE ter as seguintes chaves:
  - "description": (string) Uma breve descrição do item da transação.
  - "amount": (number) O valor numérico da transação. Use ponto como separador decimal.
  - "type": (string) O tipo de transação. Deve ser "expense" para despesas ou "income" para receitas.
  - "category": (string) A categoria mais apropriada para a transação. Escolha APENAS entre as seguintes categorias permitidas:
    ${ALLOWED_CATEGORIES.map(cat => `- "${cat}"`).join('\n    ')}
    Se uma categoria não se encaixar perfeitamente, use "Outros".
  - "date": (string, opcional) A data da transação no formato "YYYY-MM-DD".

  **Instruções Cruciais para a Extração de Transações:**
  - **Extrair TODAS as transações:** Varra o documento e identifique cada lançamento de dinheiro (entrada ou saída). Não omita nenhuma transação válida.
  - **Foco em Itens de Linha:** Concentre-se em itens que são claramente uma linha de transação (data, descrição, valor).
  - **Ignorar Resumos e Títulos:** NÃO inclua linhas que são totais, saldos, resumos de fatura, cabeçalhos, rodapés ou informações meramente descritivas da fatura. Exemplos a ignorar incluem:
    - "Total a pagar", "Total de compras de todos os cartões"
    - "Fatura anterior", "Saldo", "Limite disponível", "Limite de Crédito"
    - "Fechamento da fatura", "Vencimento", "Data de corte"
    - "Lançamentos futuros", "Parcela de..." (se for apenas a indicação da parcela e não a compra original)
    - Quaisquer frases que descrevam o documento em vez de uma transação específica.
  - **Identificação de Despesas e Receitas:** Se o valor for negativo ou indicar uma saída de dinheiro (ex: "Débito", "Pagamento de", "Compra", "Enviado"), é uma "expense". Se for positivo ou indicar uma entrada de dinheiro (ex: "Crédito", "Recebimento", "PIX recebido"), é uma "income".

  **Instruções Cruciais para a Extração de Valores (amount):**
  - **Precisão:** Extraia o valor numérico exato da transação.
  - **Separador Decimal:** Sempre use ponto como separador decimal (ex: 123.45).
  - **Leitura Robusta:** Seja resiliente a diferentes formatações de moeda ou espaçamentos. Transforme "R$ 30,00" ou "30,00" em "30.00".

  **Instruções Cruciais para a Data (date):**
  - **Prioridade Absoluta:** Se a data da transação estiver explícita ao lado da transação (ex: "30/06/2025", "01/07/2025", "06/07/2025"), esta data TEM PRIORIDADE MÁXIMA. Use-a como está, convertendo para "YYYY-MM-DD".
  - **Inferir ano e mês do CONTEXTO GERAL DO DOCUMENTO:** Se o ano não estiver explícito em uma transação individual, procure por "Extrato de [Mês/Ano]", "Fatura com vencimento em DD/MM/AAAA", ou um "Período: DD/MM/AAAA a DD/MM/AAAA". Use o **ano e o mês deste período principal como base** para as transações que não especificam o ano.
  - **Consistência de Mês:** Se o extrato é de Julho de 2025 e uma transação mostra "01/07", ela deve ser "2025-07-01". Se uma transação mostra "30/06", ela deve ser "2025-06-30" se for do mesmo período de fatura que inclui o final de junho ou início de julho.
  - **Formato Final:** A data deve ser sempre "YYYY-MM-DD". Se você não conseguir inferir uma data precisa, omita a chave "date".

  **Instruções Adicionais:**
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
      "description": "Transferência Recebida",
      "amount": 100.00,
      "type": "income",
      "category": "Outros",
      "date": "2025-07-01"
    },
    {
      "description": "Cobrança de IOF",
      "amount": 0.46,
      "type": "expense",
      "category": "Contas",
      "date": "2025-07-06"
    }
  ]
  `;
}