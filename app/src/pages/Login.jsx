import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from '@mui/icons-material/Apple';
import Button from "@mui/material/Button";
import { auth, db } from "../config/firebaseconfig"; 
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  OAuthProvider,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'; 


function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formMessage, setFormMessage] = useState(""); // Estado para mensagens gerais do formulário
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Novo estado para o olhinho
  const navigate = useNavigate();

  // Função para resetar as mensagens de erro/feedback
  const resetMessages = () => {
    setFormMessage("");
  };

  // Função auxiliar para criar/atualizar o perfil do usuário no Firestore
  const createUserProfile = async (user, name, userEmail, userAge = null) => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        fullName: name,
        email: userEmail,
        age: userAge, // Pode ser null para login social sem idade
        createdAt: new Date(),
        // Você pode adicionar mais campos aqui, como user.photoURL, etc.
      });
      console.log("User profile created/updated in Firestore for UID:", user.uid);
    } catch (error) {
      console.error("Error creating user profile in Firestore:", error);
      // Você pode definir uma mensagem de erro aqui se quiser notificar o usuário
      // sobre falha na criação do perfil no Firestore.
      setFormMessage("Ocorreu um problema ao salvar seus dados de perfil. Por favor, tente novamente.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages(); // Limpa mensagens anteriores

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setFormMessage("Login realizado com sucesso! Bem-vindo(a) de volta.");
      navigate("/");
    } catch (error) {
      console.error("Erro no login:", error);
      let message =
        "Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.";

      switch (error.code) {
        case "auth/invalid-email":
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential": 
          message =
            "E-mail ou senha incorretos. Verifique os dados ou clique em 'Esqueci minha senha'.";
          break;
        case "auth/too-many-requests":
          message =
            "Muitas tentativas de login. Por favor, tente novamente mais tarde.";
          break;
        default:
          message =
            "Ocorreu um erro inesperado ao fazer login. " + error.message;
      }

      setFormMessage(message); 
    }
  };

  const handleGoogleSignIn = async () => {
    resetMessages();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserProfile(user, user.displayName || user.email, user.email); 
      setFormMessage("Login com Google realizado com sucesso! Bem-vindo(a)!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao entrar com Google:", error);
      let message =
        "Não foi possível fazer login com o Google. Por favor, tente novamente.";
      if (error.code === "auth/popup-closed-by-user") {
        message = "O pop-up de login foi fechado. Tente novamente.";
      } else if (error.code === "auth/cancelled-popup-request") {
        message =
          "Você já tem uma janela de login aberta. Por favor, use-a ou feche-a.";
      }
      setFormMessage(message);
    }
  };

  const handleAppleSignIn = async () => {
    resetMessages();
    const provider = new OAuthProvider("apple.com");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserProfile(user, user.displayName || user.email, user.email);
      setFormMessage("Login com Apple realizado com sucesso! Bem-vindo(a)!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao entrar com Apple:", error);
      let message =
        "Não foi possível fazer login com a Apple. Por favor, tente novamente.";
      if (error.code === "auth/popup-closed-by-user") {
        message = "O pop-up de login foi fechado. Tente novamente.";
      } else if (error.code === "auth/cancelled-popup-request") {
        message =
          "Você já tem uma janela de login aberta. Por favor, use-a ou feche-a.";
      }
      setFormMessage(message);
    }
  };

  const handleForgotPassword = async () => {
    resetMessages(); 
    if (!email) {
      setFormMessage("Por favor, digite seu e-mail para redefinir a senha.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setFormMessage(
        "Um e-mail para redefinir sua senha foi enviado! Verifique sua caixa de entrada (e spam)."
      );
      handleClose();
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      let message =
        "Não foi possível enviar o e-mail de redefinição de senha. Por favor, tente novamente.";
      if (error.code === "auth/user-not-found") {
        message =
          "Não encontramos uma conta com este e-mail para redefinição. Verifique o e-mail digitado.";
      } else if (error.code === "auth/invalid-email") {
        message = "O e-mail fornecido é inválido. Verifique e tente novamente.";
      }
      setFormMessage(message);
    }
  };

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    resetMessages();
    setOpen(true);
  };
  const handleClose = () => {
    resetMessages();
    setOpen(false);
  };

  return (
    <section className="flex flex-col justify-end gap-15 h-screen bg-[url('/Fundo-supi.jpg')] bg-cover bg-no-repeat bg-center bg-black">


      <div className="flex flex-col h-2/5 space-y-2.5 justify-end bg-gradient-to-t from-black via-gray-900 to-gray-800/5">
        <div className="text-white text-2xl font-extrabold p-3">
          <p>
            Controle seus gastos <br /> e aprenda se divertindo
          </p>
        </div>

        <div className="flex itens-center justify-center gap-4">
          <button
            onClick={handleOpen}
            variant="outlined"
            className="group group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-rose-300 hover:before:[box-shadow:_20px_20px_20px_30px_#a21caf] duration-500 before:duration-500 hover:duration-500 underline underline-offset-2 hover:after:-right-8 hover:before:right-12 hover:before:-bottom-8 hover:before:blur hover:underline hover:underline-offset-4  origin-left hover:decoration-2 hover:text-rose-300 relative bg-neutral-800 h-14 w-64 border text-left p-3 text-gray-50 text-base font-bold rounded-2xl  overflow-hidden  before:absolute before:w-12 before:h-12 before:content[''] before:right-1 before:top-1 before:z-10 before:bg-violet-500 before:rounded-full before:blur-lg  after:absolute after:z-10 after:w-20 after:h-20 after:content['']  after:bg-rose-300 after:right-8 after:top-3 after:rounded-full after:blur-lg"
          >
            Entrar
          </button>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="border border-white rounded-2xl p-3 flex items-center justify-center gap-2 hover:bg-gray-100/20"
            >
              <GoogleIcon className="text-white" />
            </button>
            <button
              type="button"
              onClick={handleAppleSignIn}
              className="border border-white rounded-2xl p-3 flex items-center justify-center gap-2 hover:bg-gray-100/20"
            >
              <AppleIcon className="text-white" />
            </button>
          </div>
        </div>

        <div className="text-sm p-3">
          <span className="text-gray-300">Não tem conta?</span>
          <Link to="/register">
            <a className="text-white font-bold"> Criar conta</a>
          </Link>
        </div>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
        className="backdrop-blur-sm"
      >
        <Box className="absolute top-1/2 left-1/2 w-11/12 flex flex-col h-4/7 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-xl shadow-lg">
          <div className="flex flex-col items-center justify-center">
            <img src="/logoSupi.png" alt="logo supi" className="w-30" />
            <h1 className="font-bold text-2xl">Bem vindo de volta</h1>
            <p className="text-gray-500">
              Faça login para continuar aproveitando o Supi
            </p>
          </div>
          <form
            className="flex flex-col justify-end gap-4 w-full h-full px-1 bg-white rounded-lg"
            onSubmit={handleLogin}
          >
            <div>
              <div className="flex gap-1 items-center rounded-2xl bg-blue-200 pl-3 duration-300 border-gray-400 group delay-200 cursor-text *:cursor-text">
                <label htmlFor="email">
                  <EmailIcon className="text-gray-500" />
                </label>
                <input
                  required
                  className="flex-1 p-4  focus:outline-none "
                  id="email"
                  type="email"
                  value={email}
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="flex gap-1 items-center rounded-2xl bg-blue-200 pl-3 duration-300 border-gray-400 group delay-200 relative cursor-text *:cursor-text">
                <label htmlFor="password">
                  <LockIcon className="text-gray-500" />
                </label>
                <input
                  required
                  className="flex-1 p-4 focus:outline-none pr-10" 
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  placeholder="Senha"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer focus:outline-none"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)} 
                >
                  {isPasswordVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
            </div>
            <div className="text-right mt-[-8px]">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 hover:underline text-sm font-semibold"
              >
                Esqueci minha senha?
              </button>
            </div>

            <div className="h-8">
              {formMessage && (
                <p
                  className={`text-center text-sm font-semibold ${
                    formMessage.includes("sucesso") ||
                    formMessage.includes("Bem-vindo")
                      ? "text-green-600"
                      : "text-red-600"
                  } mb-2`}
                >
                  {formMessage}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-8 justify-center mt-2">
              <Button
                variant="contained"
                type="submit"
                className="!font-bold !rounded-3xl !py-3 !w-2/4"
              >
                Entrar
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    </section>
  );
}

export default LoginPage;