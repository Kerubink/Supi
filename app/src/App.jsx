import './App.css';
import SimpleBottomNavigation from './components/bottomMenu/menu.jsx';
import ChatbotFloatingButton from './components/chatbot/ChatbotFloatingButton.jsx';
import ChatbotModal from './components/chatbot/ChatbotModal.jsx'
import { Outlet } from 'react-router-dom'; 

function App() {
  return (
    <>
      <section>
        <Outlet /> 
      </section>
      <SimpleBottomNavigation />
    </>
  );
}

export default App;