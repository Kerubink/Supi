// src/components/ScannerModal.jsx
import React, { useEffect, useRef, useState } from 'react';
// Importa NotFoundException junto com os outros componentes do zxing
import { BrowserMultiFormatReader, DecodeHintType, NotFoundException } from '@zxing/library';
import { collection, addDoc } from 'firebase/firestore'; // Importa addDoc

// Ícone para fechar o modal
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function ScannerModal({ onClose, onScanSuccess, userId, db }) {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionToConfirm, setTransactionToConfirm] = useState(null);
  const [videoPlayError, setVideoPlayError] = useState(false); // Estado para erro de reprodução de vídeo
  const [isVideoPlaying, setIsVideoPlaying] = useState(false); // Novo estado para controlar se o vídeo está realmente tocando

  useEffect(() => {
    // Configura as dicas para o leitor de código de barras/QR
    const hints = new Map();
    const formats = [
      // Adicione os formatos que você espera ler
      DecodeHintType.QR_CODE,
      DecodeHintType.CODE_128,
      DecodeHintType.EAN_13,
      DecodeHintType.DATA_MATRIX,
      // Você pode adicionar outros formatos de código de barras aqui
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

    codeReader.current = new BrowserMultiFormatReader(hints);

    const startScanner = async () => {
      setError('');
      setScanResult('');
      setIsScanning(true);
      setVideoPlayError(false);
      setIsVideoPlaying(false); // Reseta o estado de reprodução do vídeo

      try {
        // Pede permissão para a câmera e inicia a leitura
        await codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (result) {
            console.log("Código lido com sucesso:", result.getText()); // Log para depuração
            setScanResult(result.getText());
            setIsScanning(false);
            codeReader.current.reset(); // Para o scanner após a leitura
            
            // Tenta parsear o resultado para uma transação
            try {
              const parsed = JSON.parse(result.getText());
              setTransactionToConfirm({
                description: parsed.description || "Dados Escaneados",
                amount: parseFloat(parsed.amount) || 0,
                type: parsed.type || "expense",
                category: parsed.category || "Outros",
                date: parsed.date || new Date().toISOString().split('T')[0],
              });
              setShowConfirmation(true);
            } catch (jsonParseError) {
              // Se não for JSON, trata como texto simples
              setTransactionToConfirm({
                description: `Dados Escaneados: ${result.getText().substring(0, 100)}...`,
                amount: 0, // Definir como 0 ou exigir entrada manual
                type: "expense",
                category: "Outros",
                date: new Date().toISOString().split('T')[0],
                rawData: result.getText() // Guarda os dados brutos para referência
              });
              setShowConfirmation(true);
            }

          }
          // Verifica se o erro é diferente de NotFoundException (que é quando não há código na imagem)
          if (err && !(err instanceof NotFoundException)) {
            console.error("Erro ao escanear:", err);
            setError("Erro ao escanear: " + err.message);
            setIsScanning(false);
          }
        });

        // Adiciona um listener para o evento 'playing' do vídeo
        videoRef.current.addEventListener('playing', () => {
          console.log("Evento 'playing' disparado. Vídeo está realmente tocando.");
          setIsVideoPlaying(true);
        });

        // Log para verificar se o srcObject foi definido após a tentativa de decodificação
        if (videoRef.current && videoRef.current.srcObject) {
          console.log("Stream de vídeo anexado ao elemento <video>.");
          // Tenta forçar a reprodução do vídeo
          try {
            await videoRef.current.play();
            console.log("Tentativa de reprodução do vídeo da câmera.");
          } catch (playErr) {
            console.error("Erro ao tentar reproduzir o vídeo da câmera (autoplay bloqueado?):", playErr);
            setVideoPlayError(true);
            setError("Não foi possível reproduzir o vídeo da câmera. Por favor, verifique as permissões ou tente novamente.");
          }
        } else {
          console.log("Stream de vídeo NÃO anexado ao elemento <video>.");
          setError("Não foi possível acessar o stream da câmera.");
        }

      } catch (err) {
        console.error("Erro ao acessar a câmera (getUserMedia):", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões.");
        setIsScanning(false);
      }
    };

    startScanner();

    // Função de limpeza para parar o scanner quando o componente for desmontado
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
        setIsScanning(false);
      }
      if (videoRef.current) {
        // Remove o listener para evitar vazamentos de memória
        videoRef.current.removeEventListener('playing', () => {
          setIsVideoPlaying(true);
        });
        // Para o stream da câmera ao fechar o modal
        const stream = videoRef.current.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
      }
    };
  }, []); // Executa apenas uma vez na montagem

  const handleConfirmTransaction = async () => {
    if (!userId || !db || !transactionToConfirm) {
      setError("Erro: Dados de usuário ou transação incompletos.");
      return;
    }
    try {
      const transactionsColRef = collection(db, `users/${userId}/transactions`);
      await addDoc(transactionsColRef, transactionToConfirm);
      console.log("Transação adicionada com sucesso via scanner!");
      onScanSuccess(transactionToConfirm.rawData || JSON.stringify(transactionToConfirm)); // Passa os dados brutos ou a transação confirmada
      onClose(); // Fecha o modal
    } catch (err) {
      console.error("Erro ao salvar transação:", err);
      setError("Erro ao salvar transação: " + err.message);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setTransactionToConfirm(null);
    setScanResult('');
    // Reinicia o scanner para uma nova leitura
    const hints = new Map();
    const formats = [
      DecodeHintType.QR_CODE,
      DecodeHintType.CODE_128,
      DecodeHintType.EAN_13,
      DecodeHintType.DATA_MATRIX,
    ];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    codeReader.current = new BrowserMultiFormatReader(hints);
    
    // Tenta reiniciar a decodificação do vídeo
    try {
      setIsScanning(true); // Indica que o scanner está ativo novamente
      setVideoPlayError(false); // Reseta o erro de vídeo
      setIsVideoPlaying(false); // Reseta o estado de reprodução do vídeo
      codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          console.log("Código lido com sucesso (após cancelamento):", result.getText()); // Log para depuração
          setScanResult(result.getText());
          setIsScanning(false);
          codeReader.current.reset();
          try {
            const parsed = JSON.parse(result.getText());
            setTransactionToConfirm({
              description: parsed.description || "Dados Escaneados",
              amount: parseFloat(parsed.amount) || 0,
              type: parsed.type || "expense",
              category: parsed.category || "Outros",
              date: parsed.date || new Date().toISOString().split('T')[0],
            });
            setShowConfirmation(true);
          } catch (jsonParseError) {
            setTransactionToConfirm({
              description: `Dados Escaneados: ${result.getText().substring(0, 100)}...`,
              amount: 0,
              type: "expense",
              category: "Outros",
              date: new Date().toISOString().split('T')[0],
              rawData: result.getText()
            });
            setShowConfirmation(true);
          }
        }
        if (err && !(err instanceof NotFoundException)) {
          console.error("Erro ao escanear (após cancelamento):", err);
          setError("Erro ao escanear: " + err.message);
          setIsScanning(false);
        }
      });
      // Adiciona o listener 'playing' novamente ao reiniciar
      videoRef.current.addEventListener('playing', () => {
        console.log("Evento 'playing' disparado (após cancelamento). Vídeo está realmente tocando.");
        setIsVideoPlaying(true);
      });
      // Tenta forçar a reprodução novamente
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.play().catch(playErr => {
          console.error("Erro ao tentar reproduzir vídeo (após cancelamento):", playErr);
          setVideoPlayError(true);
        });
      }

    } catch (err) {
      console.error("Erro ao reiniciar o scanner:", err);
      setError("Não foi possível reiniciar o scanner.");
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition duration-200"
      >
        <CloseIcon />
      </button>

      <h2 className="text-3xl font-bold text-white mb-6">Escanear Código</h2>
      
      {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
      {videoPlayError && (
        <p className="text-yellow-400 mb-4 text-center">
          O vídeo da câmera não está sendo exibido. Certifique-se de que as permissões de câmera estão concedidas e tente novamente.
        </p>
      )}

      {!showConfirmation ? (
        <div className="w-full max-w-lg bg-gray-800 rounded-lg shadow-xl overflow-hidden relative flex flex-col items-center justify-center aspect-video"> {/* Adicionado aspect-video para manter proporção */}
          {/* Adicionado playsInline, autoPlay e muted para melhor compatibilidade de reprodução */}
          {/* Adicionado object-fit-cover para garantir que o vídeo preencha o espaço */}
          <video ref={videoRef} className="w-full h-full object-cover rounded-lg" playsInline autoPlay muted></video>
          
          {/* Mostra o overlay apenas se o vídeo não estiver tocando ou houver erro de vídeo */}
          {(!isVideoPlaying || isScanning) && !videoPlayError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-semibold">
              <p>{isScanning ? "Procurando código..." : "Aguardando câmera..."}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full text-gray-800">
          <h3 className="text-xl font-semibold mb-4">Confirmar Transação</h3>
          <p className="mb-2"><strong>Descrição:</strong> {transactionToConfirm?.description}</p>
          <p className="mb-2"><strong>Valor:</strong> {parseFloat(transactionToConfirm?.amount || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          <p className="mb-2"><strong>Tipo:</strong> {transactionToConfirm?.type === 'expense' ? 'Despesa' : 'Receita'}</p>
          <p className="mb-4"><strong>Categoria:</strong> {transactionToConfirm?.category}</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={handleCancelConfirmation}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmTransaction}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
            >
              Confirmar e Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScannerModal;
