import './App.css';
import SimpleBottomNavigation from './components/bottomMenu/menu.jsx';
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import WelcomeModal from './components/WelcomeModal';

function App() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  return (
    <>
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      
      <section>
        <Outlet /> 
      </section>
      <SimpleBottomNavigation />
    </>
  );
}

export default App;