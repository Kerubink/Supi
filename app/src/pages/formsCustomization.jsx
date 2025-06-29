// formsCustomization.jsx
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; 
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom'; 

import { auth, db } from '../config/firebaseconfig'; 

function FormsCustomization() {
  const navigate = useNavigate(); 

  const [userId, setUserId] = useState(null);
  const [setIsAuthReady] = useState(false);

  const [currentStep, setCurrentStep] = useState(0); 
  const totalSteps = 8; 

  const [formData, setFormData] = useState({
    objective: [], 
    financialSituation: '',
    trackingFrequency: '',
    learningTopic: [], 
    monthlyIncome: '',
    occupation: '',
    currentBalance: '',
    personalDescription: '', 
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Efeito para observar o estad de autenticação e carregar o perfil do usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuário autenticado
        setUserId(user.uid);
        const userProfileRef = doc(db, `users/${user.uid}/user_profiles/profile`);

        try {
          // Verifica o documento do usuário para ver se o onboarding já foi concluído
          const docSnap = await getDoc(userProfileRef);

          if (docSnap.exists() && docSnap.data().hasCompletedOnboardingForm) {
            // Se o onboarding já foi concluído, redireciona para a página principal
            navigate('/', { replace: true });
            return; 
          } else if (docSnap.exists()) {
            // Se o documento existe, mas o onboarding NÃO foi concluído (ou flag é falsa/indefinida),
            // carrega os dados existentes do formulário
            const data = docSnap.data();
            setFormData({
              ...data,
              objective: data.objective || [],
              learningTopic: data.learningTopic || [],
              currentBalance: data.currentBalance !== undefined ? data.currentBalance.toString() : '',
              personalDescription: data.personalDescription || '',
            });
          }
          // Se o documento não existe, o formData inicial (vazio) será usado
          setLoading(false); 
        } catch (error) {
          console.error("Erro ao carregar perfil do usuário:", error);
          setMessage("Erro ao carregar suas informações. Por favor, tente novamente.");
          setLoading(false);
        }
      } else {
        // Usuário não autenticado
        setUserId(null);
        setLoading(false);
        navigate('/login', { replace: true });
      }
      setIsAuthReady(true); 
    });

    return () => unsubscribe();
  }, [navigate]); 

  // Manipulador para mudanças em inputs de texto/número e selects
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Manipulador para checkboxes (seleção múltipla)
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
    setMessage('');
  };

  // Função para voltar para o passo anterior
  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
    setMessage('');
  };

  // Manipulador para o envio final do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage("Erro: Usuário não autenticado ou banco de dados não disponível. Tente novamente mais tarde.");
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const userProfileRef = doc(db, `users/${userId}/user_profiles/profile`);
      const dataToSave = {
        ...formData,
        currentBalance: formData.currentBalance !== '' ? parseFloat(formData.currentBalance) : '',
        hasCompletedOnboardingForm: true, 
      };
      await setDoc(userProfileRef, dataToSave, { merge: true });
      setMessage("Suas informações foram salvas com sucesso!");
      navigate('/', { replace: true }); 
    } catch (error) {
      console.error("Erro ao salvar perfil do usuário:", error);
      setMessage("Erro ao salvar suas informações. Por favor, tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Renderiza o conteúdo do passo atual
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-xl">
              1. Qual é o seu principal objetivo(s) financeiro(s) no momento? (Selecione um ou mais)
            </label>
            <div className="space-y-3">
              {[
                { value: "reserva_emergencia", label: "Criar uma reserva de emergência" },
                { value: "comprar_imovel_carro", label: "Comprar um imóvel/carro" },
                { value: "investir_futuro", label: "Investir para o futuro" },
                { value: "quitar_dividas", label: "Quitar dívidas" },
                { value: "viajar", label: "Viajar" },
                { value: "aposentadoria", label: "Planejar a aposentadoria" },
                { value: "outro_objetivo", label: "Outro" },
              ].map((option) => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`objective-${option.value}`}
                    name="objective"
                    value={option.value}
                    checked={formData.objective.includes(option.value)}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-purple-600 rounded-md focus:ring-purple-500"
                  />
                  <label htmlFor={`objective-${option.value}`} className="ml-3 text-lg text-gray-700 cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <label htmlFor="financialSituation" className="block text-gray-700 font-semibold mb-2 text-xl">
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
              <option value="economizando">Estou no azul e economizando</option>
              <option value="sobra_pouco">Consigo pagar minhas contas mas não sobra muito</option>
              <option value="endividado">Estou endividado e preciso de ajuda</option>
              <option value="otimizar_investimentos">Tenho investimentos e busco otimizar</option>
            </select>
          </div>
        );
      case 2:
        return (
          <div>
            <label htmlFor="trackingFrequency" className="block text-gray-700 font-semibold mb-2 text-xl">
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
        );
      case 3:
        return (
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-xl">
              4. Existe algum tópico sobre finanças que você gostaria de aprender ou melhorar? (Selecione um ou mais)
            </label>
            <div className="space-y-3">
              {[
                { value: "investimentos", label: "Investimentos" },
                { value: "orcamento_pessoal", label: "Orçamento pessoal" },
                { value: "sair_dividas", label: "Como sair das dívidas" },
                { value: "planejamento_aposentadoria", label: "Planejamento para aposentadoria" },
                { value: "economia_compras", label: "Economia para grandes compras" },
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
                  <label htmlFor={`learningTopic-${option.value}`} className="ml-3 text-lg text-gray-700 cursor-pointer">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <label htmlFor="monthlyIncome" className="block text-gray-700 font-semibold mb-2 text-xl">
              5. Qual é a sua renda mensal aproximada (incluindo salário, mesada, etc.)?
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
        );
      case 5:
        return (
          <div>
            <label htmlFor="occupation" className="block text-gray-700 font-semibold mb-2 text-xl">
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
        );
      case 6:
        return (
          <div>
            <label htmlFor="currentBalance" className="block text-gray-700 font-semibold mb-2 text-xl">
              7. Qual é o seu saldo atual disponível para gastos/investimentos? (Ex: R$ 500.00)
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
        );
      case 7:
        return (
          <div>
            <label htmlFor="personalDescription" className="block text-gray-700 font-semibold mb-2 text-xl">
              8. Conte-nos um pouco mais sobre você, seus hobbies, interesses, ou o que você gostaria que o app soubesse para te ajudar melhor!
            </label>
            <textarea
              id="personalDescription"
              name="personalDescription"
              value={formData.personalDescription}
              onChange={handleChange}
              rows="5"
              placeholder="Ex: Adoro filmes de ficção científica, especialmente Star Wars, e gosto de viajar..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 text-lg resize-y"
            ></textarea>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4 font-inter">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full transform transition-all duration-300 hover:scale-[1.01]">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Vamos Personalizar Seu App!</h1>
        <p className="text-gray-600 mb-8 text-center">
          Para te ajudar da melhor forma, responda algumas perguntas rápidas sobre suas finanças.
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
          <div
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {message && (
          <div className={`p-3 mb-4 rounded-lg text-center ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={currentStep === totalSteps - 1 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
          {renderStep()}

          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePreviousStep}
                className="bg-gray-300 text-gray-800 font-bold p-3 rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Anterior
              </button>
            )}

            {currentStep < totalSteps - 1 ? (
              <button
                type="submit"
                className="ml-auto bg-purple-600 text-white font-bold p-3 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="ml-auto bg-purple-600 text-white font-bold p-3 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                {saving ? 'Salvando...' : 'Salvar Respostas'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormsCustomization;