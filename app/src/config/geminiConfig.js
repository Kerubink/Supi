// src/config/geminiConfig.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateTransactionExtractionPrompt } from '../services/transactionService'; // Certifique-se de que este caminho está correto
import { generateFinancialReportPrompt } from '../services/reportService'; // Certifique-se de que este caminho está correto
import { generateChatbotPrompt } from '../services/chatService'; // Importe o novo serviço

// Certifique-se de que sua API_KEY esteja aqui ou seja importada de um local seguro (ex: .env)
const API_KEY = "AIzaSyBcM117nfu966IKI9CIeycLlRNjlcH6DZM";
const genAI = new GoogleGenerativeAI(API_KEY);

// Verifique se o modelo está correto conforme discutido anteriormente
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

export async function generateFinancialReport(transactions, userData, monthYear) {
  if (!transactions || transactions.length === 0) {
    return { error: "Não há transações para gerar um relatório para este mês." };
  }

  const prompt = generateFinancialReportPrompt(transactions, userData, monthYear);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rawText = response.text();

    // Adiciona .trim() para remover espaços em branco e quebras de linha no início/fim
    rawText = rawText.trim();

    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn("⚠️ Gemini não retornou JSON válido para relatório. Conteúdo:", rawText);
      return { error: "A IA não conseguiu gerar um relatório válido no formato esperado. Tente novamente." };
    }

    try {
      return JSON.parse(match[0]); // Parse apenas a string JSON capturada pela regex
    } catch (parseError) {
      console.error("❌ Erro ao interpretar JSON do relatório da Gemini:", parseError, rawText);
      return { error: "Erro ao processar o relatório da IA. Formato inválido." };
    }
  } catch (error) {
    console.error("Erro ao chamar a API do Gemini para gerar relatório:", error);
    return { error: "Erro na comunicação com a IA para gerar relatório. Verifique sua conexão ou tente mais tarde." };
  }
}

// A função sendToGemini (para extração de transações) também deveria ter este ajuste:
export async function sendToGemini(ocrText) {
  const prompt = generateTransactionExtractionPrompt(ocrText);
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let raw = response.text();

    // Adiciona .trim() aqui também para robustez
    raw = raw.trim();

    // A regex para array é: /\[\s*\{[\s\S]*?\}\s*\]/
    const match = raw.match(/\[\s*\{[\s\S]*?\}\s*\]/); 
    if (!match) {
      console.warn("⚠️ Gemini não retornou JSON válido para extração de transações. Conteúdo:", raw);
      return [];
    }

    try {
      return JSON.parse(match[0]);
    } catch (err) {
      console.error("❌ Erro ao interpretar JSON da Gemini (extração de transações):", err, raw);
      return [];
    }
  } catch (err) {
    console.error("❌ Erro ao chamar a API do Gemini para extrair transações:", err);
    return [];
  }
}

/**
 * Envia uma mensagem do usuário para o chatbot Gemini e retorna a resposta.
 * @param {string} userMessage A mensagem do usuário.
 * @param {Object} userData Dados do perfil do usuário para contextualização.
 * @returns {Promise<string|Object>} A resposta do chatbot ou um objeto de erro.
 */
export async function getChatbotResponse(userMessage, userData) {
  if (!userMessage || userMessage.trim() === '') {
    return { error: "A mensagem do usuário não pode ser vazia." };
  }

  const prompt = generateChatbotPrompt(userMessage, userData);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rawText = response.text();

    // Como esperamos apenas texto, apenas retornamos o texto limpo
    return rawText.trim();
  } catch (error) {
    console.error("Erro ao chamar a API do Gemini para o chatbot:", error);
    return { error: "Erro na comunicação com a IA para o chatbot. Verifique sua conexão ou tente mais tarde." };
  }
}