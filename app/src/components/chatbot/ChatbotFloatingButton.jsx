// src/components/chatbot/ChatbotFloatingButton.jsx
import React from 'react';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'; // Ícone de bolha de chat

// Cores para o tema escuro
const ACCENT_BLUE = '#00a8c6'; // Cor principal do botão flutuante
const TEXT_COLOR = '#f9f2e7';

function ChatbotFloatingButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-8 p-4 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110"
      style={{
        backgroundColor: ACCENT_BLUE,
        color: TEXT_COLOR,
        zIndex: 1000, // Garante que o botão fique acima da maioria dos elementos
      }}
      aria-label="Abrir Chatbot"
    >
      <ChatBubbleIcon sx={{ fontSize: 28 }} />
    </button>
  );
}

export default ChatbotFloatingButton;
