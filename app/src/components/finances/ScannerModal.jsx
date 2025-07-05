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
      let balanceSetDateStr = '1970-01-01'; 

      const profileSnap = await getDoc(userProfileRef);
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        currentBalanceInDb = parseFloat(profileData.currentBalance || 0);

        if (profileData.balanceSetDate) {
          balanceSetDateStr = profileData.balanceSetDate;
        } else if (profileData.currentBalance !== undefined) { 

          balanceSetDateStr = new Date().toISOString().split('T')[0];
          console.warn("balanceSetDate não encontrado para o perfil, usando a data atual como ponto de partida para o saldo.");
        }
      } else {
        console.warn("Documento de perfil do usuário não encontrado. Iniciando saldo em 0.");
      }

      let newCalculatedBalance = parseFloat(currentBalanceInDb).toFixed(2);

      for (const item of parsed) {
        const transactionDescription = item.description || item.nome || item.descricao || 'Item';
        const transactionAmount = parseFloat(item.amount || item.valor || 0).toFixed(2); 
        const transactionCategory = item.category || item.categoria || 'Outros';
        const transactionType = item.type || 'expense';
        const transactionDate = item.date || new Date().toISOString().split('T')[0];

        await addDoc(transactionsColRef, {
          description: transactionDescription,
          amount: parseFloat(transactionAmount), 
          category: transactionCategory,
          type: transactionType,
          date: transactionDate,
        });

        if (transactionDate >= balanceSetDateStr) {
          if (transactionType === 'income') {
            newCalculatedBalance = (parseFloat(newCalculatedBalance) + parseFloat(transactionAmount)).toFixed(2);
          } else if (transactionType === 'expense') { 
            newCalculatedBalance = (parseFloat(newCalculatedBalance) - parseFloat(transactionAmount)).toFixed(2);
          }
        } else {
            console.log(`Transação em ${transactionDate} é anterior à data de definição do saldo (${balanceSetDateStr}). Não afetará o saldo atual.`);
        }
      }

      newCalculatedBalance = parseFloat(newCalculatedBalance).toFixed(2); 

      await updateDoc(userProfileRef, {
        currentBalance: parseFloat(newCalculatedBalance), 
        balanceSetDate: balanceSetDateStr === '1970-01-01' ? new Date().toISOString().split('T')[0] : balanceSetDateStr
      }, { merge: true });

      onScanSuccess(parsed); 
      onClose();

    } catch (err) {
      console.error("Erro ao processar PDF:", err);
      setError("Erro ao processar o PDF: " + err.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-90 z-100 flex flex-col items-center h-dvh justify-center">
      <div className="bg-black/60 backdrop-blur-md w-full flex-1 flex flex-col justify-center items-center text-center overflow-auto ">
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