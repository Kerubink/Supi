import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import CakeIcon from "@mui/icons-material/Cake";
import Button from "@mui/material/Button";
import { auth } from "../config/firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";

function RegisterPage() {
  const [fullName, setFullName] = useState(""); // Novo estado para nome completo
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    if (!termsAccepted) {
      alert("Você deve aceitar os termos e condições para se cadastrar!");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Cadastro realizado com sucesso!");
      navigate("/");
    } catch (error) {
      alert("Erro ao cadastrar: " + error.message);
      console.error("Erro no cadastro:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert("Cadastro/Login com Google realizado com sucesso!");
      navigate("/");
    } catch (error) {
      alert("Erro ao entrar com Google: " + error.message);
      console.error("Erro no login com Google:", error);
    }
  };

  const handleAppleSignIn = async () => {
    const provider = new OAuthProvider("apple.com");
    try {
      await signInWithPopup(auth, provider);
      alert("Cadastro/Login com Apple realizado com sucesso!");
      navigate("/");
    } catch (error) {
      alert("Erro ao entrar com Apple: " + error.message);
      console.error("Erro no login com Apple:", error);
    }
  };

  return (
    <section className="flex flex-col gap-15 items-center p-3 h-screen">
      <form
        className="flex flex-col gap-4 w-full px-6 bg-white rounded-lg"
        onSubmit={handleRegister}
      >
        <div>
          {" "}
          {/* Novo input para nome completo */}
          <div className="flex gap-1 items-center rounded-2xl bg-blue-200 px-3 duration-300 border-gray-400 group delay-200 ">
            <PersonIcon className="text-gray-500" />
            <input
              required
              className="flex-1 p-4  focus:outline-none"
              id="fullNameRegister"
              type="text"
              value={fullName}
              placeholder="Nome Completo"
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>
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
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
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
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
        </div>
        <div>
          <div className="flex gap-1 items-center rounded-2xl bg-blue-200 px-3 duration-300 border-gray-400 group delay-200 ">
            <LockIcon className="text-gray-500" />
            <input
              required
              className="flex-1 p-4  focus:outline-none"
              id="passwordRegister"
              type="password"
              value={password}
              placeholder="Senha"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div>
          <div className="flex gap-1 items-center rounded-2xl bg-blue-200 px-3 duration-300 border-gray-400 group delay-200 ">
            <LockIcon className="text-gray-500" />
            <input
              required
              className="flex-1 p-4  focus:outline-none"
              id="confirmPasswordRegister"
              type="password"
              value={confirmPassword}
              placeholder="Confirme sua senha"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="termsCheckbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="termsCheckbox" className="text-sm">
            Eu aceito os termos e condições
          </label>
        </div>

        <div className="flex flex-col items-center gap-8 justify-center mt-2">
          <Button
            variant="contained"
            type="submit"
            className="!font-bold !rounded-3xl !py-3 !w-2/4"
          >
            Cadastrar
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center mt-4">
          <div className="w-full relative flex flex-col items-center justify-center gap-2">
            <hr className="bg-black h-[1px] w-full border-none" />
            <span className="font-light text-md absolute bg-white px-3">
              cadastrar com
            </span>
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

      <Link to="/login">
        <Button className="!text-black !font-bold">Já tenho conta</Button>
      </Link>
    </section>
  );
}

export default RegisterPage;
