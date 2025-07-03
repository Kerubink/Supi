// src/config/geminiConfig.js
import { generateTransactionExtractionPrompt } from '../services/geminiService'; // Importe o novo serviço

export async function sendToGemini(ocrText) {
  // Use a função do serviço para gerar o prompt
  const prompt = generateTransactionExtractionPrompt(ocrText);

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=AIzaSyBcM117nfu966IKI9CIeycLlRNjlcH6DZM", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const json = await response.json();
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Tenta extrair o trecho JSON válido com regex
  const match = raw.match(/\[\s*{[\s\S]*?}\s*\]/);
  if (!match) {
    console.warn("⚠️ Gemini não retornou JSON válido. Conteúdo:", raw);
    return [];
  }

  try {
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("❌ Erro ao interpretar JSON da Gemini:", err, raw);
    return [];
  }
}