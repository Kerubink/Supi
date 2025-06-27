import React, { useState, useRef, useEffect } from 'react';

function ChatbotComponent() {
  const [messages, setMessages] = useState([
    { sender: 'Bot', text: 'Hello! How can I help you today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const chatboxRef = useRef(null);

  const responses = {
    "hello": "Hi there! 😊",
    "hi": "Hello! How can I assist you?",
    "how are you": "I'm just a bot, but I'm doing great!",
    "bye": "Goodbye! Have a wonderful day! 👋",
    "what is your name": "I'm ChatBot! Your virtual assistant. 🤖",
    "who created you": "I was created by a developer to assist you!",
    "what can you do": "I can chat with you, answer basic questions, and share contact info.",
    "contact": "You can reach us at support@example.com 📧",
    "email": "Feel free to contact us at support@example.com 📩",
    "help": "I'm here to help! Ask me anything.",
    "thanks": "You're welcome! 😊"
  };

  const getChatResponse = (userMessage) => {
    return responses[userMessage.toLowerCase()] || "I'm not sure how to respond to that. 🤔";
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

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      <div
        ref={chatboxRef}
        className="flex-1 p-3 overflow-y-auto border-b border-gray-200"
      >
        {messages.map((msg, index) => (
          <p key={index} className={msg.sender === 'You' ? 'text-right text-blue-600' : 'text-left text-gray-800'}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        className="w-full p-3 border-none outline-none text-sm"
        placeholder="Type a message..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
}

export default ChatbotComponent;