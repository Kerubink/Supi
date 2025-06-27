import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // <<< Importe useNavigate
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import AppleIcon from '@mui/icons-material/Apple';
import Button from "@mui/material/Button";
import { auth } from "../config/firebaseconfig"; // <<< Importe a configuração do Firebase
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth"; 
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login realizado com sucesso!");
      navigate("/");
    } catch (error) {
      alert("Erro ao fazer login: " + error.message);
      console.error("Erro no login:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert("Login com Google realizado com sucesso!");
      navigate("/");
    } catch (error) {
      alert("Erro ao entrar com Google: " + error.message);
      console.error("Erro no login com Google:", error);
    }
  };

  const handleFacebookSignIn = async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert("Login com Facebook realizado com sucesso!");
      navigate("/");
    } catch (error) {
      alert("Erro ao entrar com Facebook: " + error.message);
      console.error("Erro no login com Facebook:", error);
    }
  };

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <section className="flex flex-col justify-between gap-15 h-screen bg-[url('https://i.pinimg.com/736x/73/b4/02/73b402ebb849a547b6c318b5a878e4fd.jpg')] bg-cover bg-no-repeat bg-center bg-black">
      <h1 className="font-black text-xl cursor-pointer text-white p-1 text-center backdrop-blur-md bg-black/20 rounded-full w-18 m-1.5">Supi</h1>

      <div className="flex flex-col h-2/5 space-y-2.5 justify-end bg-gradient-to-t from-black via-gray-900 to-gray-800/5">
        <div className="text-white text-2xl font-extrabold p-3">
          <p>Controle seus gastos <br/> e aprenda se divertindo</p>
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
              onClick={handleFacebookSignIn}
              className="border border-white rounded-2xl p-3 flex items-center justify-center gap-2 hover:bg-gray-100/20"
            >
              <AppleIcon className="text-white" />
            </button>
          </div>
        </div>

        <div className=" p-3">
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
        <Box className="absolute top-1/2 left-1/2 w-10/12 h-2/5 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-xl shadow-lg">
          <form
            className="flex flex-col justify-end gap-4 w-full h-full px-6 bg-white rounded-lg"
            onSubmit={handleLogin}
          >
            <div>
              <div className="w-full h-12 relative flex rounded-xl">
                <input
                  required
                  className="peer w-full bg-transparent outline-none px-4 text-base rounded-xl border focus:border-[#4070f4] focus:shadow-md"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label
                  className="absolute text-gray-400 top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-5 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150"
                  htmlFor="email"
                >
                  Email
                </label>
              </div>
            </div>
            <div>
              <div className="w-full h-12 relative flex rounded-xl">
                <input
                  required
                  className="peer w-full bg-transparent outline-none px-4 text-base rounded-xl border focus:border-[#4070f4] focus:shadow-md"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label
                  className="absolute text-gray-400 top-1/2 translate-y-[-50%] bg-white left-4 px-2 peer-focus:top-0 peer-focus:left-5 font-light text-base peer-focus:text-sm peer-focus:text-[#4070f4] peer-valid:-top-0 peer-valid:left-3 peer-valid:text-sm peer-valid:text-[#4070f4] duration-150"
                  htmlFor="password"
                >
                  Senha
                </label>
              </div>
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
