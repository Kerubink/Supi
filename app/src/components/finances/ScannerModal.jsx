import React, { useState } from 'react';
import { extractTextFromPDF } from '../../utils/pdfUtils';
import { sendToGemini } from '../../config/geminiConfig';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'; 

function ScannerModal({ onClose, onScanSuccess, userId, db }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const processFakeBill = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Busca o arquivo fake da pasta public
      const response = await fetch('/fake_bill.pdf');
      const blob = await response.blob();
      
      // Cria um File object similar ao que viria do input
      const fakeFile = new File([blob], 'fake_bill.pdf', { type: 'application/pdf' });
      
      // Cria um evento fake para passar para a função handleFile
      const fakeEvent = {
        target: {
          files: [fakeFile]
        }
      };
      
      await handleFile(fakeEvent);
    } catch (err) {
      console.error("Erro ao processar fatura fake:", err);
      setError("Erro ao processar fatura de exemplo: " + err.message);
      setLoading(false);
    }
  };

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
        balanceSetDateStr = profileData.balanceSetDate || '1970-01-01';
      } else {
        console.warn("Documento de perfil do usuário não encontrado. Iniciando saldo em 0.");
      }

      let finalBalanceSetDate = balanceSetDateStr;
      if (balanceSetDateStr === '1970-01-01' && parsed.length > 0) {
        const earliestTransactionDate = parsed.reduce((minDate, item) => {
          const itemDate = item.date || new Date().toISOString().split('T')[0];
          return itemDate < minDate ? itemDate : minDate;
        }, new Date().toISOString().split('T')[0]); 
        finalBalanceSetDate = earliestTransactionDate;
        console.log(`Definindo balanceSetDate para a data da transação mais antiga da fatura: ${finalBalanceSetDate}`);
      } else if (profileSnap.exists() && !profileSnap.data().balanceSetDate && profileSnap.data().currentBalance !== undefined) {
        finalBalanceSetDate = new Date().toISOString().split('T')[0];
        console.warn("balanceSetDate não encontrado para o perfil, usando a data atual como ponto de partida para o saldo.");
      }

      let newCalculatedBalance = parseFloat(currentBalanceInDb.toFixed(2));
      console.log(`Saldo inicial do DB para cálculo (${currentBalanceInDb.toFixed(2)}) e balanceSetDate (${finalBalanceSetDate})`);

      for (const item of parsed) {
        const transactionDescription = item.description || item.nome || item.descricao || 'Item';
        const transactionAmount = parseFloat(item.amount || item.valor || 0); 
        const transactionCategory = item.category || item.categoria || 'Outros';
        const transactionType = item.type || 'expense';
        const transactionDate = item.date || new Date().toISOString().split('T')[0];

        await addDoc(transactionsColRef, {
          description: transactionDescription,
          amount: parseFloat(transactionAmount.toFixed(2)), 
          category: transactionCategory,
          type: transactionType,
          date: transactionDate,
        });

        if (transactionDate >= finalBalanceSetDate) {
          if (transactionType === 'income') {
            newCalculatedBalance = (newCalculatedBalance + transactionAmount);
          } else if (transactionType === 'expense') { 
            newCalculatedBalance = (newCalculatedBalance - transactionAmount);
          }
          console.log(`Transação aplicada: ${transactionDescription}, Tipo: ${transactionType}, Valor: ${transactionAmount.toFixed(2)}, Data: ${transactionDate}. Saldo após transação: ${newCalculatedBalance.toFixed(2)}`);
        } else {
            console.log(`Transação em ${transactionDate} é anterior à data de definição do saldo (${finalBalanceSetDate}). Não afetará o saldo atual, pois já deveria estar incluída.`);
        }
      }

      await updateDoc(userProfileRef, {
        currentBalance: parseFloat(newCalculatedBalance.toFixed(2)), 
        balanceSetDate: finalBalanceSetDate 
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
      <div className="bg-black/60 backdrop-blur-md w-full flex-1 flex flex-col justify-center items-center text-center overflow-auto p-4">
         <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Enviar fatura</h2>
          
          <div className="mb-4 text-gray-300 text-sm">
            <p className="mb-2">Você pode:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Enviar sua própria fatura em PDF</li>
              <li>Experimentar com nossa fatura de exemplo</li>
            </ul>
            <p className="mt-3 text-gray-400 text-xs">
              A fatura de exemplo contém dados fictícios para você testar o sistema sem precisar usar informações pessoais.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg cursor-pointer transition flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Escolher arquivo PDF
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFile} 
                  className="hidden" 
                  disabled={loading}
                />
              </label>
              
              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="mx-3 text-gray-400 text-sm">ou</span>
                <div className="flex-grow border-t border-gray-600"></div>
              </div>
              
              <button 
                onClick={processFakeBill}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Usar fatura de exemplo
              </button>
            </div>
            
            {loading && (
              <div className="flex justify-center items-center gap-3 py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                <p className="text-blue-400">Processando arquivo...</p>
              </div>
            )}
            
            {error && (
              <div className="mt-3 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-900/50 px-6 py-3 flex justify-end">
          <button 
            onClick={onClose} 
            className="text-gray-300 hover:text-white text-sm font-medium transition"
            disabled={loading}
          >
            {loading ? 'Fechar (aguarde...)' : 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScannerModal;