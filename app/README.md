# Plataforma SUPI: Protótipo de Hackathon

Bem-vindo(a) ao repositório do protótipo da **Plataforma SUPI**, desenvolvido como parte do **Hackathon PWC + Fiap**. Este projeto representa uma solução inovadora em fase inicial, focada em ajudar os utilizadores a gerir as suas finanças pessoais de forma interativa e educativa.

## 🔎 Sobre o Projeto

A Plataforma SUPI é um protótipo concebido para demonstrar um conceito e explorar funcionalidades-chave dentro de um ambiente de desenvolvimento rápido. Nosso objetivo é proporcionar uma interface intuitiva para:

* Acompanhamento de finanças
* Aprendizado financeiro gamificado
* Interação com um assistente virtual

## ⚙️ Funcionalidades (Protótipo)

Este protótipo inclui as seguintes funcionalidades demonstrativas:

### Autenticação de Utilizador

* Registo e login com e-mail/senha, Google e Apple
* Recuperação de senha

### Personalização do Perfil

* Formulário de onboarding multi-etapas para recolher:

  * Informações financeiras
  * Preferências do utilizador (objetivos, situação financeira, rendimento, ocupação, saldo, etc.)

### Dashboard Principal

* Progresso financeiro (nível, XP)
* Calendário semanal
* Exercícios financeiros sugeridos com base nos interesses do utilizador

### Gestão de Finanças

* Visualização do saldo geral
* Resumo de receitas e despesas mensais
* Acompanhamento de metas com progresso circular
* Gráfico de despesas por categoria (gráfico de pizza)
* Histórico de transações
* Digitalização de QR code para importação de dados
* Modal para seleção de meses anteriores

### Trilhas de Aprendizagem

* Trilhas gamificadas com aulas e atividades
* Ganha XP e sobe de nível
* Trilhas são desbloqueadas conforme o nível do utilizador

### Chatbot Financeiro (Supinha)

* Assistente virtual com ajuda financeira personalizada
* Respostas com base no perfil do utilizador

### Perfil do Utilizador

* Exibição de saldo atual e distintivos de nível
* Configurações de conta, segurança, notificações, idioma e assinatura
* Instalação como PWA
* Logout

> **Observação:** Algumas funcionalidades podem estar limitadas ou funcionar apenas como demonstração, não refletindo a versão final.

## ⚠️ Aviso Importante para Testadores

Como este é um protótipo de hackathon, pedimos atenção para:

* **Instabilidades (Bugs):** Pode haver erros ou comportamentos inesperados
* **Dados Temporários:** Não insera informações sensíveis; os dados serão apagados após o hackathon

Seu feedback é **inestimável** para nos ajudar a validar o conceito e melhorar a plataforma!

## 🚀 Tecnologias Utilizadas

* **Frontend:** React.js
* **Estilização:** Tailwind CSS
* **Navegação:** React Router DOM
* **Estado:** React Context API, useState/useEffect
* **Autenticação e Banco de Dados:** Firebase (Auth, Firestore)
* **Gráficos:** Recharts
* **Ícones:** Material-UI (MUI) Icons
* **Assistente Virtual:** Gemini API
* **Armazenamento Local:** localStorage

## 📁 Como Rodar o Projeto Localmente

1. **Clone o repositório:**

```bash
git clone https://github.com/Kerubink/Supi.git
cd [nome-do-repositorio]
```

2. **Instale as dependências:**

```bash
npm install
# ou
yarn install
```

3. **Inicie o servidor de desenvolvimento:**

```bash
npm start
# ou
yarn start
```

4. A aplicação estará disponível em `http://localhost:5173`

## 📧 Contato

Para dúvidas, sugestões ou feedback, entre em contato com a **Equipe de Desenvolvimento SUPI**.

Agradecemos o seu interesse e contribuição para o projeto SUPI!
