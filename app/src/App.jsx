import './App.css';
import SimpleBottomNavigation from './components/bottomMenu/menu.jsx';
import ChatbotComponent from './components/chatbot/ChatbotComponent.jsx'; 
import FloatingChatButton from './components/chatbot/FloatingChatButton'; 
import { Outlet } from 'react-router-dom'; 

function App() {
  return (
    <>
      <section>
        <Outlet /> 
      </section>
      <SimpleBottomNavigation />

       <FloatingChatButton>
          <ChatbotComponent />
        </FloatingChatButton>
    </>
  );
}

export default App;