import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import CakeIcon from "@mui/icons-material/Cake";
import Button from "@mui/material/Button";
import { auth, db } from "../config/firebaseconfig";
import { doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const navigate = useNavigate();

  const resetMessages = () => {
    setFormMessage(""); 
  };

  const createUserProfile = async (user, name, userEmail, userAge = null) => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        fullName: name,
        email: userEmail,
        age: userAge,
        createdAt: new Date(),
      });
      console.log("User profile created in Firestore for UID:", user.uid);
    } catch (error) {
      console.error("Error creating user profile in Firestore:", error);
      setFormMessage(
        "Houve um problema ao salvar seus dados de perfil. Por favor, tente novamente."
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetMessages(); 

    let validationErrors = [];

    if (fullName.trim() === "") {
      validationErrors.push("Por favor, digite seu nome completo.");
    }
    if (age <= 0 || age === "") {
      validationErrors.push(
        "A idade deve ser um número válido e maior que zero."
      );
    }
    if (password !== confirmPassword) {
      validationErrors.push("As senhas não coincidem.");
    }
    if (!termsAccepted) {
      validationErrors.push(
        "Para se cadastrar, você precisa aceitar os termos e condições."
      );
    }

    if (validationErrors.length > 0) {
      setFormMessage(validationErrors.join(" ")); 
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await createUserProfile(user, fullName, email, age);
      setFormMessage("Cadastro realizado com sucesso! Bem-vindo(a) ao Supi!");
      navigate("/");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      let message =
        "Não foi possível realizar o cadastro. Por favor, tente novamente.";

      switch (error.code) {
        case "auth/email-already-in-use":
          message =
            "Este e-mail já está em uso. Tente fazer login ou use outro e-mail.";
          break;
        case "auth/weak-password":
          message =
            "A senha é muito fraca. Por favor, use uma senha com pelo menos 6 caracteres.";
          break;
        case "auth/invalid-email":
          message =
            "O e-mail fornecido é inválido. Verifique e tente novamente.";
          break;
        default:
          message = "Ocorreu um erro inesperado ao cadastrar. " + error.message;
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
      await createUserProfile(
        user,
        user.displayName || "Usuário Google",
        user.email,
        null
      );
      setFormMessage(
        "Cadastro/Login com Google realizado com sucesso! Bem-vindo(a)!"
      );
      navigate("/");
    } catch (error) {
      console.error("Erro ao entrar com Google:", error);
      let message =
        "Não foi possível cadastrar/fazer login com o Google. Por favor, tente novamente.";
      if (error.code === "auth/popup-closed-by-user") {
        message = "O pop-up de login foi fechado. Tente novamente.";
      } else if (error.code === "auth/cancelled-popup-request") {
        message =
          "Você já tem uma janela de login aberta. Por favor, use-a ou feche-a.";
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        message =
          "Já existe uma conta com este e-mail usando outro método de login (ex: e-mail e senha). Por favor, use o método de login original ou redefina sua senha.";
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
      await createUserProfile(
        user,
        user.displayName || "Usuário Apple",
        user.email,
        null
      );
      setFormMessage(
        "Cadastro/Login com Apple realizado com sucesso! Bem-vindo(a)!"
      );
      navigate("/");
    } catch (error) {
      console.error("Erro ao entrar com Apple:", error);
      let message =
        "Não foi possível cadastrar/fazer login com a Apple. Por favor, tente novamente.";
      if (error.code === "auth/popup-closed-by-user") {
        message = "O pop-up de login foi fechado. Tente novamente.";
      } else if (error.code === "auth/cancelled-popup-request") {
        message =
          "Você já tem uma janela de login aberta. Por favor, use-a ou feche-a.";
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        message =
          "Já existe uma conta com este e-mail usando outro método de login. Por favor, use o método de login original ou redefina sua senha.";
      }
      setFormMessage(message);
    }
  };

  return (
    <section className="flex flex-col gap-15 h-screen bg-[url('https://i.pinimg.com/736x/73/b4/02/73b402ebb849a547b6c318b5a878e4fd.jpg')] bg-cover bg-no-repeat bg-center bg-black">
      <div className=" h-screen flex flex-col items-center justify-between py-3 gap-8 bg-black/70 backdrop-blur-xl">
        <div className="w-2/3 flex flex-col items-center justify-center mt-5">
          <img src="/logoSupi.png" alt="logo do app" className="w-[7rem]" />
          <p className="text-white text-md text-center font-bold">
            Um novo jeito de gerir seu dinheiro se divertindo!
          </p>
        </div>
        <form
          className="flex flex-col gap-4 w-full px-6"
          onSubmit={handleRegister}
        >
          {/* Campo Nome Completo */}
          <div>
            <div className="flex gap-1 items-center rounded-2xl bg-blue-200 px-3 duration-300 border-gray-400 group delay-200 ">
              <PersonIcon className="text-gray-500" />
              <input
                required
                className="flex-1 p-4  focus:outline-none"
                id="fullNameRegister"
                type="text"
                value={fullName}
                placeholder="Nome Completo"
                onChange={(e) => {
                  setFullName(e.target.value);
                  resetMessages();
                }}
              />
            </div>
            {/* Mensagens de erro removidas daqui */}
          </div>
          {/* Campo Email */}
          <div>
            <div className="flex gap-1 items-center rounded-2xl bg-blue-200 px-3 duration-300 border-gray-400 group delay-200 ">
              <EmailIcon className="text-gray-500" />
              <input
                required
                className="flex-1 p-4  focus:outline-none"
                id="emailRegister"
                type="email"
                value={email}
                placeholder="Email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  resetMessages();
                }}
              />
            </div>
            {/* Mensagens de erro removidas daqui */}
          </div>
          {/* Campo Idade */}
          <div>
            <div className="flex gap-1 items-center rounded-2xl bg-blue-200 px-3 duration-300 border-gray-400 group delay-200 ">
              <CakeIcon className="text-gray-500" />
              <input
                required
                className="flex-1 p-4  focus:outline-none"
                id="ageRegister"
                type="number"
                value={age}
                placeholder="Idade"
                onChange={(e) => {
                  setAge(e.target.value);
                  resetMessages();
                }}
              />
            </div>
            {/* Mensagens de erro removidas daqui */}
          </div>
          {/* Campo Senha */}
          <div>
            <div className="flex gap-1 items-center rounded-2xl bg-blue-200 pl-3 duration-300 border-gray-400 group delay-200 relative cursor-text *:cursor-text">
              <label htmlFor="passwordRegister">
                <LockIcon className="text-gray-500" />
              </label>
              <input
                required
                className="flex-1 p-4 focus:outline-none pr-10"
                id="passwordRegister"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                placeholder="Senha"
                onChange={(e) => {
                  setPassword(e.target.value);
                  resetMessages();
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer focus:outline-none"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </button>
            </div>
            {/* Mensagens de erro removidas daqui */}
          </div>
          {/* Campo Confirmar Senha */}
          <div>
            <div className="flex gap-1 items-center rounded-2xl bg-blue-200 pl-3 duration-300 border-gray-400 group delay-200 relative cursor-text *:cursor-text">
              <label htmlFor="confirmPasswordRegister">
                <LockIcon className="text-gray-500" />
              </label>
              <input
                required
                className="flex-1 p-4 focus:outline-none pr-10"
                id="confirmPasswordRegister"
                type={isConfirmPasswordVisible ? "text" : "password"}
                value={confirmPassword}
                placeholder="Confirme sua senha"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  resetMessages();
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer focus:outline-none"
                onClick={() =>
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                }
              >
                {isConfirmPasswordVisible ? (
                  <VisibilityOffIcon />
                ) : (
                  <VisibilityIcon />
                )}
              </button>
            </div>
            {/* Mensagens de erro removidas daqui */}
          </div>

          {/* Checkbox de Termos e Condições */}
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="termsCheckbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked);
                resetMessages();
              }}
              className="mr-2"
            />
            <label htmlFor="termsCheckbox" className="text-sm text-white">
              Eu aceito os termos e condições
            </label>
          </div>

          <div className="h-6 flex items-center justify-center">
            {formMessage && (
              <p
                className={`text-center text-xs font-semibold ${
                  formMessage.includes("sucesso") ||
                  formMessage.includes("Bem-vindo")
                    ? "text-green-400"
                    : "text-red-400"
                } mt-2 mb-2`}
              >
                {formMessage}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-8 justify-center mt-2">
            <Button
              variant="contained"
              type="submit"
              className="!font-extrabold !rounded-full !bg-[#03a9c0] !py-4 !w-full"
            >
              Cadastrar
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center mt-4">
            <div className="w-full relative flex items-center justify-center ">
              <hr className="bg-white h-[1px] w-2/4 border-none" />
              <span className="font-light text-sm text-white px-5 text-nowrap">
                cadastrar com
              </span>
              <hr className="bg-white h-[1px] w-2/4 border-none" />
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="bg-white rounded-full p-2 flex items-center justify-center gap-2 hover:bg-gray-100"
              >
                <GoogleIcon className="text-black" />
              </button>
              <button
                type="button"
                onClick={handleAppleSignIn}
                className="bg-white rounded-full p-2 flex items-center justify-center gap-2 hover:bg-gray-100"
              >
                <AppleIcon className="text-black" />
              </button>
            </div>
          </div>
        </form>

        <div className="text-white text-sm text-center mt-4">
          <span>Já tem conta? </span>
          <Link to="/login">
            <a className="!font-bold">Entrar</a>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
