import React from 'react';

function WelcomeModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/75 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full mx-auto overflow-hidden transform transition-all scale-100 opacity-100 ease-out duration-300">
        <div className="p-8 text-center relative">
          <h2 className="text-3xl font-extrabold text-blue-400 mb-4 tracking-tight">Bem-vindo(a) ao Protótipo SUPI!</h2>
          <p className="text-gray-400 text-lg mb-6">
            Obrigado por testar nossa solução desenvolvida para o Hackathon da PWC+FIAP.
          </p>
          
          <div className="text-gray-300 text-left space-y-5 mb-8 text-base leading-relaxed">
            <p>
              Esta é uma versão protótipo criada em ritmo de hackathon. Por favor, observe:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Funcionalidades podem ser limitadas ou demonstrativas.</li>
              <li>Instabilidades (bugs) podem ocorrer.</li>
              <li>Os dados inseridos não serão mantidos após a conclusão do hackathon e serão removidos por nossa equipe.</li>
            </ul>
            <p>
              Sua experiência e feedback são cruciais. Divirta-se explorando!
            </p>
            <p className="text-right text-blue-300 font-semibold mt-6">
              Atenciosamente,<br />
              Kauã Kelvyn - Dev Fullstack Supimpa
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Entendi e Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;