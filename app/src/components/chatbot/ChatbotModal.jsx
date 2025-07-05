// src/components/chatbot/ChatbotModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close'; // Ícone de fechar

// Cores para o tema escuro
const PRIMARY_BG = '#191919';
const SECTION_BG = '#282828';
const TEXT_COLOR = '#f9f2e7';
const ACCENT_BLUE = '#00a8c6';
const ACCENT_GREEN = '#aee239'; // Para mensagens do usuário
const ACCENT_ORANGE = '#FF8042'; // Para mensagens de erro/bot

function ChatbotModal({ onClose }) {
  const [messages, setMessages] = useState([
    { sender: 'Bot', text: 'Olá! Como posso ajudar você hoje?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const chatboxRef = useRef(null);
  const modalRef = useRef(null); // Referência para o modal para cliques fora

  const responses = {
    "hello": "Olá! 👋",
    "hi": "Oi! Como posso te ajudar?",
    "how are you": "Eu sou apenas um programa, mas estou funcionando muito bem! 😊",
    "bye": "Até mais! Tenha um ótimo dia! 👋",
    "what is your name": "Eu sou o ChatBot! Seu assistente virtual. ✨",
    "who created you": "Fui criado por um desenvolvedor para te ajudar!",
    "what can you do": "Posso conversar com você, responder perguntas básicas e compartilhar informações de contato.",
    "contact": "Você pode nos contatar em suporte@example.com 📧",
    "email": "Sinta-se à vontade para nos contatar em suporte@example.com 📧",
    "help": "Estou aqui para ajudar! Me pergunte qualquer coisa.",
    "thanks": "De nada! 😊"
  };

  const getChatResponse = (userMessage) => {
    return responses[userMessage.toLowerCase()] || "Não tenho certeza de como responder a isso. 🤔";
  };

  const handleSendMessage = () => {
    if (userInput.trim() === '') return;

    const newUserMessage = { sender: 'You', text: userInput.trim() };
    const botResponse = { sender: 'Bot', text: getChatResponse(userInput.trim()) };

    setMessages((prevMessages) => [...prevMessages, newUserMessage, botResponse]);
    setUserInput('');
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  // Scroll to bottom of chatbox when messages change
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  // Lógica para fechar o modal ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);


  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9998 }} // Z-index para o overlay do modal
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md h-auto max-h-[80vh] flex flex-col rounded-lg border border-gray-700"
        style={{
          backgroundColor: `${SECTION_BG}E6`, // Cor de fundo com opacidade para o blur
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', // Para compatibilidade com Safari
          zIndex: 9999, // Z-index muito alto para o conteúdo do modal
        }}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-3 flex justify-between items-center border-b border-gray-700">
          <h3 className="text-lg font-semibold text-[#f9f2e7]">Chatbot</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#00a8c6]"
            aria-label="Fechar Chat"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Área de Mensagens */}
        <div
          ref={chatboxRef}
          className={`flex-1 p-3 overflow-y-auto bg-[${PRIMARY_BG}] bg-opacity-70 backdrop-blur-sm`}
        >
          {messages.map((msg, index) => (
            <p
              key={index}
              className={`${msg.sender === 'You' ? `text-right text-[${ACCENT_GREEN}]` : `text-left text-[${TEXT_COLOR}]`} mb-2 break-words`}
            >
              <strong>{msg.sender}:</strong> {msg.text}
            </p>
          ))}
        </div>

        {/* Campo de Input */}
        <input
          type="text"
          className={`w-full p-3 border-none rounded-b-lg bg-[${PRIMARY_BG}] text-[${TEXT_COLOR}] placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[${ACCENT_BLUE}]`}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
        />
      </div>
    </div>
  );
}

export default ChatbotModal;
