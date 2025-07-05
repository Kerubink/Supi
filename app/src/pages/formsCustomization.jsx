import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

import { auth, db } from "../config/firebaseconfig";

function FormsCustomization() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [setIsAuthReady] = useState(false);

  // Estados para o formulário multi-passos
  const [currentStep, setCurrentStep] = useState(0); // Começa no índice 0 para a nova tela inicial
  const totalSteps = 9; // Total de perguntas (8 perguntas + 1 tela inicial)

  const [formData, setFormData] = useState({
    objective: [],
    financialSituation: "",
    trackingFrequency: "",
    learningTopic: [],
    monthlyIncome: "",
    occupation: "",
    currentBalance: "",
    personalDescription: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userProfileRef = doc(
          db,
          `users/${user.uid}/user_profiles/profile`
        );

        try {
          const docSnap = await getDoc(userProfileRef);

          if (docSnap.exists() && docSnap.data().hasCompletedOnboardingForm) {
            navigate("/", { replace: true });
            return;
          } else if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              ...data,
              objective: data.objective || [],
              learningTopic: data.learningTopic || [],
              currentBalance:
                data.currentBalance !== undefined
                  ? data.currentBalance.toString()
                  : "",
              personalDescription: data.personalDescription || "",
            });
          }
          setLoading(false);
        } catch (error) {
          console.error("Erro ao carregar perfil do usuário:", error);
          setMessage(
            "Erro ao carregar suas informações. Por favor, tente novamente."
          );
          setLoading(false);
        }
      } else {
        setUserId(null);
        setLoading(false);
        navigate("/login", { replace: true });
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prevData) => {
      const currentValues = prevData[name];
      if (checked) {
        return {
          ...prevData,
          [name]: [...currentValues, value],
        };
      } else {
        return {
          ...prevData,
          [name]: currentValues.filter((item) => item !== value),
        };
      }
    });
  };

  // Função para avançar para o próximo passo
  const handleNextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, totalSteps - 1));
    setMessage("");
  };

  // Função para voltar para o passo anterior
  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
    setMessage("");
  };

  // Manipulador para o envio final do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage(
        "Erro: Usuário não autenticado ou banco de dados não disponível. Tente novamente mais tarde."
      );
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const userProfileRef = doc(db, `users/${userId}/user_profiles/profile`);
      const dataToSave = {
        ...formData,
        currentBalance:
          formData.currentBalance !== ""
            ? parseFloat(formData.currentBalance)
            : "",
        hasCompletedOnboardingForm: true,
      };
      await setDoc(userProfileRef, dataToSave, { merge: true });
      setMessage("Suas informações foram salvas com sucesso!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Erro ao salvar perfil do usuário:", error);
      setMessage(
        "Erro ao salvar suas informações. Por favor, tente novamente."
      );
    } finally {
      setSaving(false);
    }
  };

  // Renderiza o conteúdo do passo atual
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="bg-[#0b73db] flex-1 flex flex-col">
            <div>
              <img src="/bannerAnima2.gif" alt="banner" />
            </div>
            <div className="flex flex-1 flex-col items-start justify-center p-3">
              <h2 className="text-4xl font-extrabold text-white mb-4">
                Bem-vindo ao Supi!
              </h2>
              <p className="text-gray-300 text-lg">
                Para começar a otimizar suas finanças, precisamos de algumas
                informações rápidas.
              </p>
              <p className="text-gray-300 mt-2 text-lg">
                Isso nos ajudará a personalizar sua experiência e oferecer as
                melhores dicas para você.
              </p>
            </div>
          </div>
        );
      case 1: // Antigo Step 0
        return (
          <div>
            <img src="/Meta.svg" alt="" />
            <div className="p-2">
              <label className="block text-gray-700 font-semibold mb-2 text-md">
                1. Qual é o seu principal objetivo financeiro? (Selecione um ou
                mais)
              </label>
              <div className="flex flex-wrap justify-center select-none">
                {[
                  { value: "reserva", label: "Reserva" },
                  { value: "comprar_carro", label: "Carro" },
                  { value: "comprar_imovel", label: "Imóvel" },
                  { value: "investir", label: "Investir" },
                  { value: "quitar_dividas", label: "Quitar dívidas" },
                  { value: "viajar", label: "Viajar" },
                  { value: "estudar", label: "Estudos" },
                  { value: "empreender", label: "Negócio" },
                  { value: "reforma", label: "Reforma" },
                  { value: "filhos", label: "Filhos" },
                  { value: "casamento", label: "Casamento" },
                  { value: "outro", label: "Outro" },
                ].map((option) => (
                  <label key={option.value} className="m-[4px] group">
                    <input
                      type="checkbox"
                      id={`objective-${option.value}`}
                      name="objective"
                      value={option.value}
                      checked={formData.objective.includes(option.value)}
                      onChange={handleCheckboxChange}
                      className="sr-only peer"
                    />
                    <div
                      className="
            flex flex-col items-center justify-center
            w-[70px] min-h-[70px] rounded-lg border-2 border-[#b5bfd9] bg-white
            transition-all duration-150 ease-in-out cursor-pointer relative
            peer-checked:border-[#02a7c3] peer-checked:shadow-md
            hover:border-[#02a7c3]
            peer-checked:bg-[#02a7c3]
            text-[#707070]
            peer-checked:text-white
            peer-checked:font-bold
          "
                    >
                      <div className="text-center text-xs">{option.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <img src="/Situacao.svg" alt="" className="w-[412px] h-[412px]" />
            <div className="p-2">
              <label
                htmlFor="financialSituation"
                className="block text-gray-700 font-semibold mb-2 text-md"
              >
                2. Como você descreveria sua situação financeira atual?
              </label>
              <select
                id="financialSituation"
                name="financialSituation"
                value={formData.financialSituation}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 text-lg"
              >
                <option value="">Selecione uma opção</option>
                <option value="economizando">
                  Estou no azul e economizando
                </option>
                <option value="sobra_pouco">
                  Consigo pagar minhas contas mas não sobra muito
                </option>
                <option value="endividado">
                  Estou endividado e preciso de ajuda
                </option>
                <option value="otimizar_investimentos">
                  Tenho investimentos e busco otimizar
                </option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <img src="/Periodo.svg" alt="" className="w-[412px] h-[412px]" />
            <div className="p-2">
              <label
                htmlFor="trackingFrequency"
                className="block text-gray-700 font-semibold mb-2 text-md"
              >
                3. Com qual frequência você acompanha seus gastos e receitas?
              </label>
              <select
                id="trackingFrequency"
                name="trackingFrequency"
                value={formData.trackingFrequency}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 text-lg"
              >
                <option value="">Selecione uma frequência</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
                <option value="rarely">Raramente</option>
                <option value="never">Nunca</option>
              </select>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <img src="/objetivos.svg" alt="" className="w-[412px] h-[412px]" />
            <div className="p-2">
              <label className="block text-gray-700 font-semibold mb-2 text-md">
                4. Existe algum tópico sobre finanças que você gostaria de
                aprender ou melhorar? (Selecione um ou mais)
              </label>
              <div className="space-y-3">
                {[
                  { value: "investimentos", label: "Investimentos" },
                  { value: "orcamento_pessoal", label: "Orçamento pessoal" },
                  { value: "sair_dividas", label: "Como sair das dívidas" },
                  {
                    value: "planejamento_aposentadoria",
                    label: "Planejamento para aposentadoria",
                  },
                  {
                    value: "economia_compras",
                    label: "Economia para grandes compras",
                  },
                  { value: "impostos", label: "Impostos" },
                  { value: "outro_topico", label: "Outro" },
                ].map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`learningTopic-${option.value}`}
                      name="learningTopic"
                      value={option.value}
                      checked={formData.learningTopic.includes(option.value)}
                      onChange={handleCheckboxChange}
                      className="h-5 w-5 text-purple-600 rounded-md focus:ring-purple-500"
                    />
                    <label
                      htmlFor={`learningTopic-${option.value}`}
                      className="ml-3 text-lg text-gray-700 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 5: // Antigo Step 4
        return (
          <div>
            <img src="/Renda.svg" alt="" className="w-[412px] h-[412px]" />
            <div className="p-2">
              <label
                htmlFor="monthlyIncome"
                className="block text-gray-700 font-semibold mb-2 text-md"
              >
                5. Qual é a sua renda mensal aproximada (incluindo salário,
                mesada, etc.)?
              </label>
              <select
                id="monthlyIncome"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 text-lg"
              >
                <option value="">Selecione uma faixa</option>
                <option value="menos_de_1000">Até R$ 1.000</option>
                <option value="1000_3000">De R$ 1.001 a R$ 3.000</option>
                <option value="3001_5000">De R$ 3.001 a R$ 5.000</option>
                <option value="5001_10000">De R$ 5.001 a R$ 10.000</option>
                <option value="mais_de_10000">Acima de R$ 10.000</option>
              </select>
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <img src="/Ocupacao.svg" alt="" className="w-[412px] h-[412px]" />
            <div className="p-2">
              <label
                htmlFor="occupation"
                className="block text-gray-700 font-semibold mb-2 text-md"
              >
                6. Qual é a sua ocupação principal?
              </label>
              <select
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 text-lg"
              >
                <option value="">Selecione uma opção</option>
                <option value="estudante">Estudante</option>
                <option value="clt">Trabalhador CLT</option>
                <option value="autonomo">Autônomo/Freelancer</option>
                <option value="empresario">Empresário</option>
                <option value="desempregado">Desempregado</option>
                <option value="aposentado">Aposentado</option>
                <option value="outro_ocupacao">Outro</option>
              </select>
            </div>
          </div>
        );
      case 7:
        return (
          <div>
            <img src="/saldo.svg" alt="" className="w-[412px] h-[412px]" />
            <div className="p-2">
              <label
                htmlFor="currentBalance"
                className="block text-gray-700 font-semibold mb-2 text-md"
              >
                7. Qual é o seu saldo atual disponível para
                gastos/investimentos? (Ex: R$ 500.00)
              </label>
              <input
                type="number"
                id="currentBalance"
                name="currentBalance"
                value={formData.currentBalance}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Ex: 1500.00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 text-lg"
              />
            </div>
          </div>
        );
      case 8:
        return (
          <div>
            <img src="/sobre.svg" alt="" className="w-[412px] h-[412px]" />
            <div className="p-2">
              <label
                htmlFor="personalDescription"
                className="block text-gray-700 font-semibold mb-2 text-md"
              >
                8. Conte-nos um pouco mais sobre você, seus hobbies, interesses,
                ou o que você gostaria que o app soubesse para te ajudar melhor!
              </label>
              <textarea
                id="personalDescription"
                name="personalDescription"
                value={formData.personalDescription}
                onChange={handleChange}
                rows="5"
                required
                placeholder="Ex: Adoro filmes de ficção científica, especialmente Star Wars, e gosto de viajar..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 text-lg resize-y"
              ></textarea>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Carregando perfil do usuário...</p>
      </div>
    );
  }

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen  flex flex-col items-center justify-betweenx">
      <div className="w-full bg-gray-900 h-2.5">
        <div
          className="bg-[#02a7c3] h-2.5  transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="max-w-lg w-full flex flex-1 ">
        {message && (
          <div
            className={`p-3 mb-4 rounded-lg text-center ${
              message.includes("Erro")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            currentStep === totalSteps - 1 ? handleSubmit(e) : handleNextStep();
          }}
          className="flex flex-col w-full justify-between"
        >
          {renderStep()}

          <div className="flex ">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                className=" text-gray-400 border border-gray-400 font-bold p-3 m-5 h-15 w-15 rounded-full flex justify-center items-center"
              >
                <ArrowBackIosNewIcon />
              </button>
            )}

            {currentStep === 0 ? (
              <div className="flex-1 bg-[#0b73db] flex items-center justify-center p-10">
                <button
                  type="submit"
                  className="bg-white text-black font-bold p-4 h-20 w-20 rounded-full shadow-md"
                >
                  <ArrowForwardIosIcon />
                </button>
              </div>
            ) : currentStep < totalSteps - 1 ? (
              <button
                type="submit"
                className="ml-auto bg-[#02a7c3] text-white font-bold p-3 m-5 h-15 w-15 rounded-full flex justify-center items-center"
              >
                <ArrowForwardIosIcon />
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="ml-auto bg-[#8fbd02] text-white font-bold p-3 m-5 h-15 w-25 rounded-full flex justify-center items-center"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormsCustomization;