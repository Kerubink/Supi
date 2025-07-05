import { useState, useEffect } from 'react';

export function PWAInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const iosCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iosCheck);

    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

    const wasDismissed = localStorage.getItem('installPromptDismissed');

    if (!isInstalled && !wasDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstall = () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then(() => {
        window.deferredPrompt = null;
      });
    }
    handleDismiss();
  };

  const handleDismiss = () => {
    localStorage.setItem('installPromptDismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-[#282828] text-[#f9f2e7] p-4 rounded-lg shadow-xl z-50 max-w-md mx-auto border border-[#00a8c6]">
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-lg">Instalar App</h3>
        
        {isIOS ? (
          <p className="text-sm">
            Toque no ícone <span className="text-[#00a8c6]">Compartilhar</span> e selecione 
            <span className="text-[#00a8c6]"> "Adicionar à Tela de Início"</span>
          </p>
        ) : (
          <p className="text-sm">Adicione este aplicativo à sua tela inicial para uma melhor experiência!</p>
        )}

        <div className="flex gap-2 justify-end">
          <button 
            onClick={handleDismiss}
            className="px-4 py-2 text-sm rounded-lg bg-transparent border border-[#00a8c6] text-[#00a8c6] hover:bg-[#00a8c6] hover:bg-opacity-20"
          >
            Fechar
          </button>
          
          {!isIOS && (
            <button 
              onClick={handleInstall}
              className="px-4 py-2 text-sm rounded-lg bg-[#00a8c6] text-white hover:bg-[#40c0cb]"
            >
              Instalar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}