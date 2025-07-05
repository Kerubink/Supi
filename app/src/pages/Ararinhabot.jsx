import React, { useState, useRef, useEffect } from "react";
import SendIcon from "@mui/icons-material/Send";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseconfig";
import { getChatbotResponse } from "../config/geminiConfig";

const PRIMARY_BG = "#191919";
const SECTION_BG = "#282828";
const TEXT_COLOR = "#f9f2e7";
const ACCENT_BLUE = "#00a8c6";
const ACCENT_GREEN = "#aee239";
const ACCENT_ORANGE = "#FF8042";

function Ararinhabot() {
  const [messages, setMessages] = useState([
    {
      sender: "Supinha",
      text: "Olá! Eu sou a Supinha, a sua assistente financeira. Como posso ajudar hoje?",
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const chatboxRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const userProfileRef = doc(db, `users/${user.uid}/user_profiles/profile`);
          const docSnap = await getDoc(userProfileRef);
          
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log("Perfil do usuário não encontrado");
          }
        } catch (err) {
          console.error("Erro ao buscar perfil:", err);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setUserId(null);
        setUserData(null);
        setProfileLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (userInput.trim() === "" || loading || profileLoading) return;

    const newUserMessage = { sender: "Você", text: userInput.trim() };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setUserInput("");
    setLoading(true);

    try {
      const userContext = {
        currentBalance: userData?.currentBalance || "Não informado",
        financialSituation: userData?.financialSituation || "Não informada",
        learningTopic: userData?.learningTopic || ["Não informado"],
        monthlyIncome: userData?.monthlyIncome || "Não informado",
        objective: userData?.objective || ["Não definido"],
        occupation: userData?.occupation || "Não informada",
        personalDescription: userData?.personalDescription || "Não informada",
        trackingFrequency: userData?.trackingFrequency || "Não definida"
      };

      const aiResponse = await getChatbotResponse(userInput.trim(), userContext);

      let botResponseText;
      if (typeof aiResponse === 'object' && aiResponse.error) {
        botResponseText = `Desculpe, ocorreu um erro: ${aiResponse.error}`;
      } else {
        botResponseText = aiResponse;
      }

      const botResponse = {
        sender: "Supinha",
        text: botResponseText,
      };

      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error("Erro ao obter resposta da IA:", error);
      const errorBotResponse = {
        sender: "Supinha",
        text: "Desculpe, não consegui me comunicar agora. Tente novamente mais tarde.",
      };
      setMessages((prevMessages) => [...prevMessages, errorBotResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !loading && !profileLoading) {
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className={`w-screen h-screen p-2 flex flex-col bg-[${PRIMARY_BG}] text-[${TEXT_COLOR}]`}
    >
      <div
        ref={chatboxRef}
        className={`flex-1 p-3 overflow-y-auto bg-[${PRIMARY_BG}] bg-opacity-70 backdrop-blur-sm`}
      >
        {messages.map((msg, index) => (
          <p
            key={index}
            className={`${
              msg.sender === "Você"
                ? `text-right text-[${ACCENT_GREEN}]`
                : `text-left text-[${TEXT_COLOR}]`
            } mb-2 break-words`}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
        {loading && (
          <p className={`text-left text-[${TEXT_COLOR}] mb-2 break-words`}>
            <strong>Supinha:</strong> Digitando...
          </p>
        )}
        {profileLoading && (
          <p className={`text-left text-[${TEXT_COLOR}] mb-2 break-words`}>
            <strong>Sistema:</strong> Carregando seus dados...
          </p>
        )}
      </div>

      <div className="flex items-center border rounded-full gap-2 mt-2 mb-16 p-2 pl-3.5 bg-[${SECTION_BG}]">
        <input
          type="text"
          className={`flex-1 p-3 border-transparent bg-[${PRIMARY_BG}] text-[${TEXT_COLOR}] placeholder-gray-500 focus:outline-none focus:ring-0`}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            profileLoading 
              ? "Carregando seus dados..." 
              : loading 
                ? "Aguarde a resposta..." 
                : "Manda a sua pergunta..."
          }
          disabled={loading || profileLoading}
        />
        <button
          onClick={handleSendMessage}
          className={`bg-[${ACCENT_BLUE}] hover:bg-[${ACCENT_BLUE}] text-[${TEXT_COLOR}] font-bold py-3 px-3 rounded-full transition duration-200 ease-in-out ${
            loading || profileLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Enviar mensagem"
          disabled={loading || profileLoading}
        >
          <SendIcon style={{ color: TEXT_COLOR }} />
        </button>
      </div>
    </div>
  );
}

export default Ararinhabot;