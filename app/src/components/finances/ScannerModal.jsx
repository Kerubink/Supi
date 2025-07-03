// src/components/finances/PDFUploader.jsx
import React, { useState } from 'react';
import { extractTextFromPDF } from '../../utils/pdfUtils';
import { sendToGemini } from '../../config/geminiConfig';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'; 

function ScannerModal({ onClose, onScanSuccess, userId, db }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (event) => {
    setLoading(true);
    setError('');

    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.pdf')) {
      setError('Envie um arquivo PDF válido.');
      setLoading(false);
      return;
    }

    try {
      const text = await extractTextFromPDF(file);
      const parsed = await sendToGemini(text);

      if (!Array.isArray(parsed)) {
        throw new Error("Resposta inválida do Gemini: Não é um array.");
      }

      const transactionsColRef = collection(db, `users/${userId}/transactions`);
      const userProfileRef = doc(db, `users/${userId}/user_profiles/profile`);

      let currentBalanceInDb = 0;
      const profileSnap = await getDoc(userProfileRef);
      if (profileSnap.exists()) {
        currentBalanceInDb = parseFloat(profileSnap.data().currentBalance || 0);
      } else {
        console.warn("Documento de perfil do usuário não encontrado. Iniciando saldo em 0.");
      }

      let newCalculatedBalance = currentBalanceInDb;

      for (const item of parsed) {
        const transactionAmount = parseFloat(item.amount || 0);
        const transactionType = item.type || 'expense'; // 'expense' como padrão

        await addDoc(transactionsColRef, {
          description: item.description || 'Item',
          amount: transactionAmount,
          category: item.category || 'Outros',
          type: transactionType,
          date: item.date || new Date().toISOString().split('T')[0],
        });

        // 2. Atualiza o saldo calculado com base na transação
        if (transactionType === 'income') {
          newCalculatedBalance += transactionAmount;
        } else { // assume 'expense'
          newCalculatedBalance -= transactionAmount;
        }
      }

      // 3. Atualizar o 'currentBalance' no perfil do usuário no Firestore
      await updateDoc(userProfileRef, {
        currentBalance: newCalculatedBalance
      });

      // Notifica o componente pai sobre o sucesso
      onScanSuccess(parsed);
      onClose();

    } catch (err) {
      console.error("Erro ao processar PDF:", err);
      setError("Erro ao processar o PDF: " + err.message); // Exibe a mensagem de erro detalhada
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md text-center">
        <h2 className="text-xl font-semibold mb-4">Enviar fatura em PDF</h2>
        <input type="file" accept="application/pdf" onChange={handleFile} className="mb-4" />
        {loading && <p className="text-blue-500">Processando arquivo...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <button onClick={onClose} className="mt-4 text-sm text-gray-500 underline">Cancelar</button>
      </div>
    </div>
  );
}

export default ScannerModal;